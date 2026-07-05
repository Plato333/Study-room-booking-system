import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ReservationsService } from './reservations/reservations.service';
import * as QRCode from 'qrcode';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly reservationsService: ReservationsService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/seats/:seatId/qrcode')
  async getSeatQrcode(@Param('seatId') seatId: number, @Res() res: Response) {
    const code = this.reservationsService.generateSeatCode(Number(seatId));
    const dataUrl = await QRCode.toDataURL(code, { width: 256, margin: 2 });
    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  }
}
