import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SwapExecutionService } from '../services/swap-execution.service';
import { PlatformReservesService } from '../services/platform-reserves.service';
import { CreateSwapDto, GetQuoteDto } from '../models/create-swap.dto';
import {
  SwapQuoteResponseDto,
  SwapExecutionResponseDto,
} from '../models/swap-response.dto';

/**
 * Controller for swap operations.
 * Handles quote generation, swap execution, and history queries.
 */
@Controller('swap')
export class SwapController {
  constructor(
    private swapExecutionService: SwapExecutionService,
    private reservesService: PlatformReservesService,
  ) {}

  /**
   * Get a quote for a swap without executing it.
   * POST /swap/quote
   */
  @Post('quote')
  async getQuote(
    @Body() dto: GetQuoteDto,
    @Request() req: { user?: { id: string } },
  ): Promise<SwapQuoteResponseDto> {
    const userId = req.user?.id || 'test-user'; // TODO: Replace with actual auth
    return this.swapExecutionService.getQuote(dto, userId);
  }

  /**
   * Execute a swap.
   * POST /swap/execute
   */
  @Post('execute')
  async executeSwap(
    @Body() dto: CreateSwapDto,
    @Request() req: { user?: { id: string } },
  ): Promise<SwapExecutionResponseDto> {
    const userId = req.user?.id || 'test-user'; // TODO: Replace with actual auth
    return this.swapExecutionService.executeSwap(dto, userId);
  }

  /**
   * Get swap history for authenticated user.
   * GET /swap/history?limit=50
   */
  @Get('history')
  async getHistory(
    @Query('limit') limit?: string,
    @Request() req: { user?: { id: string } } = {},
  ): Promise<{ swaps: unknown[] }> {
    const userId = req.user?.id || 'test-user';
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const swaps = await this.swapExecutionService.getSwapHistory(
      userId,
      limitNum,
    );
    return { swaps };
  }

  /**
   * Get specific swap by ID.
   * GET /swap/:id
   */
  @Get(':id')
  async getSwap(@Param('id') id: string): Promise<unknown> {
    return this.swapExecutionService.getSwapById(id);
  }

  /**
   * Get all platform reserves.
   * GET /swap/reserves
   */
  @Get('admin/reserves')
  async getReserves(): Promise<{ reserves: unknown[] }> {
    const reserves = await this.reservesService.getAllReserves();
    return { reserves };
  }

  /**
   * Get reserve for specific asset.
   * GET /swap/reserves/:assetCode
   */
  @Get('admin/reserves/:assetCode')
  async getReserve(@Param('assetCode') assetCode: string): Promise<unknown> {
    return this.reservesService.getReserve(assetCode);
  }
}
