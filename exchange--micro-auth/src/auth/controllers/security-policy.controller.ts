import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Headers,
  HttpCode,
  OnModuleInit,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { SecurityPolicyService } from '../services/security-policy.service';
import { UpsertSecurityPolicyDto } from '../dto/security-policy.dto';
import { SERVICE_TYPES, type ServiceType } from '../../database/schemas/security-policy.schema';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth/v2/security-policy')
export class SecurityPolicyController implements OnModuleInit {
  constructor(private readonly policyService: SecurityPolicyService) {}

  async onModuleInit() {
    await this.policyService.seedDefaults();
  }

  /** GET /auth/v2/security-policy — todas las políticas */
  @Get()
  async getAll() {
    return this.policyService.getAll();
  }

  /** GET /auth/v2/security-policy/:serviceType — política por servicio */
  @Get(':serviceType')
  async getByService(@Param('serviceType') serviceType: string) {
    const policy = await this.policyService.getByService(serviceType);
    if (!policy) {
      return {
        serviceType,
        allowedMethods: [],
        minRequired: 0,
        isActive: false,
      };
    }
    return policy;
  }

  /** PUT /auth/v2/security-policy — upsert (admin only) */
  @Put()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async upsert(
    @Body() dto: UpsertSecurityPolicyDto,
    @Headers('x-admin-id') adminId?: string,
  ) {
    if (!adminId) {
      throw new ForbiddenException('Admin access required');
    }
    return this.policyService.upsert(dto.serviceType as ServiceType, {
      allowedMethods: dto.allowedMethods,
      minRequired: dto.minRequired,
      isActive: dto.isActive,
      lastModifiedBy: adminId,
    });
  }
}
