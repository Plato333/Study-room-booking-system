import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { SeatsService } from './seats.service';

@Controller('api')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Roles('admin')
  @Get('study-rooms/:roomId/seats')
  async findByRoom(
    @Param('roomId') roomId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.seatsService.findByRoom(
      Number(roomId),
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }

  @Roles('student')
  @Get('seats/available')
  async findAvailable(
    @Query('date') date: string,
    @Query('start_time') startTime: string,
    @Query('end_time') endTime: string,
    @Query('room_id') roomId?: number,
  ) {
    return this.seatsService.findAvailable(
      date,
      startTime,
      endTime,
      roomId ? Number(roomId) : undefined,
    );
  }

  @Roles('admin')
  @Post('study-rooms/:roomId/seats')
  async create(
    @Param('roomId') roomId: number,
    @Body() dto: CreateSeatDto,
  ) {
    return this.seatsService.create({ ...dto, room_id: Number(roomId) });
  }

  @Roles('admin')
  @Post('study-rooms/:roomId/seats/batch')
  async createBatch(
    @Param('roomId') roomId: number,
    @Body('seat_numbers') seatNumbers: string[],
  ) {
    return this.seatsService.createBatch(Number(roomId), seatNumbers);
  }

  @Roles('admin')
  @Put('seats/:id')
  async update(@Param('id') id: number, @Body() dto: UpdateSeatDto) {
    return this.seatsService.update(Number(id), dto);
  }

  @Roles('admin')
  @Delete('seats/:id')
  async remove(@Param('id') id: number) {
    return this.seatsService.remove(Number(id));
  }
}
