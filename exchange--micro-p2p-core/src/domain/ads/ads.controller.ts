import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { InternalAuthGuard } from '../../shared/guards/internal-auth.guard';
import { UserContextGuard } from '../../shared/guards/user-context.guard';
import { UserId } from '../../shared/decorators/user-context.decorator';
import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { QueryAdsDto } from './dto/query-ads.dto';

@ApiTags('P2P — Anuncios')
@ApiSecurity('x-internal-auth')
@UseGuards(InternalAuthGuard)
@Controller('p2p/ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  // ── Endpoints públicos (solo InternalAuthGuard) ──

  @Get()
  @ApiOperation({ summary: 'Listar anuncios activos (marketplace público)' })
  findMany(@Query() query: QueryAdsDto) {
    return this.adsService.findMany(query);
  }

  // ── Endpoints privados (requieren x-user-id) — declarados ANTES de :adId ──

  @Post()
  @ApiSecurity('x-user-id')
  @UseGuards(UserContextGuard)
  @ApiOperation({ summary: 'Crear anuncio de compra/venta P2P' })
  create(@UserId() userId: string, @Body() dto: CreateAdDto) {
    return this.adsService.create(userId, dto);
  }

  @Get('mine')
  @ApiSecurity('x-user-id')
  @UseGuards(UserContextGuard)
  @ApiOperation({ summary: 'Mis anuncios' })
  findMine(@UserId() userId: string) {
    return this.adsService.findByUser(userId);
  }

  // ── Público con param (debe ir después de rutas estáticas) ──

  @Get(':adId')
  @ApiOperation({ summary: 'Detalle de anuncio' })
  findOne(@Param('adId') adId: string) {
    return this.adsService.findById(adId);
  }

  @Patch(':adId')
  @ApiSecurity('x-user-id')
  @UseGuards(UserContextGuard)
  @ApiOperation({ summary: 'Actualizar anuncio propio' })
  update(@UserId() userId: string, @Param('adId') adId: string, @Body() dto: UpdateAdDto) {
    return this.adsService.update(userId, adId, dto);
  }

  @Post(':adId/pause')
  @ApiSecurity('x-user-id')
  @UseGuards(UserContextGuard)
  @ApiOperation({ summary: 'Pausar anuncio' })
  pause(@UserId() userId: string, @Param('adId') adId: string) {
    return this.adsService.pause(userId, adId);
  }

  @Post(':adId/resume')
  @ApiSecurity('x-user-id')
  @UseGuards(UserContextGuard)
  @ApiOperation({ summary: 'Reanudar anuncio pausado' })
  resume(@UserId() userId: string, @Param('adId') adId: string) {
    return this.adsService.resume(userId, adId);
  }
}
