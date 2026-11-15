import { SetMetadata } from '@nestjs/common';
import { Permission } from '../rbac/rbac.config';

export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';

/**
 * Decorator: Requiere permisos específicos para acceder al endpoint
 * 
 * @example
 * @RequirePermissions(Permission.USER_VIEW, Permission.USER_EDIT)
 * async updateUser() { ... }
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator: Requiere roles específicos para acceder al endpoint
 * 
 * @example
 * @RequireRoles('super_admin', 'admin')
 * async deleteUser() { ... }
 */
export const RequireRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);

/**
 * Decorator: Permite acceso público (skip auth)
 * 
 * @example
 * @Public()
 * async health() { return 'OK' }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
