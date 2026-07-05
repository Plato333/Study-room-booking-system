import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyRoom } from './entities/study-room.entity';
import { StudyRoomsController } from './study-rooms.controller';
import { StudyRoomsService } from './study-rooms.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudyRoom])],
  controllers: [StudyRoomsController],
  providers: [StudyRoomsService],
  exports: [StudyRoomsService],
})
export class StudyRoomsModule {}
