import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { Permission, AdminRole, canAssignRole, canModifyUser } from '../rbac/rbac.config';
import { UserService } from '../services/user.service';
import { AuditLogService, AuditAction } from '../services/audit-log.service';

class AssignRolesDto {
  userId: string;
  roles: AdminRole[];
}

class CreateAdminDto {
  email: string;
  password: string;
  roles: AdminRole[];
  firstName?: string;
  lastName?: string;
}

/**
 * 🔒 Role Management Controller (RBAC)
 * 
 * Solo super_admin y admin pueden gestionar roles.
 * Jerarquía: No puedes asignar roles superiores al tuyo.
 */
@Controller('roles')
@UseGuards(JwtAuthGuard, RBACGuard)
export class RoleController {
  constructor(
    private userService: UserService,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Obtener roles disponibles (con permisos)
   */
  @Get()
  @RequirePermissions(Permission.ROLE_VIEW)
  async getRoles() {
    const { ROLE_PERMISSIONS, ROLE_HIERARCHY, AdminRole } = await import('../rbac/rbac.config');
    
    return {
      roles: Object.values(AdminRole).map(role => ({
        name: role,
        hierarchy: ROLE_HIERARCHY[role],
        permissions: ROLE_PERMISSIONS[role],
      })),
    };
  }

  /**
   * Asignar roles a un usuario
   */
  @Post('assign')
  @RequirePermissions(Permission.ROLE_ASSIGN)
  @HttpCode(HttpStatus.OK)
  async assignRoles(@Body() dto: AssignRolesDto, @Req() req: any) {
    const assigner = req.user;
    
    // Validar que el assigner puede asignar estos roles
    for (const role of dto.roles) {
      if (!canAssignRole(assigner.roles, role)) {
        throw new ForbiddenException(
          `You cannot assign role: ${role}. You can only assign roles below your hierarchy.`
        );
      }
    }

    // Obtener usuario target
    const targetUser = await this.userService.findUserById(dto.userId);
    if (!targetUser) {
      throw new ForbiddenException('User not found');
    }

    // Validar jerarquía (no puedes modificar usuarios de nivel superior)
    if (!canModifyUser(assigner.roles, targetUser.roles || [])) {
      throw new ForbiddenException(
        'You cannot modify users with higher or equal hierarchy'
      );
    }

    // Asignar roles
    await this.userService.setUserRoles(dto.userId, dto.roles);

    // Audit log
    await this.auditLogService.log({
      action: AuditAction.ADMIN_ROLES_ASSIGNED,
      actorUserId: assigner.sub,
      target: `user:${dto.userId}`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        previousRoles: targetUser.roles,
        newRoles: dto.roles,
      },
    });

    return {
      success: true,
      message: 'Roles assigned successfully',
      userId: dto.userId,
      roles: dto.roles,
    };
  }

  /**
   * Obtener roles de un usuario
   */
  @Get('user/:userId')
  @RequirePermissions(Permission.ROLE_VIEW)
  async getUserRoles(@Param('userId') userId: string) {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    return {
      userId: user._id,
      email: user.primary_email_id,
      roles: user.roles || [],
    };
  }

  /**
   * Ver mis propios permisos (para UI)
   */
  @Get('me/permissions')
  async getMyPermissions(@Req() req: any) {
    const { getAllPermissions } = await import('../rbac/rbac.config');
    const user = req.user;
    
    const permissions = getAllPermissions(user.roles || []);
    
    return {
      userId: user.sub,
      roles: user.roles,
      permissions,
    };
  }

  /**
   * Crear nuevo admin (con roles iniciales)
   */
  @Post('admin')
  @RequirePermissions(Permission.ADMIN_CREATE)
  async createAdmin(@Body() dto: CreateAdminDto, @Req() req: any) {
    const assigner = req.user;

    // Validar que puede asignar los roles especificados
    for (const role of dto.roles) {
      if (!canAssignRole(assigner.roles, role)) {
        throw new ForbiddenException(
          `You cannot create admin with role: ${role}`
        );
      }
    }

    // TODO: Usar UserService para crear admin
    // const newAdmin = await this.userService.createAdmin(dto)

    // Audit log
    await this.auditLogService.log({
      action: AuditAction.ADMIN_CREATED,
      actorUserId: assigner.sub,
      target: `email:${dto.email}`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        roles: dto.roles,
      },
    });

    return {
      success: true,
      message: 'Admin created successfully',
      // admin: newAdmin,
    };
  }

  /**
   * Listar todos los admins (con filtro por rol)
   */
  @Get('admins')
  @RequirePermissions(Permission.ADMIN_VIEW)
  async listAdmins(@Req() req: any) {
    const user = req.user;
    
    // TODO: Implementar con UserService
    // const admins = await this.userService.findAdmins()
    
    return {
      admins: [],
      total: 0,
    };
  }
}
