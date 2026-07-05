import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudyRoom } from '../../study-rooms/entities/study-room.entity';

export enum SeatStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
}

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StudyRoom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: StudyRoom;

  @Column({ type: 'int', comment: '自习室ID' })
  room_id: number;

  @Column({ type: 'varchar', length: 20, comment: '座位编号' })
  seat_number: string;

  @Column({
    type: 'enum',
    enum: SeatStatus,
    default: SeatStatus.AVAILABLE,
    comment: '状态：available-空闲，occupied-占用，maintenance-维护',
  })
  status: SeatStatus;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;
}
