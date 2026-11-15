import { Body, Controller, Post, UseGuards, BadRequestException } from '@nestjs/common';
import { InternalAuthGuard } from '../shared/security/internal-auth.guard';
import { P2PCodeService } from '../domain/p2p-code.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller('internal/p2p')
@UseGuards(InternalAuthGuard)
export class P2PController {
  constructor(
    private readonly p2pCodeService: P2PCodeService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate 6-digit code and QR for P2P transfer
   */
  @Post('generate-code')
  async generateCode(
    @Body()
    body: {
      fromUserId: string;
      currency: string;
      amountMinorUnits: string;
      ttlMinutes?: number;
    },
  ) {
    const result = await this.p2pCodeService.createCode({
      fromUserId: body.fromUserId,
      currency: body.currency,
      amountMinorUnits: body.amountMinorUnits,
      ttlMinutes: body.ttlMinutes || 10,
    });

    return {
      success: true,
      code: result.code,
      expiresAt: result.expiresAt,
      qrData: result.qrData,
      currency: body.currency,
      amountMinorUnits: body.amountMinorUnits,
    };
  }

  /**
   * Receive payment with 6-digit code
   */
  @Post('receive-with-code')
  async receiveWithCode(
    @Body()
    body: {
      code: string;
      toUserId: string;
      otp?: string;
    },
  ) {
    // Consume code
    const codeResult = await this.p2pCodeService.consumeCode({
      code: body.code,
      toUserId: body.toUserId,
    });

    if (!codeResult.valid) {
      return {
        success: false,
        reason: codeResult.reason,
      };
    }

    // Call wallet-ledger-core to execute P2P transfer
    const walletLedgerUrl =
      this.configService.get<string>('WALLET_LEDGER_URL') || 'http://localhost:9001';
    const internalToken = this.configService.get<string>('INTERNAL_AUTH_TOKEN');
    if (!internalToken) {
      throw new Error('INTERNAL_AUTH_TOKEN is required');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${walletLedgerUrl}/internal/transfers/p2p`,
          {
            fromUserId: codeResult.fromUserId,
            toUserId: body.toUserId,
            currency: codeResult.currency,
            amountMinorUnits: codeResult.amountMinorUnits,
            otp: body.otp,
          },
          {
            headers: {
              Authorization: `Bearer ${internalToken}`,
            },
          },
        ),
      );

      return {
        success: true,
        transfer: response.data,
      };
    } catch (error: any) {
      throw new BadRequestException(error?.response?.data || 'Transfer failed');
    }
  }
}
