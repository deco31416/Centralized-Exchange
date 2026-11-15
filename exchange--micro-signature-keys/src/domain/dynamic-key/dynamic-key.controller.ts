import { Controller, Post, Get, Body, Headers, UnauthorizedException, UseGuards } from '@nestjs/common';
import { DynamicKeyService } from './dynamic-key.service';
import { InternalAuthGuard } from '../../shared/security/internal-auth.guard';
import { VerifyDynamicKeyDto } from './dto/verify-dynamic-key.dto';

@Controller('dynamic-key')
@UseGuards(InternalAuthGuard)
export class DynamicKeyController {
  constructor(private readonly dynamicKeyService: DynamicKeyService) {}

  /** GET /dynamic-key/status — Estado de la clave dinámica */
  @Get('status')
  getStatus(@Headers('x-user-id') userId: string) {
    this.requireUserId(userId);
    return this.dynamicKeyService.getStatus(userId);
  }

  /** POST /dynamic-key/enable — Activar clave dinámica */
  @Post('enable')
  enable(@Headers('x-user-id') userId: string) {
    this.requireUserId(userId);
    return this.dynamicKeyService.enable(userId);
  }

  /** POST /dynamic-key/disable — Desactivar clave dinámica */
  @Post('disable')
  disable(@Headers('x-user-id') userId: string) {
    this.requireUserId(userId);
    return this.dynamicKeyService.disable(userId);
  }

  /** GET /dynamic-key/current — Obtener clave dinámica actual */
  @Get('current')
  getCurrent(@Headers('x-user-id') userId: string) {
    this.requireUserId(userId);
    return this.dynamicKeyService.getCurrent(userId);
  }

  /** POST /dynamic-key/verify — Verificar código de clave dinámica */
  @Post('verify')
  verify(@Headers('x-user-id') userId: string, @Body() dto: VerifyDynamicKeyDto) {
    this.requireUserId(userId);
    return this.dynamicKeyService.verify(userId, dto);
  }

  private requireUserId(userId: string) {
    if (!userId) throw new UnauthorizedException('Header x-user-id requerido');
  }
}
