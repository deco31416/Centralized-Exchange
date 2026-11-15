import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { randomUUID } from 'crypto';

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
class InternalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['x-internal-auth'] as string | undefined;
    const expected = process.env.INTERNAL_AUTH_TOKEN;
    if (!expected) return true;
    return Boolean(token) && token === expected;
  }
}

/**
 * Controlador interno para simular eventos hacia payments-core
 * Solo para testing/desarrollo
 */
@Controller('internal/test')
@UseGuards(InternalAuthGuard)
export class TestEventsController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Simula emisión de evento FIAT_TRANSFER_DETECTED hacia payments-core
   */
  @Post('emit-transfer-detected')
  async emitTransferDetected(
    @Body()
    body: {
      provider: 'stp' | 'mercadopago' | 'stripe';
      userId: string;
      currency: string;
      amountMinorUnits: string;
    },
  ) {
    const transferId = randomUUID();
    const correlationId = randomUUID();

    const event = {
      eventName: 'FIAT_TRANSFER_DETECTED',
      version: 'v1',
      correlationId,
      payload: {
        transferId,
        provider: body.provider,
        providerTransferId: `${body.provider}_${Date.now()}`,
        type: 'INBOUND',
        currency: body.currency,
        amountMinorUnits: body.amountMinorUnits,
        referenceNumber: body.userId,
        concept: `Test deposit for ${body.userId}`,
        receivedAt: new Date().toISOString(),
      },
    };

    const paymentsUrl = this.configService.get<string>('PAYMENTS_CORE_URL') ?? 'http://localhost:9000/api/v1';
    const internalAuthToken = this.configService.get<string>('INTERNAL_AUTH_TOKEN');
    if (!internalAuthToken) {
      throw new Error('INTERNAL_AUTH_TOKEN is required');
    }

    try {
      const response = await axios.post(`${paymentsUrl}/internal/events/fiat-transfer-detected`, event, {
        headers: {
          'x-internal-auth': internalAuthToken,
          'content-type': 'application/json',
        },
        timeout: 10000,
      });

      return {
        status: 'emitted',
        transferId,
        correlationId,
        paymentsResponse: response.data,
      };
    } catch (error: any) {
      return {
        status: 'error',
        transferId,
        error: error?.response?.data ?? error?.message ?? String(error),
      };
    }
  }
}
