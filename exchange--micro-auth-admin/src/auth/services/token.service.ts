import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  VerificationToken,
  VerificationTokenDocument,
} from '../../database/schemas/verification-token.schema';
import { TokenPurpose } from '../../shared/types/common.types';
import { CryptoService } from '../../crypto/crypto.service';
import { UserService } from './user.service';
import { RedisService } from '../../redis/redis.service';
import { NotificationsService } from '../../notifications/notifications.service';

/**
 * Service for managing verification tokens and email/SMS sending
 */
@Injectable()
export class TokenService {
  private readonly emailVerificationTtl = 24 * 60 * 60; // 24 hours
  private readonly passwordResetTtl = 60 * 60; // 60 minutes (alineado con template)
  private readonly magicLinkTtl = 15 * 60; // 15 minutes

  constructor(
    @InjectModel(VerificationToken.name)
    private readonly tokenModel: Model<VerificationTokenDocument>,
    private readonly cryptoService: CryptoService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Sends email verification token
   */
  async sendEmailVerification(userId: string): Promise<void> {
    // Rate limit email sending
    const rateLimitKey = `email_verify_rate:${userId}`;
    const count = await this.redisService.incrementCounter(rateLimitKey, 300); // 5 minutes

    if (count > 3) {
      throw new BadRequestException(
        'Too many verification emails sent. Please wait before requesting another.',
      );
    }

    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const email = await this.userService.getUserPrimaryEmail(userId);
    if (!email) {
      throw new BadRequestException('No primary email found');
    }

    // Generate token
    const token = this.cryptoService.generateSecureToken();
    const { hash, salt } = this.cryptoService.hashToken(token);
    const tokenHash = hash + ':' + salt;

    // Save token to database
    const verificationToken = new this.tokenModel({
      user_id: userId,
      email_id: email._id,
      purpose: TokenPurpose.VERIFY_EMAIL,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + this.emailVerificationTtl * 1000),
    });

    await verificationToken.save();

    // Send verification email via notifications service
    try {
      const frontendBaseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
      const verifyUrl = `${frontendBaseUrl}/auth/verify-email?token=${token}`;
      
      await this.notificationsService.sendEmail({
        to: email.email,
        template: 'auth.verify-email',
        subject: 'Verify your email address',
        variables: {
          displayName: email.email.split('@')[0],
          verifyUrl,
          baseUrl: frontendBaseUrl,
          companyName: 'DECOEXCHANGE',
        },
        user_id: userId,
        org_id: user.org_id,
        idempotency_key: `verify-email-${userId}-${Date.now()}`,
        priority: 'high',
      });
    } catch (error) {
      // Log error but don't fail the registration process
      console.error('Failed to send verification email:', error.message);
    }
  }

  /**
   * Verifies email verification token
   */
  async verifyEmailToken(
    token: string,
  ): Promise<{ userId: string; emailId: string }> {
    const { hash, salt } = this.cryptoService.hashToken(token);
    const tokenHash = hash + ':' + salt;

    const verificationToken = await this.tokenModel
      .findOne({
        token_hash: tokenHash,
        purpose: TokenPurpose.VERIFY_EMAIL,
        consumed_at: { $exists: false },
        expires_at: { $gt: new Date() },
      })
      .exec();

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark token as consumed
    verificationToken.consumed_at = new Date();
    await verificationToken.save();

    // Verify the email
    await this.userService.verifyUserEmail(verificationToken.user_id);

    return {
      userId: verificationToken.user_id.toString(),
      emailId: verificationToken.email_id?.toString() || '',
    };
  }

  /**
   * Sends password reset token
   */
  async sendPasswordReset(userId: string): Promise<void> {
    // Rate limit password reset emails
    const rateLimitKey = `password_reset_rate:${userId}`;
    const count = await this.redisService.incrementCounter(rateLimitKey, 300); // 5 minutes

    if (count > 3) {
      throw new BadRequestException(
        'Too many password reset emails sent. Please wait before requesting another.',
      );
    }

    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const email = await this.userService.getUserPrimaryEmail(userId);
    if (!email) {
      throw new BadRequestException('No primary email found');
    }

    // Generate token
    const token = this.cryptoService.generateSecureToken();
    const { hash, salt } = this.cryptoService.hashToken(token);
    const tokenHash = hash + ':' + salt;

    // Invalidate any existing password reset tokens
    await this.tokenModel
      .updateMany(
        {
          user_id: userId,
          purpose: TokenPurpose.RESET_PASSWORD,
          consumed_at: { $exists: false },
        },
        { consumed_at: new Date() },
      )
      .exec();

    // Save new token
    const resetToken = new this.tokenModel({
      user_id: userId,
      purpose: TokenPurpose.RESET_PASSWORD,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + this.passwordResetTtl * 1000),
    });

    await resetToken.save();

    // Enviar email vía notifications microservice (service-to-service)
    // Seguridad: nunca loggear tokens en producción.
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetPath = process.env.FRONTEND_RESET_PASSWORD_PATH || '/reset-password';
    const resetUrl = `${frontendBaseUrl.replace(/\/$/, '')}${resetPath.startsWith('/') ? '' : '/'}${resetPath}?token=${token}`;

