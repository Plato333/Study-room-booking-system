import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 验证用户凭证 —— 用户名 + 密码是否正确
   * 供 LocalStrategy 调用
   */
  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // bcrypt.compare：用存储的密文中提取的盐值，对输入的密码重新计算，比对结果
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 返回用户信息（不包含密码）
    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }

  /**
   * 签发 JWT Token
   * 在 validateUser 通过后调用
   */
  async login(user: { id: number; username: string; role: string }) {
    const payload = {
      sub: user.id,        // JWT 标准字段：subject（主体标识）
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * 获取用户 Profile（供 JWT 认证后使用）
   */
  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
