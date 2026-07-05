import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateSeatDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  room_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  seat_number?: string;

  @IsOptional()
  @IsIn(['available', 'occupied', 'maintenance'], {
    message: '状态必须是 available、occupied 或 maintenance',
  })
  status?: string;
}
