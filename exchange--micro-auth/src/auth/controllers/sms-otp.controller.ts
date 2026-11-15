import {
  BadRequestException,
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
import { NotificationsService } from '../../notifications/notifications.service';
import { SmsOtpService } from '../services/sms-otp.service';
import { VerifySmsOtpDto } from '../dto/sms-otp.dto';

@Controller('auth/v2/sms-otp')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class SmsOtpController {
  constructor(
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
    private readonly smsOtpService: SmsOtpService,
  ) {}

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async status(@Req() req: Request): Promise<{
    enabled: boolean;
    hasPhone: boolean;
    phoneMasked?: string;
  }> {
    const userId = (req.user as any).sub as string;
    const user = await this.userService.findUserById(userId);
    if (!user) throw new BadRequestException('User not found');

    const phone = user.phone || '';
    const masked = phone ? this.maskPhone(phone) : undefined;

    return {
      enabled: !!user.sms_otp_enabled,
      hasPhone: !!phone,
      phoneMasked: masked,
    };
  }

  @Post('enable')
  @HttpCode(HttpStatus.OK)
  async enable(@Req() req: Request): Promise<{ success: true }> {
    const userId = (req.user as any).sub as string;
    const phone = await this.userService.getUserPhone(userId);
    if (!phone) {
      throw new BadRequestException({
        code: 'PHONE_REQUIRED',
        message: 'Phone is required to enable SMS OTP',
      });
    }

    await this.userService.setSmsOtpEnabled(userId, true);
    return { success: true };
  }

  @Post('disable')
  @HttpCode(HttpStatus.OK)
  async disable(@Req() req: Request): Promise<{ success: true }> {
    const userId = (req.user as any).sub as string;
    await this.userService.setSmsOtpEnabled(userId, false);
    return { success: true };
  }

  @Post('request')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Req() req: Request): Promise<{ success: true; expires_in: number }> {
    const userId = (req.user as any).sub as string;
    const user = await this.userService.findUserById(userId);
    if (!user) throw new BadRequestException('User not found');

    if (!user.sms_otp_enabled) {
      throw new BadRequestException({
        code: 'SMS_OTP_NOT_ENABLED',
        message: 'SMS OTP is not enabled for this user',
      });
    }

    if (!user.phone) {
      throw new BadRequestException({
        code: 'PHONE_REQUIRED',
        message: 'Phone is required to receive SMS OTP',
      });
    }

    const code = await this.smsOtpService.generateOtp(userId, 'dashboard');
    const expirationMinutes = Math.max(1, Math.ceil(this.smsOtpService.getOtpTtlSeconds() / 60));

    // Best-effort: if notifications fails, we should surface error (user expects SMS)
    await this.notificationsService.sendSms({
      to: user.phone,
      template: 'auth.otp',
      variables: {
        code,
        purpose: 'dashboard',
        verificationType: 'Security',
        expirationMinutes,
        companyName: 'DECO31416',
      },
      user_id: userId,
      idempotency_key: `smsotp:dashboard:${userId}:${Date.now()}`,
      priority: 'high',
    });

    return { success: true, expires_in: this.smsOtpService.getOtpTtlSeconds() };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Req() req: Request,
    @Body() body: VerifySmsOtpDto,
  ): Promise<{ success: true; verified_for_seconds: number }> {
    const userId = (req.user as any).sub as string;
    await this.smsOtpService.verifyOtp(userId, body.code, 'dashboard');
    return { success: true, verified_for_seconds: this.smsOtpService.getVerifiedTtlSeconds() };
  }

  private maskPhone(phone: string): string {
    const digits = phone.replace(/\s+/g, '');
    if (digits.length <= 4) return '****';
    const tail = digits.slice(-4);
    return `***${tail}`;
  }
}
