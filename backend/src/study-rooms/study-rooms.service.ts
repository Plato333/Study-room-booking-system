import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateStudyRoomDto } from './dto/create-study-room.dto';
import { UpdateStudyRoomDto } from './dto/update-study-room.dto';
import { StudyRoom, StudyRoomStatus } from './entities/study-room.entity';

@Injectable()
export class StudyRoomsService {
  constructor(
    @InjectRepository(StudyRoom)
    private readonly studyRoomRepository: Repository<StudyRoom>,
  ) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const where: any = {};
    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [items, total] = await this.studyRoomRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return { items, total, page, limit };
  }

  async findAllOpen() {
    return this.studyRoomRepository.find({
      where: { status: StudyRoomStatus.OPEN },
      order: { id: 'ASC' },
    });
  }

  async create(dto: CreateStudyRoomDto) {
    const room = this.studyRoomRepository.create(dto as any);
    return this.studyRoomRepository.save(room);
  }

  async findOne(id: number) {
    const room = await this.studyRoomRepository.findOne({ where: { id } as any });
    if (!room) {
      throw new NotFoundException('自习室不存在');
    }
    return room;
  }

  async update(id: number, dto: UpdateStudyRoomDto) {
    await this.findOne(id);
    await this.studyRoomRepository.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.studyRoomRepository.delete(id);
    return { message: '删除成功' };
  }
}
