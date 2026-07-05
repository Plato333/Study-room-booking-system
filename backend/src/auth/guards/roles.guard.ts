import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * 角色守卫 —— 检查当前用户是否拥有访问接口所需的角色
 *
 * 流程：
 * 1. 从反射器中读取 @Roles() 装饰器设置的角色列表
 * 2. 如果没有设置角色 → 放行（公开接口）
 * 3. 如果设置了角色 → 检查 req.user.role 是否在允许的角色列表中
 * 4. 匹配 → 放行，不匹配 → 403 Forbidden
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 读取 @Roles() 装饰器设置的角色
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),    // 方法级别
      context.getClass(),      // 类级别
    ]);

    // 没有设置角色 → 公开接口，放行
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 从 JWT 验证后的请求中获取用户信息
    const { user } = context.switchToHttp().getRequest();

    // 检查用户角色是否在允许列表中
    return requiredRoles.includes(user?.role);
  }
}
