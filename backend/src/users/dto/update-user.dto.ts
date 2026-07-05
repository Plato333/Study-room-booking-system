import { IsString, IsOptional, IsIn } from 'class-validator';
import { UserRole } from '../entities/user.entity';

/**
 * 更新用户 DTO —— 所有字段可选，只更新传了的字段
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  @IsIn([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT], {
    message: `角色必须是 ${UserRole.ADMIN}、${UserRole.TEACHER} 或 ${UserRole.STUDENT}`,
  })
  role?: UserRole;

  @IsOptional()
  @IsString()
  password?: string;
}
