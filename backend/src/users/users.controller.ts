import {
  Controller, Post, Get, Put, Delete,
  Body, Param, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** 用户注册（公开） */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  /**
   * 用户列表 —— 仅管理员
   *
   * GET /api/users?page=1&limit=10&search=zhang
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
  }

  /**
   * 用户详情 —— 仅管理员
   *
   * GET /api/users/:id
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  /**
   * 更新用户 —— 仅管理员
   *
   * PUT /api/users/:id
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  /**
   * 删除用户 —— 仅管理员
   *
   * DELETE /api/users/:id
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: number, @Request() req: any) {
    return this.usersService.remove(id, req.user.id);
  }
}
