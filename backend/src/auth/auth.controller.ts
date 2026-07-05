import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户登录接口
   *
   * POST /api/auth/login
   *
   * 请求体：
   * { "username": "zhangsan", "password": "123456" }
   *
   * 成功响应：
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIs...",
   *   "user": { "id": 1, "username": "zhangsan", "role": "student" }
   * }
   *
   * AuthGuard('local') 会：
   * 1. 触发 LocalStrategy.validate()
   * 2. 验证通过 → req.user = { id, username, role }
   * 3. 验证失败 → 401 Unauthorized
   */
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  /**
   * 获取当前用户信息（需携带 Token）
   *
   * GET /api/auth/profile
   *
   * Header: Authorization: Bearer <token>
   *
   * AuthGuard('jwt') 会：
   * 1. 提取并验证 Token
   * 2. 解码 payload，调用 JwtStrategy.validate()
   * 3. req.user = { id, username, role }
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  /**
   * 管理员测试端点 —— 仅 admin 可访问
   *
   * GET /api/auth/admin-test
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('admin-test')
  adminTest(@Request() req: any) {
    return {
      message: '你拥有管理员权限',
      user: req.user,
    };
  }

  /**
   * 教师测试端点 —— admin + teacher 可访问
   *
   * GET /api/auth/teacher-test
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'teacher')
  @Get('teacher-test')
  teacherTest(@Request() req: any) {
    return {
      message: '你拥有教师或管理员权限',
      user: req.user,
    };
  }

  /**
   * 学生测试端点 —— 所有角色可访问
   *
   * GET /api/auth/student-test
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'teacher', 'student')
  @Get('student-test')
  studentTest(@Request() req: any) {
    return {
      message: '你拥有平台访问权限',
      user: req.user,
    };
  }
}
