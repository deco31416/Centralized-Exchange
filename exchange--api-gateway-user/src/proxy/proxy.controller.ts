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
import { ConfigService } from '@nestjs/config';
import { ProxyService } from './proxy.service';

@ApiTags('proxy')
@Controller()
@UseGuards(ThrottlerGuard)
export class ProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  private getApiPrefix(): string {
    return (
      this.configService.get<string>('config.api.prefix') ||
      this.configService.get<string>('API_PREFIX') ||
      'api/v1'
    );
  }

  @All('auth/(.*)')
  @ApiOperation({ summary: 'Proxy to User Auth Service' })
  async proxyAuth(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('auth', request, response);
  }

  @All('internal/(.*)')
  @ApiOperation({ summary: 'Proxy to Auth Internal Endpoints' })
  async proxyInternal(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('auth', request, response);
  }

  @All('notifications/(.*)')
  @ApiOperation({ summary: 'Proxy to User Notifications Service' })
  async proxyNotifications(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('notifications', request, response);
  }

  @All('send/(.*)')
  @ApiOperation({ summary: 'Proxy to Send Core Service' })
  async proxySend(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('send', request, response);
  }

  @All(['movements', 'movements/(.*)'])
  @ApiOperation({ summary: 'Proxy to Movements Core Service' })
  async proxyMovements(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('movements', request, response);
  }

  @All(['remittances', 'remittances/(.*)'])
  @ApiOperation({ summary: 'Proxy to Remittances Core Service' })
  async proxyRemittances(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('remittances', request, response);
  }

  @All('wallet/(.*)')
  @ApiOperation({ summary: 'Proxy to Wallet Ledger Core Service' })
  async proxyWallet(@Req() request: Request, @Res() response: Response) {
    const apiPrefix = this.getApiPrefix();
    return this.handleProxy(
      'wallet-ledger',
      request,
      response,
      `/${apiPrefix}/internal`,
    );
  }

  @All(['p2p-market', 'p2p-market/(.*)'])
  @ApiOperation({ summary: 'Proxy to P2P Marketplace Core Service' })
  async proxyP2PMarket(@Req() request: Request, @Res() response: Response) {
    const apiPrefix = this.getApiPrefix();
    return this.handleProxy(
      'p2p-core',
      request,
      response,
      `/${apiPrefix}/p2p`,
    );
  }

  @All('p2p/(.*)')
  @ApiOperation({ summary: 'Proxy to Internal Transfers Service (P2P)' })
  async proxyP2P(@Req() request: Request, @Res() response: Response) {
    const apiPrefix = this.getApiPrefix();
    return this.handleProxy(
      'internal-transfers',
      request,
      response,
      `/${apiPrefix}/internal/p2p`,
    );
  }

  @All(['signature', 'signature/(.*)'])
  @ApiOperation({ summary: 'Proxy to Signature Keys Service' })
  async proxySignature(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('signature-keys', request, response);
  }

  @All(['dynamic-key', 'dynamic-key/(.*)'])
  @ApiOperation({ summary: 'Proxy to Signature Keys Service (Dynamic Key)' })
  async proxyDynamicKey(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('signature-keys', request, response);
  }

  @All(['savings', 'savings/(.*)'])
  @ApiOperation({ summary: 'Proxy to Savings Core Service' })
  async proxySavings(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('savings', request, response);
  }

  @All(['loans', 'loans/(.*)'])
  @ApiOperation({ summary: 'Proxy to Loans Core Service' })
  async proxyLoans(@Req() request: Request, @Res() response: Response) {
    const apiPrefix = this.getApiPrefix();
    return this.handleProxy(
      'loans',
      request,
      response,
      `/${apiPrefix}/internal/loans`,
    );
  }

  @All(['DECOPAY', 'DECOPAY/(.*)'])
  @ApiOperation({ summary: 'Proxy to DECOPAY Core Service' })
  async proxyDECOPAY(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('DECOPAY', request, response);
  }

  @All(['redeem', 'redeem/(.*)'])
  @ApiOperation({ summary: 'Proxy to Redeem Core Service' })
  async proxyRedeem(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('redeem', request, response);
  }

  @All(['funding', 'funding/(.*)'])
  @ApiOperation({ summary: 'Proxy to Funding Core Service' })
  async proxyFunding(@Req() request: Request, @Res() response: Response) {
    return this.handleProxy('funding', request, response);
  }

  @All(['pricing', 'pricing/(.*)'])
  @ApiOperation({ summary: 'Proxy to Pricing Aggregator Service' })
  async proxyPricing(@Req() request: Request, @Res() response: Response) {
    const apiPrefix = this.getApiPrefix();
    return this.handleProxy('pricing', request, response, `/${apiPrefix}`);
  }

  private async handleProxy(
    service:
      | 'auth'
      | 'notifications'
      | 'wallet-ledger'
      | 'payments'
      | 'internal-transfers'
      | 'signature-keys'
      | 'send'
      | 'movements'
      | 'remittances'
      | 'savings'
      | 'loans'
      | 'DECOPAY'
      | 'redeem'
      | 'funding'
      | 'pricing'
      | 'p2p-core',
    request: Request,
    response: Response,
    preservePath?: string,
  ) {
    try {
      const queryIndex = request.originalUrl.indexOf('?');
      const queryString =
        queryIndex >= 0 ? request.originalUrl.slice(queryIndex) : '';

      let servicePath: string;

      if (preservePath) {
        const pathParts = request.path.split('/');

        const urlSegment =
          service === 'wallet-ledger'
            ? 'wallet'
            : service === 'internal-transfers'
              ? 'p2p'
              : service === 'p2p-core'
                ? 'p2p-market'
                : service;

        const serviceIndex = pathParts.indexOf(urlSegment);

        servicePath =
          preservePath +
          '/' +
          pathParts.slice(serviceIndex + 1).join('/') +
          queryString;
      } else {
        servicePath = request.path + queryString;
      }

      const result = await this.proxyService.forwardRequest(
        service,
        request.method,
        servicePath,
        request.body,
        request.headers as Record<string, string>,
      );

      const excludeHeaders = [
        'transfer-encoding',
        'connection',
        'keep-alive',
        'strict-transport-security',
        'x-powered-by',
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'referrer-policy',
        'permissions-policy',
        'x-railway-edge',
        'x-railway-request-id',
        'content-security-policy',
      ];

      let totalHeaderSize = 0;
      const forwardedHeaders: string[] = [];

      Object.entries(result.headers).forEach(([key, value]) => {
        if (!excludeHeaders.includes(key.toLowerCase())) {
          response.setHeader(key, value);
          const headerSize = key.length + String(value).length + 4;
          totalHeaderSize += headerSize;
          forwardedHeaders.push(
            `${key}: ${String(value).substring(0, 100)}${
              String(value).length > 100 ? '...' : ''
            }`,
          );
        }
      });

      console.log(
        `[GATEWAY][PROXY] Response headers size: ${totalHeaderSize} bytes`,
      );

      if (totalHeaderSize > 6000) {
        console.warn(
          `[GATEWAY][PROXY] WARNING: Response headers are large (${totalHeaderSize} bytes)`,
        );
        console.log(
          `[GATEWAY][PROXY] Large headers:`,
          forwardedHeaders.filter((h) => h.length > 100),
        );
      }

      return response.status(result.statusCode).json(result.data);
    } catch (error: any) {
      console.error(`[GATEWAY][CONTROLLER] Proxy error:`, {
        service,
        path: request.path,
        method: request.method,
        error: error.message,
        status: error.status,
      });

      return response
        .status(error.status || HttpStatus.INTERNAL_SERVER_ERROR)
        .json({
          statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Internal server error',
          timestamp: new Date().toISOString(),
        });
    }
  }
}
