import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Seat } from '../../seats/entities/seat.entity';

export enum ReservationStatus {
  RESERVED = 'reserved',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ type: 'int', comment: '学生ID' })
  student_id: number;

  @ManyToOne(() => Seat)
  @JoinColumn({ name: 'seat_id' })
  seat: Seat;

  @Column({ type: 'int', comment: '座位ID' })
  seat_id: number;

  @Column({ type: 'date', comment: '预约日期' })
  date: string;

  @Column({ type: 'time', comment: '开始时间' })
  start_time: string;

  @Column({ type: 'time', comment: '结束时间' })
  end_time: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.RESERVED,
    comment: '状态：reserved-已预约，checked_in-已签到，completed-已完成，cancelled-已取消',
  })
  status: ReservationStatus;

  @Column({ type: 'datetime', nullable: true, comment: '签到时间' })
  check_in_time: Date | null;

  @Column({ type: 'datetime', nullable: true, comment: '释放时间' })
  release_time: Date | null;

  @Column({ type: 'boolean', default: false, comment: '是否已触发 NFT 铸造' })
  nft_minted: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;
}
