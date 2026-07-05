import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class QueryReservationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsIn(['reserved', 'checked_in', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsDateString({}, { message: '日期格式无效' })
  date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  room_id?: number;
}
