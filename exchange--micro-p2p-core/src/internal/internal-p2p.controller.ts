import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { InternalAuthGuard } from '../shared/guards/internal-auth.guard';

/**
 * Endpoints internos para integración micro-a-micro.
 * Protegidos solo por InternalAuthGuard (sin UserContextGuard).
 */
@ApiTags('Internal P2P')
@ApiSecurity('x-internal-auth')
@UseGuards(InternalAuthGuard)
@Controller('internal/p2p')
export class InternalP2PController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'micro-p2p-core', internal: true };
  }
}
