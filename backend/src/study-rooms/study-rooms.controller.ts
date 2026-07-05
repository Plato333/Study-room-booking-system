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
import { CreateStudyRoomDto } from './dto/create-study-room.dto';
import { UpdateStudyRoomDto } from './dto/update-study-room.dto';
import { StudyRoomsService } from './study-rooms.service';

@Controller('api/study-rooms')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StudyRoomsController {
  constructor(private readonly studyRoomsService: StudyRoomsService) {}

  @Roles('admin', 'student')
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.studyRoomsService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
  }

  @Roles('admin', 'student')
  @Get('open')
  async findAllOpen() {
    return this.studyRoomsService.findAllOpen();
  }

  @Roles('admin')
  @Post()
  async create(@Body() dto: CreateStudyRoomDto) {
    return this.studyRoomsService.create(dto);
  }

  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.studyRoomsService.findOne(Number(id));
  }

  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateStudyRoomDto) {
    return this.studyRoomsService.update(Number(id), dto);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.studyRoomsService.remove(Number(id));
  }
}
