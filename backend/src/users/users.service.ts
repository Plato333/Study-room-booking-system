import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 用户注册
   *
   * 流程：
   * 1. 检查用户名是否已存在 → 存在则返回 409
   * 2. bcrypt 哈希密码（10 轮盐值加密）
   * 3. 保存用户到数据库（默认角色：student）
   * 4. 返回用户信息（不含密码）
   */
  async register(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;

    // 1. 检查用户名唯一性
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new ConflictException(`用户名 "${username}" 已被占用`);
    }

    // 2. bcrypt 加密密码 —— 盐值轮数 10（安全性足够，性能较好）
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. 创建用户实体
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      role: (createUserDto.role as UserRole) || UserRole.STUDENT,
    });

    try {
      const savedUser = await this.userRepository.save(user);
      // 4. 返回用户信息（手动排除密码字段）
      return {
        id: savedUser.id,
        username: savedUser.username,
        role: savedUser.role,
        created_at: savedUser.created_at,
        updated_at: savedUser.updated_at,
      };
    } catch (error: any) {
      // 处理可能的数据写入错误（如极端并发下的唯一键冲突）
      if (error?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`用户名 "${username}" 已被占用`);
      }
      throw new InternalServerErrorException('注册失败，请稍后重试');
    }
  }

  /**
   * 根据用户名查找用户（包含密码字段，供认证模块使用）
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  /**
   * 根据 ID 查找用户
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * 用户列表 —— 分页 + 搜索
   */
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const where: any = {};
    if (search) {
      where.username = Like(`%${search}%`);
    }
    const [users, total] = await this.userRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' as const },
    });
    // 排除密码字段
    const items = users.map(({ password, ...rest }) => rest);
    return { items, total, page, limit };
  }

  /**
   * 更新用户信息（角色、密码等）
   */
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 如果更新密码，需要 bcrypt 加密
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    await this.userRepository.update(id, dto);
    return this.findById(id);
  }

  /**
   * 删除用户
   */
  async remove(id: number, currentUserId: number) {
    if (id === currentUserId) {
      throw new ForbiddenException('不能删除自己的账号');
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    await this.userRepository.delete(id);
    return { message: '删除成功' };
  }
}
