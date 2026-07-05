import { IsDateString, IsInt, IsString, Min } from 'class-validator';

export class CreateReservationDto {
  @IsInt({ message: '座位ID必须是整数' })
  @Min(1, { message: '座位ID必须大于0' })
  seat_id: number;

  @IsDateString({}, { message: '日期格式无效' })
  date: string;

  @IsString({ message: '开始时间必须是字符串' })
  start_time: string;

  @IsString({ message: '结束时间必须是字符串' })
  end_time: string;
}
