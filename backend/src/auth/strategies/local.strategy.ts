import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

/**
 * Local 策略 —— 处理「用户名 + 密码」登录
 *
 * passport-local 默认从请求体中读取 username 和 password 字段
 * 如果前端传的字段名不同（比如 email），可以通过 options 指定
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',  // 请求体中的用户名字段名
      passwordField: 'password',  // 请求体中的密码字段名
    });
  }

  /**
   * validate 方法会被 Passport 自动调用
   *
   * @param username 请求体中的用户名（由 usernameField 指定）
   * @param password 请求体中的密码
   * @returns 验证通过后，返回值会被挂载到 req.user 上
   */
  async validate(username: string, password: string) {
    return this.authService.validateUser(username, password);
  }
}
