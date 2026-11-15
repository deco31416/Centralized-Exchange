import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicService } from './public.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('landing-stats')
  @ApiOperation({ summary: 'Get public landing page metrics (no auth required)' })
  getLandingStats() {
    return this.publicService.getLandingStats();
  }
}
