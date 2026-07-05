import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSeatDto {
  @IsInt({ message: '自习室ID必须是整数' })
  @Min(1, { message: '自习室ID必须大于0' })
  room_id: number;

  @IsString({ message: '座位编号必须是字符串' })
  @MaxLength(20, { message: '座位编号最多 20 个字符' })
  seat_number: string;

  @IsOptional()
  @IsIn(['available', 'occupied', 'maintenance'], {
    message: '状态必须是 available、occupied 或 maintenance',
  })
  status?: string;
}
