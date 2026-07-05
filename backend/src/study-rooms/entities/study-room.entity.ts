import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StudyRoomStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Entity('study_rooms')
export class StudyRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '自习室名称' })
  name: string;

  @Column({ type: 'varchar', length: 200, comment: '位置' })
  location: string;

  @Column({ type: 'time', comment: '开放时间' })
  open_time: string;

  @Column({ type: 'time', comment: '关闭时间' })
  close_time: string;

  @Column({
    type: 'enum',
    enum: StudyRoomStatus,
    default: StudyRoomStatus.OPEN,
    comment: '状态：open-开放，closed-关闭',
  })
  status: StudyRoomStatus;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;
}
