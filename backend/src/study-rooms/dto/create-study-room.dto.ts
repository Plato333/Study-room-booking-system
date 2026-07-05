import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStudyRoomDto {
  @IsString({ message: '自习室名称必须是字符串' })
  @MinLength(2, { message: '自习室名称至少 2 个字符' })
  @MaxLength(100, { message: '自习室名称最多 100 个字符' })
  name: string;

  @IsString({ message: '位置必须是字符串' })
  @MaxLength(200, { message: '位置最多 200 个字符' })
  location: string;

  @IsString({ message: '开放时间必须是字符串' })
  open_time: string;

  @IsString({ message: '关闭时间必须是字符串' })
  close_time: string;

  @IsOptional()
  @IsIn(['open', 'closed'], { message: '状态必须是 open 或 closed' })
  status?: string;
}
