import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Seat } from '../seats/entities/seat.entity';
import { StudyRoom } from '../study-rooms/entities/study-room.entity';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Seat, StudyRoom])],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
