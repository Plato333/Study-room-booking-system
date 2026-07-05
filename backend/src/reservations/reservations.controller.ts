import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';

@Controller('api')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Roles('admin')
  @Get('seats/:seatId/seat-code')
  async getSeatCode(@Param('seatId') seatId: number) {
    return { code: this.reservationsService.generateSeatCode(Number(seatId)) };
  }

  @Roles('student')
  @Post('reservations')
  async create(@Body() dto: CreateReservationDto, @Request() req: any) {
    return this.reservationsService.create(dto, req.user.id);
  }

  @Roles('student')
  @Get('reservations/my')
  async findMyReservations(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    return this.reservationsService.findMyReservations(req.user.id, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status,
      date,
    });
  }

  @Roles('admin')
  @Get('reservations')
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('date') date?: string,
    @Query('room_id') room_id?: number,
  ) {
    return this.reservationsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status,
      date,
      room_id: room_id ? Number(room_id) : undefined,
    });
  }

  @Roles('student')
  @Delete('reservations/:id')
  async cancel(@Param('id') id: number, @Request() req: any) {
    return this.reservationsService.cancel(Number(id), req.user.id);
  }

  @Roles('student')
  @Post('reservations/:id/check-in')
  async checkIn(
    @Param('id') id: number,
    @Body('seat_code') seatCode: string,
    @Request() req: any,
  ) {
    return this.reservationsService.checkIn(Number(id), req.user.id, seatCode);
  }

  @Roles('student')
  @Post('reservations/:id/release')
  async release(@Param('id') id: number, @Request() req: any) {
    return this.reservationsService.release(Number(id), req.user.id);
  }

  @Roles('admin')
  @Get('reservations/stats')
  async getStats() {
    return this.reservationsService.getStats();
  }
}
