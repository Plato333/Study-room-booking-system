import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ReservationStatus } from '../reservations/entities/reservation.entity';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { Seat, SeatStatus } from './entities/seat.entity';

@Injectable()
export class SeatsService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  async findByRoom(roomId: number, page = 1, limit = 50) {
    const [items, total] = await this.seatRepository.findAndCount({
      where: { room_id: roomId } as any,
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
    });

    return { items, total, page, limit };
  }

  /** 查询指定时段内的空闲座位 */
  async findAvailable(date: string, startTime: string, endTime: string, roomId?: number) {
    const qb = this.seatRepository
      .createQueryBuilder('seat')
      .innerJoinAndSelect('seat.room', 'room')
      .where('room.status = :roomStatus', { roomStatus: 'open' })
      .andWhere('seat.status = :seatStatus', { seatStatus: SeatStatus.AVAILABLE });

    if (roomId) {
      qb.andWhere('seat.room_id = :roomId', { roomId });
    }

    // 排除已有未取消预约且时间段冲突的座位
    qb.andWhere(
      `seat.id NOT IN (
        SELECT r.seat_id FROM reservations r
        WHERE r.date = :date
          AND r.status != :cancelledStatus
          AND r.start_time < :endTime
          AND r.end_time > :startTime
      )`,
      {
        date,
        cancelledStatus: ReservationStatus.CANCELLED,
        endTime,
        startTime,
      },
    );

    return qb.orderBy('room.id', 'ASC').addOrderBy('seat.id', 'ASC').getMany();
  }

  async create(dto: CreateSeatDto) {
    const seat = this.seatRepository.create(dto as any);
    return this.seatRepository.save(seat);
  }

  async createBatch(roomId: number, seatNumbers: string[]) {
    const seats = seatNumbers.map((num) => ({
      room_id: roomId,
      seat_number: num,
    }));
    return this.seatRepository.save(seats as any);
  }

  async findOne(id: number) {
    const seat = await this.seatRepository.findOne({
      where: { id } as any,
      relations: { room: true },
    });
    if (!seat) {
      throw new NotFoundException('座位不存在');
    }
    return seat;
  }

  async update(id: number, dto: UpdateSeatDto) {
    await this.findOne(id);
    await this.seatRepository.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.seatRepository.delete(id);
    return { message: '删除成功' };
  }
}
