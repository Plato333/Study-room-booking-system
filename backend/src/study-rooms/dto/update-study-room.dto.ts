import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateStudyRoomDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsString()
  open_time?: string;

  @IsOptional()
  @IsString()
  close_time?: string;

  @IsOptional()
  @IsIn(['open', 'closed'], { message: '状态必须是 open 或 closed' })
  status?: string;
}
