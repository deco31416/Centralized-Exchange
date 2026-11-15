import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from '../common/guards/internal-auth.guard';
import { MarketDataService } from './market-data.service';

@Controller('market-data')
@UseGuards(InternalAuthGuard)
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('overview')
  getOverview() {
    return this.marketDataService.getOverview();
  }

  @Get('assets')
  getAssets() {
    return this.marketDataService.getAssets();
  }

  @Get('tickers')
  getTickers() {
    return this.marketDataService.getTickers();
  }

  @Get('tickers/:symbol')
  getTicker(@Param('symbol') symbol: string) {
    return this.marketDataService.getTicker(symbol);
  }

  @Get('status')
  getStatus() {
    return this.marketDataService.getStatus();
  }
}
