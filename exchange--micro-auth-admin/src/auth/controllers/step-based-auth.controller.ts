import {
    Controller,
    Post,
    Body,
    Req,
    Res,
    HttpCode,
    HttpStatus,
    ValidationPipe,
    UsePipes,
    Headers,
    InternalServerErrorException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { StepBasedAuthService } from '../services/step-based-auth.service';
import { OtpService } from '../services/otp.service';
import { TelemetryService } from '../services/telemetry.service';
import {
    LoginStep1Dto,
    LoginStep2Dto,
    RegisterStep1Dto,
    RegisterStep2Dto,
    ResetPasswordRequestDto,
    ResetPasswordVerifyOtpDto,
    ResetPasswordConfirmDto,
    ResendOtpDto,
} from '../dto/step-based-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { WithdrawalsHoldService } from '../services/withdrawals-hold.service';
import { GeoIpService } from '../services/geoip/geoip.service';
import { UserService } from '../services/user.service';
import { SmsOtpService } from '../services/sms-otp.service';
import { TotpService } from '../services/totp.service';
import {
    ResetTokenDto,
    ResetVerifySmsOtpDto,
    ResetVerifyTotpDto,
} from '../dto/reset-mfa.dto';

interface StepBasedResponse {
    ok: boolean;
    nextStep?: 'OTP_REQUIRED' | 'DONE';
    sessionId?: string;
    message?: string;
    code?: string;
    debugOtpCode?: string;
    access_token?: string;
    refresh_token?: string;
    user?: any;
    requires_sms_otp?: boolean;
    requires_totp?: boolean;
    correlationId: string;
}

/**
 * Step-based authentication controller (v2)
 * Uses StepBasedAuthService wrapper - does NOT modify legacy services
 */
@Controller('auth/v2')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class StepBasedAuthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly stepBasedAuthService: StepBasedAuthService,
        private readonly otpService: OtpService,
        private readonly telemetryService: TelemetryService,
        private readonly redisService: RedisService,
        private readonly notificationsService: NotificationsService,
        private readonly withdrawalsHoldService: WithdrawalsHoldService,
        private readonly geoIpService: GeoIpService,
        private readonly userService: UserService,
        private readonly smsOtpService: SmsOtpService,
        private readonly totpService: TotpService,
    ) { }

    private getResetTokenTtlSeconds(): number {
        return this.configService.get<number>('RESET_TOKEN_TTL_SECONDS', 600);
    }

    private async setResetFlag(resetToken: string, key: 'sms' | 'totp', ttlSeconds: number): Promise<void> {
        await this.redisService.set(`reset_${key}_verified:${resetToken}`, '1', ttlSeconds);
    }

    private async getResetFlag(resetToken: string, key: 'sms' | 'totp'): Promise<boolean> {
        const v = await this.redisService.get(`reset_${key}_verified:${resetToken}`);
        return !!v;
    }

    private shouldReturnDebugOtp(): boolean {
        return (
            process.env.NODE_ENV !== 'production' &&
            String(process.env.OTP_DEBUG_RETURN_CODE || '').toLowerCase() === 'true'
        );
    }

    private async sendOtpEmail(params: {
        to: string;
        userId: string;
        purpose: 'login' | 'register' | 'reset' | 'change';
        code: string;
    }): Promise<void> {
        const expirationMinutes = Math.max(1, Math.ceil(this.otpService.getOtpTtlSeconds() / 60));
        const verificationType =
            params.purpose === 'login'
                ? 'Login'
                : params.purpose === 'register'
                    ? 'Account'
                    : params.purpose === 'reset'
                        ? 'Password reset'
                        : 'Security';

        await this.notificationsService.sendEmail({
            to: params.to,
            template: 'auth.otp',
            subject: `Your verification code is ${params.code}`,
            variables: {
                code: params.code,
                purpose: params.purpose,
                verificationType,
                displayName: params.to.split('@')[0],
                expirationMinutes,
                companyName: 'DECOEXCHANGE',
            },
            user_id: params.userId,
            idempotency_key: `otp:${params.purpose}:${params.userId}:${Date.now()}`,
            priority: 'high',
        });
    }

    /**
     * Step 1: Login with credentials
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async loginStep1(
        @Body() dto: LoginStep1Dto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Headers('x-correlation-id') correlationId?: string,
    ): Promise<StepBasedResponse> {
        console.log('[CONTROLLER] loginStep1 called');
        console.log('[CONTROLLER] DTO received:', JSON.stringify(dto));
        console.log('[CONTROLLER] Request body:', (req as any).body);
        
        const corrId = correlationId || uuidv4();
        const ipAddress = this.extractIpAddress(req);
        const userAgent = req.headers['user-agent'] || 'Unknown';

        try {
            console.log('[CONTROLLER] About to validate user credentials...');
            const user = await this.stepBasedAuthService.validateUser(
                dto.email,
                dto.password,
            );
            console.log('[CONTROLLER] validateUser returned:', user);

            if (!user) {
                console.log('[CONTROLLER] ❌ User validation failed - invalid credentials');
                await this.telemetryService.logEvent({
                    action: 'login_fail',
                    ipAddress,
                    userAgent,
                    outcome: 'fail',
                    correlationId: corrId,
                    metadata: { reason: 'invalid_credentials', email: dto.email },
                });

                throw new UnauthorizedException({
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password',
                });
            }

            const otpRequired = await this.otpService.isOTPRequiredForLogin(
                user.id,
                ipAddress,
                userAgent,
            );

            if (otpRequired) {
                const otpCode = await this.otpService.generateOTP(user.id, 'login');
                const sessionId = uuidv4();

                await this.redisService.set(
                    `pending_login:${sessionId}`,
                    JSON.stringify({ userId: user.id, email: dto.email }),
                    600,
                );

                try {
                    await this.sendOtpEmail({
                        to: dto.email,
                        userId: user.id,
                        purpose: 'login',
                        code: otpCode,
                    });
                } catch (e) {
                    if (!this.shouldReturnDebugOtp()) {
                        throw new InternalServerErrorException('Failed to send OTP');
                    }
                }

                await this.telemetryService.logEvent({
                    userId: user.id,
                    action: 'otp_sent',
                    ipAddress,
                    userAgent,
                    outcome: 'success',
                    correlationId: corrId,
                    metadata: { purpose: 'login' },
                });

                return {
                    ok: true,
                    nextStep: 'OTP_REQUIRED',
                    sessionId,
                    message: 'OTP sent to your email',
                    ...(this.shouldReturnDebugOtp() ? { debugOtpCode: otpCode } : {}),
                    correlationId: corrId,
                };
            } else {
                const tokens = await this.stepBasedAuthService.issueTokens(
                    user.id,
                    ipAddress,
                    userAgent,
                );

                const userDto = await this.stepBasedAuthService.getUserResponseDto(user.id);

                if (!tokens.refresh_token) {
                    throw new InternalServerErrorException('Refresh token missing from login result');
                }
                this.setRefreshTokenCookie(res, tokens.refresh_token);

                await this.otpService.markAsKnown(user.id, ipAddress, userAgent);

                await this.telemetryService.logEvent({
                    userId: user.id,
                    action: 'login_success',
                    ipAddress,
                    userAgent,
                    outcome: 'success',
                    correlationId: corrId,
                    metadata: { otp_required: false },
                });

                const includeRefreshToken = req.query?.include_refresh_token === 'true';
                const response: StepBasedResponse = {
                    ok: true,
                    nextStep: 'DONE',
                    access_token: tokens.access_token,
                    ...(includeRefreshToken ? { refresh_token: tokens.refresh_token } : {}),
                    user: userDto,
                    correlationId: corrId,
                };

                return response;
            }
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new BadRequestException({
                ok: false,
                code: 'LOGIN_ERROR',
                message: error.message || 'An error occurred during login',
                correlationId: corrId,
            });
        }
    }

    /**
     * Step 2: Verify OTP for login
     */
    @Post('login/verify-otp')
    @HttpCode(HttpStatus.OK)
    async loginStep2(
        @Body() dto: LoginStep2Dto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Headers('x-correlation-id') correlationId?: string,
    ): Promise<StepBasedResponse> {
        const corrId = correlationId || uuidv4();
        const ipAddress = this.extractIpAddress(req);
        const userAgent = req.headers['user-agent'] || 'Unknown';

        const pendingSessionStr = await this.redisService.get(
            `pending_login:${dto.sessionId}`,
        );

        if (!pendingSessionStr) {
            throw new UnauthorizedException({
                code: 'INVALID_SESSION',
                message: 'Invalid or expired session',
            });
        }

        const parsedPendingSession = JSON.parse(pendingSessionStr);
        const userId = parsedPendingSession?.userId;
        const email = parsedPendingSession?.email;

        await this.otpService.verifyOTP(userId, dto.otpCode, 'login');

        const tokens = await this.stepBasedAuthService.issueTokens(
            userId,
            ipAddress,
            userAgent,
        );

        const userDto = await this.stepBasedAuthService.getUserResponseDto(userId);

        if (!tokens.refresh_token) {
            throw new InternalServerErrorException('Refresh token missing from login result');
        }
        this.setRefreshTokenCookie(res, tokens.refresh_token);

        await this.otpService.markAsKnown(userId, ipAddress, userAgent);
        await this.redisService.del(`pending_login:${dto.sessionId}`);

        await this.telemetryService.logEvent({
            userId,
            action: 'login_success',
            ipAddress,
            userAgent,
            outcome: 'success',
            correlationId: corrId,
            metadata: { otp_verified: true },
        });

        // Best-effort security notification: do not fail login if email delivery fails
        if (typeof email === 'string' && email.length > 0) {
            try {
                const deviceId = req.headers['x-device-id'];
                await this.notificationsService.sendEmail({
                    to: email,
                    template: 'security.login_success',
                    subject: 'New login to your account',
                    variables: {
                        displayName: email.split('@')[0],
                        companyName: 'DECOEXCHANGE',
                        ipAddress,
                        userAgent,
                        deviceId: typeof deviceId === 'string' ? deviceId : undefined,
                        timestamp: new Date().toISOString(),
                    },
                    user_id: userId,
                    idempotency_key: `security:login_success:${userId}:${dto.sessionId}`,
                    priority: 'normal',
                });
            } catch (e) {
                // Intentionally ignore
            }
        }

        const includeRefreshToken = req.query?.include_refresh_token === 'true';
        return {
            ok: true,
            nextStep: 'DONE',
            access_token: tokens.access_token,
            ...(includeRefreshToken ? { refresh_token: tokens.refresh_token } : {}),
            user: userDto,
            correlationId: corrId,
        };
    }

    /**
     * Step 1: Register user
     */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async registerStep1(
        @Body() dto: RegisterStep1Dto,
        @Req() req: Request,
        @Headers('x-correlation-id') correlationId?: string,
    ): Promise<StepBasedResponse> {
        console.log('[CONTROLLER] registerStep1 called');
        console.log('[CONTROLLER] DTO received:', JSON.stringify(dto, null, 2));
        console.log('[CONTROLLER] DTO keys:', Object.keys(dto || {}));
        console.log('[CONTROLLER] DTO values:', Object.values(dto || {}));
        
        const corrId = correlationId || uuidv4();
        const ipAddress = this.extractIpAddress(req);
        const userAgent = req.headers['user-agent'] || 'Unknown';

        let user;
        try {
            console.log('[CONTROLLER] About to call createPending...');
            user = await this.stepBasedAuthService.createPending(dto);
            console.log('[CONTROLLER] createPending returned user:', user?.id);
        } catch (error) {
            console.error('[CONTROLLER] ❌ ERROR in createPending:', error);
            console.error('[CONTROLLER] Error name:', error?.name);
            console.error('[CONTROLLER] Error message:', error?.message);
            console.error('[CONTROLLER] Error code:', error?.code);
            console.error('[CONTROLLER] Error stack:', error?.stack);
            throw error; // Re-throw para que NestJS lo maneje
        }

        console.log('[CONTROLLER] About to generate OTP...');
        const otpCode = await this.otpService.generateOTP(user.id, 'register');
        console.log('[CONTROLLER] OTP generated:', otpCode);

        try {
            console.log('[CONTROLLER] About to send OTP email...');
            await this.sendOtpEmail({
                to: dto.email,
                userId: user.id,
                purpose: 'register',
                code: otpCode,
            });
            console.log('[CONTROLLER] OTP email sent successfully');
        } catch (e) {
            console.error('[CONTROLLER] Failed to send OTP email:', e);
            if (!this.shouldReturnDebugOtp()) {
                throw new InternalServerErrorException('Failed to send OTP');
            }
        }

        const sessionId = uuidv4();
        await this.redisService.set(
            `pending_register:${sessionId}`,
            JSON.stringify({ userId: user.id, email: dto.email, password: dto.password, username: dto.username }),
            600,
        );

        await this.telemetryService.logEvent({
            userId: user.id,
            action: 'register_pending',
            ipAddress,
            userAgent,
            outcome: 'success',
            correlationId: corrId,
            metadata: { otp_sent: true },
        });

        return {
            ok: true,
            nextStep: 'OTP_REQUIRED',
            sessionId,
            message: 'OTP sent to your email',
            ...(this.shouldReturnDebugOtp() ? { debugOtpCode: otpCode } : {}),
            correlationId: corrId,
        };
    }

    /**
     * Step 2: Verify OTP for registration
     */
    @Post('register/verify-otp')
    @HttpCode(HttpStatus.OK)
    async registerStep2(
        @Body() dto: RegisterStep2Dto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Headers('x-correlation-id') correlationId?: string,
    ): Promise<StepBasedResponse> {
        console.log('[CONTROLLER] registerStep2 called');
        console.log('[CONTROLLER] DTO received:', JSON.stringify(dto));
        console.log('[CONTROLLER] Request body:', (req as any).body);
        
        const corrId = correlationId || uuidv4();
        const ipAddress = this.extractIpAddress(req);
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const inferredCountry = this.geoIpService.lookupCountry(ipAddress);

        const pendingSessionStr = await this.redisService.get(
            `pending_register:${dto.sessionId}`,
        );

        if (!pendingSessionStr) {
            throw new UnauthorizedException({
                code: 'INVALID_SESSION',
                message: 'Invalid or expired session',
            });
        }

        const { userId } = JSON.parse(pendingSessionStr);

        console.log('[CONTROLLER] About to verify OTP...');
        await this.otpService.verifyOTP(userId, dto.otpCode, 'register');
        console.log('[CONTROLLER] OTP verified successfully');
        
        // Create or update password credential if provided in session
        const sessionData = JSON.parse(pendingSessionStr);
        if (sessionData.password) {
            console.log('[CONTROLLER] About to create/update password credential...');
            await this.stepBasedAuthService.createPasswordCredential(userId, sessionData.password);
            console.log('[CONTROLLER] Password credential saved successfully');
        }
        
        // Update user profile with firstName, lastName, phone, birthDate
        console.log('[CONTROLLER] About to update user profile...');
        await this.stepBasedAuthService.updateUserProfile(userId, {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone || undefined,
            birthDate: dto.birthDate,
            country: inferredCountry,
        });
        console.log('[CONTROLLER] User profile updated successfully');

        console.log('[CONTROLLER] About to activate user...');
        await this.stepBasedAuthService.activateUser(userId);
        console.log('[CONTROLLER] User activated successfully');
        
        await this.redisService.del(`pending_register:${dto.sessionId}`);

        // Issue tokens and create device/session
        console.log('[CONTROLLER] About to issue tokens...');
        const tokens = await this.stepBasedAuthService.issueTokens(
            userId,
            ipAddress,
            userAgent,
        );
        console.log('[CONTROLLER] Tokens issued successfully');

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', tokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        await this.telemetryService.logEvent({
            userId,
            action: 'register_success',
            ipAddress,
            userAgent,
            outcome: 'success',
            correlationId: corrId,
        });

        // Get user data to return in response
        const user = await this.stepBasedAuthService.findByEmail(sessionData.email);

        return {
            ok: true,
            nextStep: 'DONE',
            message: 'Registration successful',
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            user: {
                id: user?.id,
                email: user?.email,
            },
            correlationId: corrId,
        };
    }

    /**
     * Step 1: Request password reset
     */
    @Post('password/reset/request')
    @HttpCode(HttpStatus.OK)
    async resetPasswordRequest(
        @Body() dto: ResetPasswordRequestDto,
        @Req() req: Request,
        @Headers('x-correlation-id') correlationId?: string,
    ): Promise<StepBasedResponse> {
        const corrId = correlationId || uuidv4();
        const ipAddress = this.extractIpAddress(req);
        const userAgent = req.headers['user-agent'] || 'Unknown';

        const user = await this.stepBasedAuthService.findByEmail(dto.email);

        let debugOtpCode: string | undefined;

        if (user) {
            const otpCode = await this.otpService.generateOTP(user.id, 'reset');

            try {
                await this.sendOtpEmail({
                    to: dto.email,
                    userId: user.id,
                    purpose: 'reset',
                    code: otpCode,
                });
            } catch (e) {
                if (!this.shouldReturnDebugOtp()) {
                    throw new InternalServerErrorException('Failed to send OTP');
                }
            }

            if (this.shouldReturnDebugOtp()) {
                debugOtpCode = otpCode;
            }

            await this.telemetryService.logEvent({
                userId: user.id,
                action: 'password_reset_requested',
                ipAddress,
                userAgent,
                outcome: 'success',
                correlationId: corrId,
            });
        }

        return {
            ok: true,
            message: 'If an account exists, you will receive a password reset code',
            ...(debugOtpCode ? { debugOtpCode } : {}),
            correlationId: corrId,
        };
    }

    /**
     * Step 2: Verify OTP for password reset
     */
    @Post('password/reset/verify-otp')
    @HttpCode(HttpStatus.OK)
    async resetPasswordVerifyOtp(
        @Body() dto: ResetPasswordVerifyOtpDto,
        @Req() req: Request,
        @Headers('x-correlation-id') correlationId?: string,
    ): Promise<StepBasedResponse> {
        const corrId = correlationId || uuidv4();
        const ipAddress = this.extractIpAddress(req);
        const userAgent = req.headers['user-agent'] || 'Unknown';

        const user = await this.stepBasedAuthService.findByEmail(dto.email);

        if (!user) {
            throw new UnauthorizedException({
                code: 'INVALID_OTP',
                message: 'Invalid OTP',
            });
        }

        await this.otpService.verifyOTP(user.id, dto.otpCode, 'reset');

        const resetToken = uuidv4();
        const fullUser = await this.userService.findUserById(user.id);
        const requiresSmsOtp = !!fullUser?.sms_otp_enabled;
        const totpFactor = await this.totpService.getTotpFactor(user.id);
        const requiresTotp = !!totpFactor;

        const resetTtlSeconds = this.getResetTokenTtlSeconds();
        await this.redisService.set(
            `reset_token:${resetToken}`,
            JSON.stringify({
                userId: user.id,
                email: dto.email,
                requiresSmsOtp,
                requiresTotp,
            }),
            resetTtlSeconds,
        );

        await this.telemetryService.logEvent({
            userId: user.id,
            action: 'password_reset_otp_verified',
            ipAddress,
            userAgent,
            outcome: 'success',
            correlationId: corrId,
        });

        return {
            ok: true,
            nextStep: 'DONE',
            sessionId: resetToken,
            message: 'OTP verified. You can now set a new password',
            requires_sms_otp: requiresSmsOtp,
            requires_totp: requiresTotp,
            correlationId: corrId,
        };
    }

    /**
     * Step 2.1: Request SMS OTP (optional additional factor) for password reset
     */
    @Post('password/reset/request-sms-otp')
    @HttpCode(HttpStatus.OK)
    async resetPasswordRequestSmsOtp(
        @Body() dto: ResetTokenDto,
        @Headers('x-correlation-id') correlationId?: string,
    ): Promise<StepBasedResponse> {
        const corrId = correlationId || uuidv4();

        const tokenDataStr = await this.redisService.get(`reset_token:${dto.resetToken}`);
        if (!tokenDataStr) {
            throw new UnauthorizedException({ code: 'INVALID_TOKEN', message: 'Invalid or expired reset token' });
        }

        const tokenData = JSON.parse(tokenDataStr);
        const userId = tokenData?.userId as string;
        const requiresSmsOtp = !!tokenData?.requiresSmsOtp;
        if (!requiresSmsOtp) {
            throw new BadRequestException({ code: 'SMS_OTP_NOT_REQUIRED', message: 'SMS OTP not required for this reset' });
        }

        const phone = await this.userService.getUserPhone(userId);
        if (!phone) {
            throw new BadRequestException({ code: 'PHONE_REQUIRED', message: 'Phone is required to receive SMS OTP' });
        }

        const code = await this.smsOtpService.generateOtp(userId, 'reset');
        const expirationMinutes = Math.max(1, Math.ceil(this.smsOtpService.getOtpTtlSeconds() / 60));

        await this.notificationsService.sendSms({
            to: phone,
            template: 'auth.otp',
            variables: {
                code,
                purpose: 'reset',
                verificationType: 'Password reset',
                expirationMinutes,
                companyName: 'DECOEXCHANGE',
            },
            user_id: userId,
            idempotency_key: `smsotp:reset:${userId}:${Date.now()}`,
            priority: 'high',
        });

        return { ok: true, message: 'SMS code sent', correlationId: corrId };
    }

    /**
     * Step 2.2: Verify SMS OTP for password reset
     */
    @Post('password/reset/verify-sms-otp')
    @HttpCode(HttpStatus.OK)
    async resetPasswordVerifySmsOtp(
        @Body() dto: ResetVerifySmsOtpDto,
        @Headers('x-correlation-id') correlationId?: string,
    ): Promise<StepBasedResponse> {
        const corrId = correlationId || uuidv4();

        const tokenDataStr = await this.redisService.get(`reset_token:${dto.resetToken}`);
        if (!tokenDataStr) {
            throw new UnauthorizedException({ code: 'INVALID_TOKEN', message: 'Invalid or expired reset token' });
        }

        const tokenData = JSON.parse(tokenDataStr);
        const userId = tokenData?.userId as string;
        const requiresSmsOtp = !!tokenData?.requiresSmsOtp;
        if (!requiresSmsOtp) {
            throw new BadRequestException({ code: 'SMS_OTP_NOT_REQUIRED', message: 'SMS OTP not required for this reset' });
        }

        await this.smsOtpService.verifyOtp(userId, dto.code, 'reset');
        const ttlSeconds = this.getResetTokenTtlSeconds();
        await this.setResetFlag(dto.resetToken, 'sms', ttlSeconds);

        return { ok: true, message: 'SMS code verified', correlationId: corrId };
    }

    /**
     * Step 2.3: Verify Google Authenticator (TOTP) for password reset
     */
    @Post('password/reset/verify-totp')
    @HttpCode(HttpStatus.OK)
    async resetPasswordVerifyTotp(
        @Body() dto: ResetVerifyTotpDto,
        @Headers('x-correlation-id') correlationId?: string,
    ): Promise<StepBasedResponse> {
        const corrId = correlationId || uuidv4();

        const tokenDataStr = await this.redisService.get(`reset_token:${dto.resetToken}`);
        if (!tokenDataStr) {
            throw new UnauthorizedException({ code: 'INVALID_TOKEN', message: 'Invalid or expired reset token' });
        }

        const tokenData = JSON.parse(tokenDataStr);
        const userId = tokenData?.userId as string;
        const requiresTotp = !!tokenData?.requiresTotp;
        if (!requiresTotp) {
            throw new BadRequestException({ code: 'TOTP_NOT_REQUIRED', message: 'TOTP not required for this reset' });
        }

        await this.totpService.verifyTotpCode({ userId, code: dto.code });
        const ttlSeconds = this.getResetTokenTtlSeconds();
        await this.setResetFlag(dto.resetToken, 'totp', ttlSeconds);

        return { ok: true, message: 'Authenticator verified', correlationId: corrId };
    }

    /**
     * Step 3: Confirm password reset
     */
    @Post('password/reset/confirm')
    @HttpCode(HttpStatus.OK)
    async resetPasswordConfirm(
        @Body() dto: ResetPasswordConfirmDto,
        @Req() req: Request,
        @Headers('x-correlation-id') correlationId?: string,
    ): Promise<StepBasedResponse> {
        const corrId = correlationId || uuidv4();
        const ipAddress = this.extractIpAddress(req);
        const userAgent = req.headers['user-agent'] || 'Unknown';

        const tokenDataStr = await this.redisService.get(
            `reset_token:${dto.resetToken}`,
        );

        if (!tokenDataStr) {
            throw new UnauthorizedException({
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired reset token',
            });
        }

        const parsedTokenData = JSON.parse(tokenDataStr);
        const userId = parsedTokenData?.userId;
        const email = parsedTokenData?.email;

        const requiresSmsOtp = !!parsedTokenData?.requiresSmsOtp;
        const requiresTotp = !!parsedTokenData?.requiresTotp;

        if (requiresSmsOtp) {
            const smsOk = await this.getResetFlag(dto.resetToken, 'sms');
            if (!smsOk) {
                throw new UnauthorizedException({
                    code: 'SMS_OTP_REQUIRED',
                    message: 'SMS verification required to reset password',
                });
            }
        }

        if (requiresTotp) {
            const totpOk = await this.getResetFlag(dto.resetToken, 'totp');
            if (!totpOk) {
                throw new UnauthorizedException({
                    code: 'TOTP_REQUIRED',
                    message: 'Authenticator verification required to reset password',
                });
            }
        }

        await this.stepBasedAuthService.updatePassword(userId, dto.newPassword);
        await this.stepBasedAuthService.revokeAllUserSessions(
            userId,
            ipAddress,
            userAgent,
        );
        await this.redisService.del(`reset_token:${dto.resetToken}`);
        await this.redisService.del(`reset_sms_verified:${dto.resetToken}`);
        await this.redisService.del(`reset_totp_verified:${dto.resetToken}`);

        // Best-effort security notification: do not fail password reset if email delivery fails
        if (typeof email === 'string' && email.length > 0) {
            try {
                await this.notificationsService.sendEmail({
                    to: email,
                    template: 'security.password_reset_completed',
                    subject: 'Your password was changed',
                    variables: {
                        displayName: email.split('@')[0],
                        companyName: 'DECOEXCHANGE',
                        ipAddress,
                        userAgent,
                        timestamp: new Date().toISOString(),
                    },
                    user_id: userId,
                    idempotency_key: `security:password_reset_completed:${userId}:${dto.resetToken}`,
                    priority: 'high',
                });

                await this.withdrawalsHoldService.applyWithdrawalsHoldAndNotify({
                    userId,
                    email,
                    ipAddress,
                    userAgent,
                    reason: 'password_reset',
                });
            } catch (e) {
                // Intentionally ignore - reset password must succeed even if notifications are down
            }
        }

        await this.telemetryService.logEvent({
            userId,
            action: 'password_reset_success',
            ipAddress,
            userAgent,
            outcome: 'success',
            correlationId: corrId,
        });

        return {
            ok: true,
            nextStep: 'DONE',
            message:
                'Password reset successfully. Please login with your new password.',
            correlationId: corrId,
        };
    }

    /**
     * Resend OTP
     */
    @Post('otp/resend')
    @HttpCode(HttpStatus.OK)
    async resendOtp(
        @Body() dto: ResendOtpDto,
        @Headers('x-correlation-id') correlationId?: string,
    ): Promise<StepBasedResponse> {
        const corrId = correlationId || uuidv4();

        const sessionKey = `pending_${dto.purpose}:${dto.sessionId}`;
        const sessionDataStr = await this.redisService.get(sessionKey);

        if (!sessionDataStr) {
            throw new BadRequestException({
                code: 'INVALID_SESSION',
                message: 'Invalid or expired session',
            });
        }

        const { userId } = JSON.parse(sessionDataStr);
        const otpCode = await this.otpService.generateOTP(userId, dto.purpose);

        try {
            const parsed = JSON.parse(sessionDataStr);
            const email = parsed?.email;
            if (typeof email === 'string' && email.length > 0) {
                await this.sendOtpEmail({
                    to: email,
                    userId,
                    purpose: dto.purpose,
                    code: otpCode,
                });
            }
        } catch (e) {
            if (!this.shouldReturnDebugOtp()) {
                throw new InternalServerErrorException('Failed to send OTP');
            }
        }

        return {
            ok: true,
            message: 'OTP resent successfully',
            ...(this.shouldReturnDebugOtp() ? { debugOtpCode: otpCode } : {}),
            correlationId: corrId,
        };
    }

    /**
     * Helper: Extract IP address
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
            path: '/api/v1/auth',
        });
    }
}
