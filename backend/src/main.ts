import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用 CORS，允许前端跨域请求
  app.enableCors();

  // 全局验证管道 —— 自动校验请求参数（DTO 装饰器）
  // whitelist: true —— 自动剔除 DTO 中未定义的字段
  // forbidNonWhitelisted: true —— 传入未定义字段时直接报 400 错误
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
