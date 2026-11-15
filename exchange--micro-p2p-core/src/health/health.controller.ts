import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check del microservicio P2P Core' })
  check() {
    return {
      status: 'ok',
      service: 'micro-p2p-core',
      port: process.env.PORT || 3021,
      timestamp: new Date().toISOString(),
      rules: {
        fiatInternal: 'BLOCKED — fiat interno NO se usa como pago P2P',
        escrow: 'Crypto escrow requerido antes de liberar fondos',
        payment: 'Solo fiat externo (banco, transferencia, móvil) entre usuarios',
      },
    };
  }
}
