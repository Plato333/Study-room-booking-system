import { IsString, MinLength, MaxLength } from 'class-validator';

export class AiChatDto {
  @IsString({ message: '消息必须是字符串' })
  @MinLength(1, { message: '消息不能为空' })
  @MaxLength(500, { message: '消息最多 500 个字符' })
  message: string;
}
