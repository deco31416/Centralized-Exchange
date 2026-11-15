import { Controller, Post, Put, Get, Body, Headers, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SignatureService } from './signature.service';
import { InternalAuthGuard } from '../../shared/security/internal-auth.guard';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { ChangeSignatureDto } from './dto/change-signature.dto';

@Controller('signature')
@UseGuards(InternalAuthGuard)
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  /** GET /signature/status — Estado de la firma del usuario */
  @Get('status')
  getStatus(@Headers('x-user-id') userId: string) {
    this.requireUserId(userId);
    return this.signatureService.getStatus(userId);
  }

  /** POST /signature — Crear firma (PIN) por primera vez */
  @Post()
  create(@Headers('x-user-id') userId: string, @Body() dto: CreateSignatureDto) {
    this.requireUserId(userId);
    return this.signatureService.create(userId, dto);
  }

  /** POST /signature/verify — Verificar PIN (para autorizar operaciones) */
  @Post('verify')
  verify(@Headers('x-user-id') userId: string, @Body() dto: VerifySignatureDto) {
    this.requireUserId(userId);
    return this.signatureService.verify(userId, dto);
  }

  /** PUT /signature — Cambiar PIN */
  @Put()
  change(@Headers('x-user-id') userId: string, @Body() dto: ChangeSignatureDto) {
    this.requireUserId(userId);
    return this.signatureService.change(userId, dto);
  }

  private requireUserId(userId: string) {
    if (!userId) throw new UnauthorizedException('Header x-user-id requerido');
  }
}
