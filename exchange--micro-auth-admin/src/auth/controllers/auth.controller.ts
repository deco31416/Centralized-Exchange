import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  BadRequestException,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  UseGuards,
  ValidationPipe,
  UsePipes,
  Param,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/token.dto';
import { VerifyEmailDto } from '../dto/token.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../dto/password-reset.dto';
import { ChangeEmailDto, ChangePhoneDto } from '../dto/change-contacts.dto';
import { ChangeUsernameDto } from '../dto/change-username.dto';
import {
  AuthResponseDto,
  SuccessResponseDto,
  SessionResponseDto,
  DeviceResponseDto,
} from '../dto/response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { NotificationsService } from '../../notifications/notifications.service';
import { WithdrawalsHoldService } from '../services/withdrawals-hold.service';
import { SmsOtpService } from '../services/sms-otp.service';
import { TotpService } from '../services/totp.service';
import { ReauthService } from '../services/reauth.service';

/**
 * Authentication controller handling login, registration, and token management
 */
@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
    private readonly withdrawalsHoldService: WithdrawalsHoldService,
    private readonly smsOtpService: SmsOtpService,
    private readonly totpService: TotpService,
    private readonly reauthService: ReauthService,
  ) {}

  private async enforceExtraFactorsForSensitiveChange(params: {
    userId: string;
    totpCode?: string;
  }): Promise<void> {
    const user = await this.userService.findUserById(params.userId);
    if (!user) throw new BadRequestException('User not found');

    const emailOk = await this.reauthService.isEmailVerified(params.userId);
    if (!emailOk) {
      throw new BadRequestException({
        code: 'EMAIL_REAUTH_REQUIRED',
        message: 'Verify email OTP for sensitive changes to continue',
      });
    }

    if (user.sms_otp_enabled) {
      const smsOk = await this.smsOtpService.isVerified(params.userId, 'dashboard');
      if (!smsOk) {
        throw new BadRequestException({
          code: 'SMS_OTP_REQUIRED',
          message: 'Verify SMS OTP to continue',
        });
      }
    }

    const totpFactor = await this.totpService.getTotpFactor(params.userId);
    if (totpFactor) {
      if (!params.totpCode) {
        throw new BadRequestException({
          code: 'TOTP_REQUIRED',
          message: 'Authenticator code required',
        });
      }
      await this.totpService.verifyTotpCode({ userId: params.userId, code: params.totpCode });
    }
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * User registration
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
  ): Promise<SuccessResponseDto> {
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await this.authService.register(
      registerDto,
      ipAddress,
      userAgent,
    );

    return {
      success: result.success,
      message: result.message,
    };
  }

  /**
   * User login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await this.authService.login(loginDto, ipAddress, userAgent);

    // Set refresh token as httpOnly cookie
    if (!result.refresh_token) {
      throw new InternalServerErrorException('Refresh token missing from login result');
    }
    this.setRefreshTokenCookie(res, result.refresh_token);

    const includeRefreshToken = req.query?.include_refresh_token === 'true';
    if (includeRefreshToken) return result;
    // Default seguro para browser: no exponer refresh token por JSON
    // (sigue rotando vía cookie HttpOnly)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { refresh_token, ...safe } = result as any;
    return safe;
  }

  /**
   * Token refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Try to get refresh token from cookie first, then from body
    const refreshToken =
      req.cookies?.refresh_token || refreshTokenDto.refresh_token;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const result = await this.authService.refreshToken(
      refreshToken,
      ipAddress,
      userAgent,
    );

    // Set new refresh token as httpOnly cookie
    if (!result.refresh_token) {
      throw new InternalServerErrorException('Refresh token missing from refresh result');
    }
    this.setRefreshTokenCookie(res, result.refresh_token);

    const includeRefreshToken = req.query?.include_refresh_token === 'true';
    if (includeRefreshToken) return result;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { refresh_token, ...safe } = result as any;
    return safe;
  }

  /**
   * Logout from current session
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SuccessResponseDto> {
    const user = req.user as { sub: string; sid: string };
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await this.authService.logout(user.sid, user.sub, ipAddress, userAgent);

    // Clear refresh token cookie
    this.clearRefreshTokenCookie(res);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * Logout from all sessions
   */
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SuccessResponseDto> {
    const user = req.user as { sub: string };
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await this.authService.logoutAll(user.sub, ipAddress, userAgent);

    // Clear refresh token cookie
    this.clearRefreshTokenCookie(res);

    return {
      success: true,
      message: 'Logged out from all sessions',
    };
  }

  /**
   * Email verification
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Req() req: Request,
  ): Promise<SuccessResponseDto> {
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await this.authService.verifyEmail(
      verifyEmailDto.token,
      ipAddress,
      userAgent,
    );

    return {
      success: result.success,
      message: result.message,
    };
  }

  /**
   * Request password reset
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Req() req: Request,
  ): Promise<SuccessResponseDto> {
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await this.authService.forgotPassword(
      forgotPasswordDto.email,
      ipAddress,
      userAgent,
    );

    return {
      success: result.success,
      message: result.message,
    };
  }

  /**
   * Change phone (protected)
   *
   * NOTE: This endpoint does not enforce OTP verification yet.
   */
  @Post('change-phone')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async changePhone(
    @Body() changePhoneDto: ChangePhoneDto,
    @Req() req: Request,
  ): Promise<SuccessResponseDto> {
    const user = req.user as { sub: string };
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await this.enforceExtraFactorsForSensitiveChange({
      userId: user.sub,
      totpCode: changePhoneDto.totp_code,
    });

    const existing = await this.userService.findUserById(user.sub);
    if (!existing) {
      throw new BadRequestException('User not found');
    }

    const oldPhone = existing.phone;

    await this.userService.updateUserProfile(user.sub, {
      phone: changePhoneDto.phone,
    });

    if (oldPhone !== changePhoneDto.phone) {
      const email = await this.userService.getUserPrimaryEmail(user.sub);
      await this.withdrawalsHoldService.applyWithdrawalsHoldAndNotify({
        userId: user.sub,
        email: email?.email,
        ipAddress,
        userAgent,
        reason: 'phone_changed',
      });
    }

    return {
      success: true,
      message: 'Phone updated successfully',
    };
  }

  /**
   * Change primary email (protected)
   *
   * Applies withdrawals hold and notifies the CURRENT primary email first.
   */
  @Post('change-email')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async changeEmail(
    @Body() changeEmailDto: ChangeEmailDto,
    @Req() req: Request,
  ): Promise<SuccessResponseDto> {
    const user = req.user as { sub: string };
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await this.enforceExtraFactorsForSensitiveChange({
      userId: user.sub,
      totpCode: changeEmailDto.totp_code,
    });

    const currentEmail = await this.userService.getUserPrimaryEmail(user.sub);
    if (!currentEmail) {
      throw new BadRequestException('No primary email found');
    }

    const targetEmailLower = changeEmailDto.email.toLowerCase();
    if (currentEmail.email_lower === targetEmailLower) {
      return {
        success: true,
        message: 'Email is already set to this value',
      };
    }

    await this.withdrawalsHoldService.applyWithdrawalsHoldAndNotify({
      userId: user.sub,
      email: currentEmail.email,
      ipAddress,
      userAgent,
      reason: 'email_changed',
    });

    await this.userService.changePrimaryEmail(user.sub, changeEmailDto.email);

    // Best-effort: send verification to the new primary email
    try {
      await this.tokenService.sendEmailVerification(user.sub);
    } catch {
      // ignore
    }

    return {
      success: true,
      message: 'Email changed successfully. Please verify your new email.',
    };
  }
  
  /**
   * Change username (protected)
   */
  @Post('change-username')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async changeUsername(
    @Body() dto: ChangeUsernameDto,
    @Req() req: Request,
  ): Promise<SuccessResponseDto> {
    const user = req.user as { sub: string };

    await this.enforceExtraFactorsForSensitiveChange({
      userId: user.sub,
      totpCode: dto.totp_code,
    });

    await this.userService.setUsername(user.sub, dto.username);

    return {
      success: true,
      message: 'Username updated successfully',
    };
  }

  /**
   * Reset password with token
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: Request,
  ): Promise<SuccessResponseDto> {
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.new_password,
      ipAddress,
      userAgent,
    );

    return {
      success: result.success,
      message: result.message,
    };
  }

  /**
   * Change password (authenticated)
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ): Promise<SuccessResponseDto> {
    const user = req.user as { sub: string };
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await this.authService.changePassword(
      user.sub,
      changePasswordDto.current_password,
      changePasswordDto.new_password,
      ipAddress,
      userAgent,
    );

    // Best-effort security notification: do not fail password change if email delivery fails
    if (result.success) {
      try {
        const emailRecord = await this.userService.getUserPrimaryEmail(user.sub);
        const email = emailRecord?.email;
        if (typeof email === 'string' && email.length > 0) {
          const deviceId = req.headers['x-device-id'];
          await this.notificationsService.sendEmail({
            to: email,
            template: 'security.password_changed',
            subject: 'Your password was changed',
            variables: {
              displayName: email.split('@')[0],
              companyName: 'DECOEXCHANGE',
              ipAddress,
              userAgent,
              deviceId: typeof deviceId === 'string' ? deviceId : undefined,
              timestamp: new Date().toISOString(),
            },
            user_id: user.sub,
            idempotency_key: `security:password_changed:${user.sub}:${Date.now()}`,
            priority: 'normal',
          });

          // Best-effort withdrawals hold (default 1h) + notification
          await this.withdrawalsHoldService.applyWithdrawalsHoldAndNotify({
            userId: user.sub,
            email,
            ipAddress,
            userAgent,
            deviceId: typeof deviceId === 'string' ? deviceId : undefined,
            reason: 'password_changed',
          });
        }
      } catch (e) {
        // Intentionally ignore
      }
    }

    return {
      success: result.success,
      message: result.message,
    };
  }

  /**
   * Get user's active sessions
   */
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@Req() req: Request): Promise<SessionResponseDto[]> {
    const user = req.user as { sub: string; sid: string };
    const sessions = await this.sessionService.getUserSessions(user.sub);

    // Mark current session
    return sessions.map((session) => ({
      ...session,
      is_current: session.id === user.sid,
    }));
  }

  /**
   * Get user's devices
   */
  @Get('devices')
  @UseGuards(JwtAuthGuard)
  async getDevices(@Req() req: Request): Promise<DeviceResponseDto[]> {
    const user = req.user as { sub: string; device_id?: string };
    const devices = await this.sessionService.getUserDevices(user.sub);

    // Mark current device
    return devices.map((device) => ({
      ...device,
      is_current: device.id === user.device_id,
    }));
  }

  /**
   * Revoke a specific session
   */
  @Post('sessions/:sessionId/revoke')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async revokeSession(
    @Param('sessionId') sessionId: string,
  ): Promise<SuccessResponseDto> {
    await this.sessionService.revokeSession(sessionId, 'User revoked session');

    return {
      success: true,
      message: 'Session revoked successfully',
    };
  }

  /**
   * Revoke all sessions for a device
   */
  @Post('devices/:deviceId/revoke')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async revokeDevice(
    @Param('deviceId') deviceId: string,
  ): Promise<SuccessResponseDto> {
    await this.sessionService.revokeDeviceSessions(
      deviceId,
      'User revoked device',
    );

    return {
      success: true,
      message: 'Device sessions revoked successfully',
    };
  }

  /**
   * Send magic link for passwordless login
   */
  @Post('magic-link')
  @HttpCode(HttpStatus.OK)
  async sendMagicLink(
    @Body() body: { email: string },
  ): Promise<SuccessResponseDto> {
    await this.tokenService.sendMagicLink(body.email);

    return {
      success: true,
      message:
        'If an account with that email exists, you will receive a magic link.',
    };
  }

  /**
   * Admin endpoint for testing (remove in production)
   */
  @Get('admin/test')
  @HttpCode(HttpStatus.OK)
  getTest(): { message: string; timestamp: string } {
    return {
      message: 'Auth service is running',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Extracts IP address from request
   */
  private extractIpAddress(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    );
  }

  /**
   * Sets refresh token as httpOnly cookie
   */
  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 45 * 24 * 60 * 60 * 1000, // 45 days
      // Debe matchear el prefijo real en runtime
      path: '/api/v1/auth',
    });
  }

  /**
   * Clears refresh token cookie
   */
  private clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
    });
  }
}
