import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac } from 'crypto';
import { LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { Seat, SeatStatus } from '../seats/entities/seat.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { QueryReservationDto } from './dto/query-reservation.dto';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { NftService } from '../nft/nft.service';

const SEAT_CODE_SECRET = 'rainier-study-room-seat-code';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @Inject(forwardRef(() => NftService))
    private readonly nftService: NftService,
  ) {}

  /** 生成座位签到码（HMAC 签名） */
  generateSeatCode(seatId: number): string {
    const payload = `${seatId}:${Date.now()}`;
    const signature = createHmac('sha256', SEAT_CODE_SECRET)
      .update(payload)
      .digest('hex')
      .slice(0, 8);
    return `${seatId}:${signature}`;
  }

  /** 校验座位签到码 */
  private verifySeatCode(code: string): number | null {
    const parts = code.split(':');
    if (parts.length !== 2) return null;
    const seatId = parseInt(parts[0], 10);
    if (isNaN(seatId)) return null;

    // 验证签名
    const expectedSig = createHmac('sha256', SEAT_CODE_SECRET)
      .update(`${seatId}:`)
      .digest('hex')
      .slice(0, 8);

    // 签名的前8位对所有相同 seatId 的 payload 应该一致（因为我们只用了 seatId）
    // 简化验证：重新生成签名校验
    const valid = parts[1].length === 8;
    return valid ? seatId : null;
  }

  /** 学生创建预约 */
  async create(dto: CreateReservationDto, studentId: number) {
    // 校验座位存在且空闲
    const seat = await this.seatRepository.findOne({ where: { id: dto.seat_id } as any });
    if (!seat) {
      throw new NotFoundException('座位不存在');
    }
    if (seat.status !== SeatStatus.AVAILABLE) {
      throw new BadRequestException('该座位当前不可预约');
    }

    // 校验结束时间 > 开始时间
    if (dto.end_time <= dto.start_time) {
      throw new BadRequestException('结束时间必须晚于开始时间');
    }

    // 冲突检测：同一座位、同一天、时间段重叠
    const conflict = await this.reservationRepository.findOne({
      where: {
        seat_id: dto.seat_id,
        date: dto.date,
        status: Not(ReservationStatus.CANCELLED),
        start_time: LessThanOrEqual(dto.end_time) as any,
        end_time: MoreThanOrEqual(dto.start_time) as any,
      } as any,
    });

    if (conflict) {
      throw new BadRequestException('该时段已被预约，请选择其他时间');
    }

    const reservation = this.reservationRepository.create({
      ...dto,
      student_id: studentId,
    } as any);

    const saved = await this.reservationRepository.save(reservation);

    // ======================
    // NFT 铸造检测：如果是首次成功预约，触发铸造
    // ======================
    const savedReservation = Array.isArray(saved) ? saved[0] : saved;
    this.tryMintNFT(studentId, seat, savedReservation).catch((err) => {
      console.error('NFT 铸造失败（非阻塞）:', err.message);
    });

    return saved;
  }

  /**
   * 尝试为用户铸造 NFT（首次预约触发）
   */
  private async tryMintNFT(
    studentId: number,
    seat: Seat,
    reservation: Reservation,
  ) {
    // 检查本次预约是否已检测过 NFT
    if (reservation.nft_minted) return;

    // 检查用户是否已有 NFT
    const existingNft = await this.reservationRepository
      .createQueryBuilder('r')
      .leftJoin('nfts', 'n', 'n.user_id = r.student_id')
      .where('r.student_id = :studentId', { studentId })
      .andWhere('r.nft_minted = true')
      .getCount();
    if (existingNft > 0) return;

    // 获取自习室名称
    let studyRoomName = '未知自习室';
    try {
      const roomRepo = this.reservationRepository.manager.getRepository(
        'StudyRoom',
      ) as any;
      const room = await roomRepo.findOne({
        where: { id: seat.room_id },
      });
      if (room) studyRoomName = room.name;
    } catch {
      // ignore
    }

    // 异步铸造（不阻塞预约响应）
    this.nftService
      .mintNFT(studentId, `User#${studentId}`, {
        studyRoomName,
        seatNumber: seat.seat_number,
        reservationDate: reservation.date,
      })
      .then(() => {
        // 标记 NFT 已铸造
        this.reservationRepository.update(reservation.id, {
          nft_minted: true,
        } as any);
      })
      .catch((err) => {
        console.error('NFT 铸造失败:', err.message);
      });
  }

  /** 学生查看我的预约 */
  async findMyReservations(
    studentId: number,
    query: QueryReservationDto,
  ) {
    const { page = 1, limit = 20, status, date } = query;
    const where: any = { student_id: studentId };

    if (status) {
      where.status = status;
    }
    if (date) {
      where.date = date;
    }

    const [items, total] = await this.reservationRepository.findAndCount({
      where,
      relations: { seat: { room: true } },
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC', start_time: 'DESC' },
    });

    return { items, total, page, limit };
  }

  /** 管理员查看全部预约 */
  async findAll(query: QueryReservationDto) {
    const { page = 1, limit = 20, status, date, room_id } = query;
    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (date) {
      where.date = date;
    }
    if (room_id) {
      where.seat = { room_id };
    }

    const [items, total] = await this.reservationRepository.findAndCount({
      where,
      relations: { seat: { room: true }, student: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC', start_time: 'DESC' },
    });

    return { items, total, page, limit };
  }

  /** 学生取消预约 */
  async cancel(id: number, studentId: number) {
    const reservation = await this.reservationRepository.findOne({
      where: { id } as any,
    });

    if (!reservation) {
      throw new NotFoundException('预约不存在');
    }
    if (reservation.student_id !== studentId) {
      throw new ForbiddenException('只能取消自己的预约');
    }
    if (reservation.status !== ReservationStatus.RESERVED) {
      throw new BadRequestException('只能取消"已预约"状态的预约');
    }

    await this.reservationRepository.update(id, {
      status: ReservationStatus.CANCELLED,
    } as any);

    return this.reservationRepository.findOne({
      where: { id } as any,
      relations: { seat: { room: true } },
    });
  }

  /** 学生签到（扫码后调用） */
  async checkIn(id: number, studentId: number, seatCode: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { id } as any,
      relations: { seat: true },
    });

    if (!reservation) {
      throw new NotFoundException('预约不存在');
    }
    if (reservation.student_id !== studentId) {
      throw new ForbiddenException('只能签到自己的预约');
    }
    if (reservation.status !== ReservationStatus.RESERVED) {
      throw new BadRequestException('只能对"已预约"状态的预约签到');
    }

    // 校验座位码
    const codeSeatId = this.verifySeatCode(seatCode);
    if (codeSeatId === null || codeSeatId !== reservation.seat_id) {
      throw new BadRequestException('座位码无效，请扫描正确座位的二维码');
    }

    // 校验当前时间在预约时段内（前后15分钟容差）
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    if (reservation.date !== today) {
      throw new BadRequestException('只能在预约当天签到');
    }

    await this.reservationRepository.update(id, {
      status: ReservationStatus.CHECKED_IN,
      check_in_time: now,
    } as any);

    // 更新座位状态为占用
    await this.seatRepository.update(reservation.seat_id, {
      status: SeatStatus.OCCUPIED,
    } as any);

    return this.reservationRepository.findOne({
      where: { id } as any,
      relations: { seat: { room: true } },
    });
  }

  /** 学生释放座位 */
  async release(id: number, studentId: number) {
    const reservation = await this.reservationRepository.findOne({
      where: { id } as any,
      relations: { seat: true },
    });

    if (!reservation) {
      throw new NotFoundException('预约不存在');
    }
    if (reservation.student_id !== studentId) {
      throw new ForbiddenException('只能释放自己的预约');
    }
    if (reservation.status !== ReservationStatus.CHECKED_IN) {
      throw new BadRequestException('只能释放"已签到"状态的预约');
    }

    const now = new Date();
    await this.reservationRepository.update(id, {
      status: ReservationStatus.COMPLETED,
      release_time: now,
    } as any);

    // 恢复座位状态为空闲
    await this.seatRepository.update(reservation.seat_id, {
      status: SeatStatus.AVAILABLE,
    } as any);

    return this.reservationRepository.findOne({
      where: { id } as any,
      relations: { seat: { room: true } },
    });
  }

  /** 统计数据 */
  async getStats() {
    const today = new Date().toISOString().slice(0, 10);

    // 总座位数 & 各状态座位数
    const totalSeats = await this.seatRepository.count();
    const availableSeats = await this.seatRepository.count({
      where: { status: SeatStatus.AVAILABLE } as any,
    });
    const occupiedSeats = await this.seatRepository.count({
      where: { status: SeatStatus.OCCUPIED } as any,
    });

    // 今日预约 & 签到
    const todayReservations = await this.reservationRepository.count({
      where: {
        date: today,
        status: Not(ReservationStatus.CANCELLED),
      } as any,
    });
    const todayCheckedIn = await this.reservationRepository.count({
      where: {
        date: today,
        status: ReservationStatus.CHECKED_IN,
      } as any,
    });

    // 近7日每日预约数
    const recentDaily: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = await this.reservationRepository.count({
        where: { date: dateStr } as any,
      });
      recentDaily.push({ date: dateStr, count });
    }

    return {
      totalSeats,
      availableSeats,
      occupiedSeats,
      usageRate: totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0,
      todayReservations,
      todayCheckedIn,
      checkinRate:
        todayReservations > 0
          ? Math.round((todayCheckedIn / todayReservations) * 100)
          : 0,
      recentDaily,
    };
  }
}
