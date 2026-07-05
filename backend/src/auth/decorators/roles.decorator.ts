import { SetMetadata } from '@nestjs/common';

/**
 * 角色装饰器 —— 标记接口需要哪些角色才能访问
 *
 * 用法：@Roles('admin') 或 @Roles('admin', 'teacher')
 *
 * 原理：通过 SetMetadata 将角色列表存入元数据，
 * RolesGuard 从反射器中读取并校验。
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
