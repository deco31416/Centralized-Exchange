import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from '../services/user.service';
import { TotpService } from '../services/totp.service';
import { AuditService } from '../services/audit.service';
import { VerifyMfaDto } from '../dto/mfa.dto';
import { ConfirmTotpSetupDto, StartTotpSetupDto } from '../dto/totp.dto';

@Controller('auth/v2/mfa')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class MfaController {
  constructor(
    private readonly userService: UserService,
    private readonly totpService: TotpService,
    private readonly auditService: AuditService,
  ) {}

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async status(@Req() req: Request): Promise<{
    sms_otp_enabled: boolean;
    totp_enabled: boolean;
    totp_label?: string;
    password_changed_at?: string;
  }> {
    const userId = (req.user as any).sub as string;
    const [user, totp, passwordChangedAt] = await Promise.all([
      this.userService.findUserById(userId),
      this.totpService.getTotpFactor(userId),
      this.auditService.getLastPasswordChange(userId),
    ]);

    return {
      sms_otp_enabled: !!user?.sms_otp_enabled,
      totp_enabled: !!totp,
      totp_label: totp?.label,
      password_changed_at: passwordChangedAt?.toISOString(),
    };
  }

  /**
   * Start Google Authenticator setup.
   * Returns QR + secret (base32) so user can register the device.
   */
  @Post('totp/setup')
  @HttpCode(HttpStatus.OK)
  async startTotpSetup(
    @Req() req: Request,
    @Body() dto: StartTotpSetupDto,
  ): Promise<{
    challenge_id: string;
    otpauth_url: string;
    secret_base32: string;
    qr_data_url: string;
    expires_in: number;
  }> {
    const userId = (req.user as any).sub as string;
    const email = await this.userService.getUserPrimaryEmail(userId);

    const result = await this.totpService.startSetup({
      userId,
      accountLabel: email?.email || `user:${userId}`,
      deviceLabel: dto.label,
    });

    return {
      challenge_id: result.challengeId,
      otpauth_url: result.otpauthUrl,
      secret_base32: result.secretBase32,
      qr_data_url: result.qrDataUrl,
      expires_in: result.expires_in,
    };
  }

  /**
   * Confirm setup by verifying the code and persisting the secret.
   */
  @Post('totp/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmTotpSetup(
    @Req() req: Request,
    @Body() dto: ConfirmTotpSetupDto,
  ): Promise<{ success: true }> {
    const userId = (req.user as any).sub as string;
    await this.totpService.confirmSetup({
      userId,
      challengeId: dto.challenge_id,
      code: dto.code,
    });
    return { success: true };
  }

  @Post('totp/disable')
  @HttpCode(HttpStatus.OK)
  async disableTotp(
    @Req() req: Request,
    @Body() dto: VerifyMfaDto,
  ): Promise<{ success: true }> {
    const userId = (req.user as any).sub as string;
    return await this.totpService.disableTotp({ userId, code: dto.code });
  }
}
