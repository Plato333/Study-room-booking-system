import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * 创建用户 DTO
 *
 * class-validator 装饰器说明：
 * - @IsString()    → 必须是字符串类型
 * - @MinLength(3)  → 最小长度 3 个字符
 * - @MaxLength(20) → 最大长度 20 个字符
 */
export class CreateUserDto {
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名至少 3 个字符' })
  @MaxLength(20, { message: '用户名最多 20 个字符' })
  username: string;

  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码至少 6 个字符' })
  @MaxLength(50, { message: '密码最多 50 个字符' })
  password: string;

  @IsOptional()
  @IsIn(['admin', 'teacher', 'student'], { message: '角色只能是 admin、teacher 或 student' })
  role?: string;
}
