import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { P2PAssetCatalogService } from './p2p-asset-catalog.service';
import { InternalAuthGuard } from '../../shared/guards/internal-auth.guard';

@ApiTags('P2P Asset Catalog')
@UseGuards(InternalAuthGuard)
@Controller('p2p/asset-catalog')
export class P2PAssetCatalogController {
  constructor(private readonly assetCatalogService: P2PAssetCatalogService) {}

  /**
   * Lista activos crypto habilitados para P2P.
   * Opcionalmente filtrar por fiatCode para obtener solo activos soportados en esa moneda.
   *
   * GET /api/v1/p2p/asset-catalog?fiatCode=COP
   * GET /api/v1/p2p/asset-catalog
   */
  @Get()
  @ApiOperation({ summary: 'Lista activos crypto habilitados para el marketplace P2P' })
  @ApiQuery({ name: 'fiatCode', required: false, description: 'Filtrar por moneda fiat soportada (COP, MXN, USD, etc.)' })
  async findEnabled(@Query('fiatCode') fiatCode?: string) {
    return this.assetCatalogService.findEnabled(fiatCode);
  }
}
