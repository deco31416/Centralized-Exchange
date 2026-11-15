import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, ROLES_KEY, IS_PUBLIC_KEY } from '../decorators/permissions.decorator';
import { Permission, hasPermission, canModifyUser } from '../rbac/rbac.config';

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check required permissions
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredPermissions) {
      const userRoles = user.roles || [];
      
      for (const permission of requiredPermissions) {
        if (!hasPermission(userRoles, permission)) {
          throw new ForbiddenException(
            `Missing required permission: ${permission}`
          );
        }
      }
    }

    // Check required roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles) {
      const userRoles = user.roles || [];
      const hasRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRole) {
        throw new ForbiddenException(
          `Missing required role: ${requiredRoles.join(' or ')}`
        );
      }
    }

    // Special case: If modifying another user, check hierarchy
    if (request.params?.userId && request.params.userId !== user.sub) {
      // TODO: Load target user and check hierarchy
      // const canModify = canModifyUser(user.roles, targetUser.roles)
      // if (!canModify) throw ForbiddenException
    }

    return true;
  }
}
