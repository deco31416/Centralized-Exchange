import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { CredentialService } from './credential.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { AuditService } from './audit.service';
import { CryptoService } from '../../crypto/crypto.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto, UserResponseDto } from '../dto/response.dto';
import { UserStatus } from '../../shared/types/common.types';
import { Types } from 'mongoose';

/**
 * Main authentication service that orchestrates login, registration, and token flows
 */
@Injectable()
export class AuthService {
  private readonly accessTokenTtl: number;

  constructor(
    private readonly userService: UserService,
    private readonly credentialService: CredentialService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly auditService: AuditService,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenTtl =
      this.configService.get<number>('JWT_ACCESS_TOKEN_TTL') || 600;
  }

  /**
   * Registers a new user
   */
  async register(
    registerDto: RegisterDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Create user
      const user = await this.userService.createUser(registerDto);

      // Create password credential
      await this.credentialService.createPasswordCredential(
        user._id as Types.ObjectId,
        registerDto.password,
      );

      // Send verification email
      await this.tokenService.sendEmailVerification(
        (user._id as any).toString(),
      );

      // Audit log
      await this.auditService.logEvent(
        (user._id as any).toString(),
        'user.registered',
        `User registered with email: ${registerDto.email}`,
        ipAddress,
        userAgent,
      );

      return {
        success: true,
        message:
          'Registration successful. Please check your email for verification.',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  /**
   * Authenticates user with email and password
   */
  async login(
    loginDto: LoginDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<AuthResponseDto> {
    const { email, password, device_name } = loginDto;

    // Find user
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      await this.auditService.logEvent(
        null,
        'auth.login_failed',
        `Login attempt with non-existent email: ${email}`,
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check user status
    if (user.status === UserStatus.LOCKED) {
      await this.auditService.logEvent(
        (user._id as Types.ObjectId).toString(),
        'auth.login_failed',
        'Login attempt on locked account',
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Account is locked');
    }

    if (user.status === UserStatus.DELETED) {
      await this.auditService.logEvent(
        (user._id as Types.ObjectId).toString(),
        'auth.login_failed',
        'Login attempt on deleted account',
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Account not found');
    }

    // Verify password
    const isPasswordValid = await this.credentialService.verifyPassword(
      user._id as Types.ObjectId,
      password,
    );
    if (!isPasswordValid) {
      await this.auditService.logEvent(
        (user._id as Types.ObjectId).toString(),
        'auth.login_failed',
        'Invalid password',
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // TODO: Check MFA if enabled
    // if (user has MFA && !mfa_code) {
    //   return challenge response
    // }

    // Create or update device
    const device = await this.sessionService.createOrUpdateDevice(
      user._id as Types.ObjectId,
      device_name || 'Unknown Device',
      userAgent,
      ipAddress,
    );

    // Create session
    const session = await this.sessionService.createSession(
      user._id as Types.ObjectId,
      device._id as Types.ObjectId,
      ipAddress,
      userAgent,
    );

    // Create refresh token
    const { token: refreshToken } =
      await this.sessionService.createRefreshToken(
        session._id,
        user._id as Types.ObjectId,
        device._id as Types.ObjectId,
      );

    // Generate access token
    const accessToken = this.cryptoService.signAccessToken({
      sub: (user._id as Types.ObjectId).toString(),
      sid: session._id,
      device_id: (device._id as Types.ObjectId).toString(),
      org_id: user.org_id,
    });

    // Convert user to response DTO
    const userResponse = await this.userService.convertToResponseDto(user);

    // Audit log
    await this.auditService.logEvent(
      (user._id as Types.ObjectId).toString(),
      'auth.login_succeeded',
      'User logged in successfully',
      ipAddress,
      userAgent,
      {
        session_id: session._id,
        device_id: (device._id as Types.ObjectId).toString(),
      },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.accessTokenTtl,
      user: userResponse,
    };
  }

  /**
   * Refreshes access token using refresh token
   */
  async refreshToken(
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<AuthResponseDto> {
    try {
      const { newToken, sessionId, userId, deviceId } =
        await this.sessionService.rotateRefreshToken(refreshToken);

      // Get user
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Validate user is still active
      await this.userService.validateUserActive(userId);

      // Generate new access token
      const accessToken = this.cryptoService.signAccessToken({
        sub: userId,
        sid: sessionId,
        device_id: deviceId,
        org_id: user.org_id,
      });

      // Convert user to response DTO
      const userResponse = await this.userService.convertToResponseDto(user);

      // Audit log
      await this.auditService.logEvent(
        userId,
        'auth.token_refreshed',
        'Access token refreshed',
        ipAddress,
        userAgent,
        { session_id: sessionId },
      );

      return {
        access_token: accessToken,
        refresh_token: newToken,
        token_type: 'Bearer',
        expires_in: this.accessTokenTtl,
        user: userResponse,
      };
    } catch (error) {
      await this.auditService.logEvent(
        null,
        'auth.token_refresh_failed',
        'Token refresh failed',
        ipAddress,
        userAgent,
      );
      throw error;
    }
  }

  /**
   * Logs out user from current session
   */
  async logout(
    sessionId: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ success: boolean }> {
    await this.sessionService.revokeSession(sessionId, 'User logout');

    await this.auditService.logEvent(
      userId,
      'auth.logout',
      'User logged out',
      ipAddress,
      userAgent,
      { session_id: sessionId },
    );

    return { success: true };
  }

  /**
   * Logs out user from all sessions
   */
  async logoutAll(
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ success: boolean }> {
    await this.sessionService.revokeAllUserSessions(
      userId,
      'User global logout',
    );

    await this.auditService.logEvent(
      userId,
      'auth.logout_all',
      'User logged out from all sessions',
      ipAddress,
      userAgent,
    );

    return { success: true };
  }

  /**
   * Verifies email with token
   */
  async verifyEmail(
    token: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.tokenService.verifyEmailToken(token);

    await this.auditService.logEvent(
      result.userId,
      'user.email_verified',
      'Email verified successfully',
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  /**
   * Initiates password reset
   */
  async forgotPassword(
    email: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ success: boolean; message: string }> {
    // Always return success to prevent email enumeration
    try {
      const user = await this.userService.findUserByEmail(email);
      if (user && user.status !== UserStatus.DELETED) {
        await this.tokenService.sendPasswordReset(
          (user._id as Types.ObjectId).toString(),
        );

        await this.auditService.logEvent(
          (user._id as Types.ObjectId).toString(),
          'auth.password_reset_requested',
          'Password reset requested',
          ipAddress,
          userAgent,
        );
      }
    } catch (error) {
      // Log error but don't expose it
      console.error('Password reset error:', error);
    }

    return {
      success: true,
      message:
        'If an account with that email exists, you will receive password reset instructions.',
    };
  }

  /**
   * Resets password with token
   */
  async resetPassword(
    token: string,
    newPassword: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ success: boolean; message: string }> {
    const { userId } = await this.tokenService.verifyPasswordResetToken(token);

    // Reset password
    await this.credentialService.resetPassword(userId, newPassword);

    // Revoke all user sessions for security
    await this.sessionService.revokeAllUserSessions(userId, 'Password reset');

    await this.auditService.logEvent(
      userId,
      'user.password_changed',
      'Password reset completed',
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message:
        'Password reset successfully. Please log in with your new password.',
    };
  }

  /**
   * Changes password for authenticated user
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.credentialService.updatePassword(
      userId,
      currentPassword,
      newPassword,
    );

    // Revoke all other sessions for security
    await this.sessionService.revokeAllUserSessions(userId, 'Password changed');

    await this.auditService.logEvent(
      userId,
      'user.password_changed',
      'Password changed by user',
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      message: 'Password changed successfully. Please log in again.',
    };
  }

  /**
   * Validates JWT token and returns user info
   */
  async validateJwtToken(token: string): Promise<UserResponseDto | null> {
    const payload = this.cryptoService.verifyJwtToken(token);
    if (!payload || !payload.sub) {
      return null;
    }

    // Validate session is still active
    if (payload.sid) {
      try {
        await this.sessionService.validateSession(payload.sid);
      } catch {
        return null;
      }
    }

    const user = await this.userService.findUserById(payload.sub);
    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return await this.userService.convertToResponseDto(user);
  }
}