    try {
      await this.notificationsService.sendEmail({
        to: email.email,
        template: 'auth.reset-password',
        subject: 'Reset your password',
        variables: {
          displayName: email.email.split('@')[0],
          resetUrl,
          baseUrl: frontendBaseUrl.replace(/\/$/, ''),
        },
        user_id: userId,
        org_id: user.org_id,
        idempotency_key: `reset-password-${userId}-${Date.now()}`,
        priority: 'high',
      });
    } catch (error) {
      // No exponemos el error al cliente (forgot-password debe ser anti-enumeración).
      // Log interno para observabilidad.
      console.error('Failed to send password reset email:', error?.message || error);

      // Dev-only fallback para debug manual (sin emails).
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Password reset token for ${email.email}: ${token}`);
      }
    }
  }

  /**
   * Verifies password reset token
   */
  async verifyPasswordResetToken(token: string): Promise<{ userId: string }> {
    const { hash, salt } = this.cryptoService.hashToken(token);
    const tokenHash = hash + ':' + salt;

    const resetToken = await this.tokenModel
      .findOne({
        token_hash: tokenHash,
        purpose: TokenPurpose.RESET_PASSWORD,
        consumed_at: { $exists: false },
        expires_at: { $gt: new Date() },
      })
      .exec();

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Mark token as consumed
    resetToken.consumed_at = new Date();
    await resetToken.save();

    return {
      userId: resetToken.user_id.toString(),
    };
  }

  /**
   * Sends magic link for passwordless authentication
   */
  async sendMagicLink(email: string): Promise<void> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Rate limit magic link sending
    const rateLimitKey = `magic_link_rate:${user._id}`;
    const count = await this.redisService.incrementCounter(rateLimitKey, 300); // 5 minutes

    if (count > 3) {
      throw new BadRequestException(
        'Too many magic links sent. Please wait before requesting another.',
      );
    }

    // Generate token
    const token = this.cryptoService.generateSecureToken();
    const { hash, salt } = this.cryptoService.hashToken(token);
    const tokenHash = hash + ':' + salt;

    // Save token to Redis (shorter TTL, no need for persistent storage)
    const redisKey = `magic_link:${tokenHash}`;
    await this.redisService.setValue(
      redisKey,
      (user._id as Types.ObjectId).toString(),
      this.magicLinkTtl,
    );

    // TODO: Send actual email
    // For now, just log the token (remove in production)
    console.log(`Magic link token for ${email}: ${String(token)}`);

    // In production, integrate with email service:
    // await this.emailService.sendMagicLinkEmail(email, token);
  }

  /**
   * Verifies magic link token
   */
  async verifyMagicLinkToken(token: string): Promise<{ userId: string }> {
    const { hash, salt } = this.cryptoService.hashToken(token);
    const tokenHash = hash + ':' + salt;
    const redisKey = `magic_link:${tokenHash}`;

    const userId = await this.redisService.getValue(redisKey);
    if (!userId) {
      throw new BadRequestException('Invalid or expired magic link');
    }

    // Delete token after use
    await this.redisService.deleteKey(redisKey);

    return { userId };
  }

  /**
   * Generates and sends OTP for MFA
   */
  async sendMfaOtp(
    userId: string,
    method: 'email' | 'sms' = 'email',
  ): Promise<string> {
    // Rate limit OTP sending
    const rateLimitKey = `mfa_otp_rate:${userId}`;
    const count = await this.redisService.incrementCounter(rateLimitKey, 300); // 5 minutes

    if (count > 5) {
      throw new BadRequestException(
        'Too many OTP requests. Please wait before requesting another.',
      );
    }

    const otp = this.cryptoService.generateNumericOtp(6);
    const challengeId = this.cryptoService.generateSecureToken();

    // Store OTP in Redis with 5-minute expiry
    const redisKey = `mfa_otp:${challengeId}`;
    await this.redisService.setValue(redisKey, `${userId}:${otp}`, 300);

    if (method === 'email') {
      const _user = await this.userService.findUserById(userId);
      const email = await this.userService.getUserPrimaryEmail(userId);
      
      if (email) {
        // TODO: Send actual email
        console.log(`MFA OTP for ${email.email}: ${otp}`);
        // await this.emailService.sendMfaOtp(email.email, otp);
      }
    }

    return challengeId;
  }

  /**
   * Verifies MFA OTP
   */
  async verifyMfaOtp(
    challengeId: string,
    otp: string,
  ): Promise<{ userId: string }> {
    const redisKey = `mfa_otp:${challengeId}`;
    const storedData = await this.redisService.getValue(redisKey);

    if (!storedData) {
      throw new BadRequestException('Invalid or expired OTP challenge');
    }

    const [userId, expectedOtp] = storedData.split(':');

    if (!this.cryptoService.constantTimeCompare(otp, expectedOtp)) {
      throw new BadRequestException('Invalid OTP');
    }

    // Delete OTP after successful verification
    await this.redisService.deleteKey(redisKey);

    return { userId };
  }

  /**
   * Cleans up expired tokens (called by scheduled job)
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.tokenModel
      .deleteMany({
        expires_at: { $lt: new Date() },
      })
      .exec();
  }
}
