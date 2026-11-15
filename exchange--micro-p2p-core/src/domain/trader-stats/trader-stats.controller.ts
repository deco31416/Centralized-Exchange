import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { InternalAuthGuard } from '../../shared/guards/internal-auth.guard';
import { UserContextGuard } from '../../shared/guards/user-context.guard';
import { UserId } from '../../shared/decorators/user-context.decorator';
import { TraderStatsService } from './trader-stats.service';

@ApiTags('P2P — Estadísticas de Trader')
@ApiSecurity('x-internal-auth')
@ApiSecurity('x-user-id')
@UseGuards(InternalAuthGuard, UserContextGuard)
@Controller('p2p/stats')
export class TraderStatsController {
  constructor(private readonly statsService: TraderStatsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Mis estadísticas como trader P2P' })
  mine(@UserId() userId: string) {
    return this.statsService.findByUser(userId);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Estadísticas de otro trader' })
  findByUser(@Param('userId') userId: string) {
    return this.statsService.findByUser(userId);
  }
}
