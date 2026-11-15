import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { IsNotEmpty, IsString } from 'class-validator';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { OtpService } from '../services/otp.service';
import { UserService } from '../services/user.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { ReauthService } from '../services/reauth.service';

class VerifyEmailReauthDto {
  @IsString()
  @IsNotEmpty()
  otpCode: string;
}

@Controller('auth/v2/reauth')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ReauthController {
  constructor(
    private readonly otpService: OtpService,
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
    private readonly reauthService: ReauthService,
  ) {}

  /**
   * Request an email OTP to authorize sensitive changes.
   */
  @Post('email/request')
  @HttpCode(HttpStatus.OK)
  async requestEmailOtp(@Req() req: Request): Promise<{ success: true; expires_in: number }> {
    const userId = (req.user as any).sub as string;
    const email = await this.userService.getUserPrimaryEmail(userId);
    if (!email?.email) {
      throw new BadRequestException('No primary email found');
    }

    const otp = await this.otpService.generateOTP(userId, 'change');
    const expirationMinutes = Math.max(1, Math.ceil(this.otpService.getOtpTtlSeconds() / 60));

    await this.notificationsService.sendEmail({
      to: email.email,
      template: 'auth.otp',
      subject: `Your verification code is ${otp}`,
      variables: {
        code: otp,
        purpose: 'change',
        verificationType: 'Security',
        displayName: email.email.split('@')[0],
        expirationMinutes,
        companyName: 'DECO31416',
      },
      user_id: userId,
      idempotency_key: `reauth:email:${userId}:${Date.now()}`,
      priority: 'high',
    });

    return { success: true, expires_in: this.otpService.getOtpTtlSeconds() };
  }

  /**
   * Verify the email OTP and grant a short-lived reauth window.
   */
  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  async verifyEmailOtp(
    @Req() req: Request,
    @Body() body: VerifyEmailReauthDto,
  ): Promise<{ success: true; verified_for_seconds: number }> {
    const userId = (req.user as any).sub as string;
    if (!body?.otpCode) {
      throw new BadRequestException({ code: 'OTP_REQUIRED', message: 'otpCode is required' });
    }

    await this.otpService.verifyOTP(userId, body.otpCode, 'change');
    await this.reauthService.markEmailVerified(userId);

    return { success: true, verified_for_seconds: this.reauthService.getReauthTtlSeconds() };
  }
}
