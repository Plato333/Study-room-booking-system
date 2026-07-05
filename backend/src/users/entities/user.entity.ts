import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 50, unique: true, comment: '用户名' })
  username: string

  @Column({ type: 'varchar', length: 255, comment: '加密后的密码' })
  password: string

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
    comment: '用户角色',
  })
  role: UserRole

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date
}
