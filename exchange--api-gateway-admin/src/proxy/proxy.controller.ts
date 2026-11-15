import {
  Controller,
  All,
  Req,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ProxyService } from './proxy.service';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';

/** Service keys matching ProxyService.SERVICE_KEYS */
type ServiceKey =
  | 'auth' | 'notifications' | 'wallet-ledger' | 'payments' | 'internal-transfers'
  | 'send' | 'movements' | 'savings' | 'loans' | 'redeem' | 'DECOPAY'
  | 'remittances' | 'funding' | 'signature' | 'pricing' | 'p2p-core';

@ApiTags('proxy')
@Controller()
@UseGuards(ThrottlerGuard)
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  /* ── Existing routes ── */

  @All('auth/*')
  @ApiOperation({ summary: 'Proxy to Admin Auth Service' })
  async proxyAuth(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('auth', request, response);
  }

  @All('internal/*')
  @ApiOperation({ summary: 'Proxy to Admin Auth Service - Internal Routes' })
  async proxyInternal(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('auth', request, response, '/internal');
  }

  @All('notifications/*')
  @ApiOperation({ summary: 'Proxy to Admin Notifications Service' })
  async proxyNotifications(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('notifications', request, response);
  }

  @All('wallet/*')
  @ApiOperation({ summary: 'Proxy to Wallet Ledger Core Service' })
  async proxyWallet(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('wallet-ledger', request, response, '/internal');
  }

  @All('p2p/*')
  @ApiOperation({ summary: 'Proxy to Internal Transfers Service' })
  async proxyP2P(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('internal-transfers', request, response, '/api/v1/internal/p2p');
  }

  /* ── New routes (Fase 4A) ── */

  @All('send/*')
  @ApiOperation({ summary: 'Proxy to Send Core Service' })
  async proxySend(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('send', request, response);
  }

  @All('movements/*')
  @ApiOperation({ summary: 'Proxy to Movements Core Service' })
  async proxyMovements(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('movements', request, response);
  }

  @All('savings/*')
  @ApiOperation({ summary: 'Proxy to Savings Core Service' })
  async proxySavings(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('savings', request, response);
  }

  @All('loans/*')
  @ApiOperation({ summary: 'Proxy to Loans Core Service' })
  async proxyLoans(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('loans', request, response);
  }

  @All('redeem/*')
  @ApiOperation({ summary: 'Proxy to Redeem Core Service' })
  async proxyRedeem(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('redeem', request, response);
  }

  @All('DECOPAY/*')
  @ApiOperation({ summary: 'Proxy to DECOPAY Core Service' })
  async proxyDECOPAY(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('DECOPAY', request, response);
  }

  @All('remittances/*')
  @ApiOperation({ summary: 'Proxy to Remittances Core Service' })
  async proxyRemittances(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('remittances', request, response);
  }

  @All('admin/funding/*')
  @UseGuards(ThrottlerGuard, AdminJwtGuard)
  @ApiOperation({ summary: 'Proxy admin funding endpoints to Funding Core Service' })
  async proxyAdminFunding(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('funding', request, response, '/api/v1/funding/admin');
  }

  @All('funding/*')
  @UseGuards(ThrottlerGuard, AdminJwtGuard)
  @ApiOperation({ summary: 'Proxy to Funding Core Service' })
  async proxyFunding(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('funding', request, response);
  }

  @All('signature/*')
  @ApiOperation({ summary: 'Proxy to Signature Keys Service' })
  async proxySignature(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('signature', request, response);
  }

  @All('pricing/*')
  @ApiOperation({ summary: 'Proxy to Pricing Fee Aggregator Service' })
  async proxyPricing(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('pricing', request, response);
  }

  @All('admin-p2p/*')
  @ApiOperation({ summary: 'Proxy to P2P Core Admin endpoints' })
  async proxyAdminP2P(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('p2p-core', request, response, '/api/v1/admin/p2p');
  }

  private async handleProxy(
    service: ServiceKey,
    request: Request,
    response: Response,
    preservePath?: string, // If provided, keeps this path prefix in the forward
  ) {
    try {
      const queryIndex = request.originalUrl.indexOf('?');
      const queryString = queryIndex >= 0 ? request.originalUrl.slice(queryIndex) : '';

      // Rebuild path relative to the service segment, ignoring /api/v1 prefix.
      // Example incoming (with global prefix): /api/v1/wallet/wallets/admin/add-balance
      // Forward to wallet-ledger: /internal/wallets/admin/add-balance
      const pathParts = request.path.split('/').filter(Boolean);
      // Map service key to URL segment used in the request path.
      // Example: 'wallet-ledger' → 'wallet', 'internal-transfers' → 'p2p', 'p2p-core' → 'admin-p2p'
      const segmentMap: Partial<Record<ServiceKey, string>> = {
        'wallet-ledger': 'wallet',
        'internal-transfers': 'p2p',
        'p2p-core': 'admin-p2p',
      };
      const serviceSegment = segmentMap[service] || service;
      const serviceIndex = pathParts.indexOf(serviceSegment);
      const rest = serviceIndex >= 0 ? pathParts.slice(serviceIndex + 1).join('/') : '';

      let forwardPath: string;
      if (preservePath) {
        forwardPath = `${preservePath}${rest ? `/${rest}` : ''}${queryString}`;
      } else {
        forwardPath = `/${rest}${queryString}`;
      }

      // Forward request to microservice
      const result = await this.proxyService.forwardRequest(
        service,
        request.method,
        forwardPath,
        request.body,
        request.headers as Record<string, string>,
      );

      // Forward response headers (except some internal ones)
      const excludeHeaders = ['transfer-encoding', 'connection', 'keep-alive'];
      Object.entries(result.headers).forEach(([key, value]) => {
        if (!excludeHeaders.includes(key.toLowerCase())) {
          response.setHeader(key, value);
        }
      });

      return response.status(result.statusCode).json(result.data);
    } catch (error) {
      return response.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
