import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * JWT 策略 —— 处理「Bearer Token」认证
 *
 * 流程：
 * 1. 从请求头 Authorization: Bearer <token> 中提取 Token
 * 2. 使用 JWT_SECRET 验证签名
 * 3. 解码 payload，调用 validate 方法
 * 4. validate 返回值挂载到 req.user 上
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      // Token 从哪里提取 —— 从 Authorization: Bearer xxx 头中
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 是否忽略过期 Token（false = 过期 Token 会被拒绝）
      ignoreExpiration: false,
      // JWT 签名密钥（和签发时一致）
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'rainier-jwt-secret',
    });
  }

  /**
   * validate 方法会被 Passport 自动调用
   *
   * @param payload JWT 解码后的 payload（login 时签发的 { sub, username, role }）
   * @returns 返回值挂载到 req.user
   */
  async validate(payload: { sub: number; username: string; role: string }) {
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
