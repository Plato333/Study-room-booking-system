import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // 导入 UsersModule —— 需要使用 UsersService 查数据库
    UsersModule,

    // Passport 模块
    PassportModule,

    // JWT 模块 —— 异步注册，从 .env 读取配置
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'rainier-jwt-secret',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ?? '7d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RolesGuard],
  exports: [RolesGuard],
})
export class AuthModule {}
