import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { TokenService } from './token.service';
import { CredentialService } from './credential.service';
import { SessionService } from './session.service';
import { OtpService } from './otp.service';
import { TelemetryService } from './telemetry.service';
import { EmailDomainValidator } from '../validators/email-domain.validator';
import { CryptoService } from '../../crypto/crypto.service';
import { UserStatus } from '../../shared/types/common.types';

interface StepBasedUser {
    id: string;
    email: string;
}

interface StepBasedUserResponse {
    id: string;
    email?: string;
    [k: string]: any;
}

interface TokenPair {
    access_token: string;
    refresh_token: string;
}

/**
 * Wrapper service for step-based authentication flows
 * Orchestrates legacy services without modifying them
 */
@Injectable()
export class StepBasedAuthService {
    private readonly accessTokenTtl: number;

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly credentialService: CredentialService,
        private readonly sessionService: SessionService,
        private readonly otpService: OtpService,
        private readonly telemetryService: TelemetryService,
        private readonly emailDomainValidator: EmailDomainValidator,
        private readonly cryptoService: CryptoService,
        private readonly configService: ConfigService,
    ) {
        this.accessTokenTtl = this.configService.get<number>('JWT_ACCESS_TOKEN_TTL') || 600;
    }

    /**
     * Validates user credentials (for step-based auth)
     */
    async validateUser(
        email: string,
        password: string,
    ): Promise<StepBasedUser | null> {
        const user = await this.userService.findUserByEmail(email);
        if (!user) {
            return null;
        }

        // Check user status
        if (
            user.status === UserStatus.LOCKED ||
            user.status === UserStatus.DELETED
        ) {
            return null;
        }

        // Check if user has password credential
        const hasCredential = await this.credentialService.hasPasswordCredential(user._id as Types.ObjectId);

        // Verify password
        const isPasswordValid = await this.credentialService.verifyPassword(
            user._id as Types.ObjectId,
            password,
        );

        if (!isPasswordValid) {
            return null;
        }

        const userEmail = await this.userService.getUserPrimaryEmail(
            user._id as Types.ObjectId,
        );

        return {
            id: (user._id as Types.ObjectId).toString(),
            email: userEmail?.email || email,
        };
    }

    /**
     * Creates user in pending state (for step-based register)
     */
    async createPending(dto: {
        username?: string;
        email: string;
        password?: string;
        firstName?: string;
        lastName?: string;
    }): Promise<StepBasedUser> {
        const { email } = dto;

        // Validate email domain
        const domainValidation = this.emailDomainValidator.validate(email);
        if (!domainValidation.valid) {
            throw new BadRequestException({
                code: 'INVALID_EMAIL_DOMAIN',
                message: domainValidation.reason,
            });
        }

        // Check if user already exists
        const existingUser = await this.userService.findUserByEmail(email);
        if (existingUser) {
            // Si el usuario existe pero está en estado "pending_verification", permitir re-envío de OTP
            if (existingUser.status === UserStatus.PENDING_VERIFICATION) {
                return {
                    id: (existingUser._id as Types.ObjectId).toString(),
                    email: email, // Usar el email del parámetro
                };
            }
            // Si el usuario ya está activo, rechazar
            throw new BadRequestException({
                code: 'EMAIL_EXISTS',
                message: 'Email already registered',
            });
        }

        // Create user using existing service
        const user = await this.userService.createUser({
            email,
            password: dto.password || 'temp_placeholder', // Will be set later if needed
        } as any);

        if (dto.username) {
            await this.userService.setUsername(user._id as Types.ObjectId, dto.username);
        }

        return {
            id: (user._id as Types.ObjectId).toString(),
            email,
        };
    }

    /**
     * Finds user by email (wrapper method)
     */
    async findByEmail(email: string): Promise<StepBasedUser | null> {
        const user = await this.userService.findUserByEmail(email);
        if (!user) {
            return null;
        }

        const emailRecord = await this.userService.getUserPrimaryEmail(
            user._id as Types.ObjectId,
        );

        return {
            id: (user._id as Types.ObjectId).toString(),
            email: emailRecord?.email || email,
        };
    }

    /**
     * Activates user account (verifies email & makes active)
     */
    async activateUser(userId: string): Promise<void> {
        await this.userService.verifyUserEmail(userId);
    }

    /**
     * Updates user profile information
     */
    async updateUserProfile(
        userId: string,
        profileData: {
            firstName?: string;
            lastName?: string;
            phone?: string;
            birthDate?: string;
            country?: string;
        },
    ): Promise<void> {
        await this.userService.updateUserProfile(userId, profileData);
    }

    /**
     * Updates user password (wrapper for reset)
     */
    async updatePassword(userId: string, newPassword: string): Promise<void> {
        await this.credentialService.resetPassword(userId, newPassword);
    }

    /**
     * Creates initial password credential for user
     * Use this for new users during registration
     */
    async createPasswordCredential(userId: string, password: string): Promise<void> {
        // Check if credential already exists
        const hasCredential = await this.credentialService.hasPasswordCredential(userId);
        
        if (hasCredential) {
            // If credential exists, update it instead
            await this.credentialService.resetPassword(userId, password);
        } else {
            // Create new credential
            await this.credentialService.createPasswordCredential(userId, password);
        }
        
        // Verify it was created
        const nowHasCredential = await this.credentialService.hasPasswordCredential(userId);
        if (!nowHasCredential) {
            throw new BadRequestException('Password credential could not be created.');
        }
    }

    /**
     * Issues access and refresh tokens for user
     * Uses existing session/token infrastructure
     */
    async issueTokens(
        userId: string,
        ipAddress: string,
        userAgent: string,
    ): Promise<TokenPair> {
        const user = await this.userService.findUserById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Create or update device
        const device = await this.sessionService.createOrUpdateDevice(
            user._id as Types.ObjectId,
            'Unknown Device',
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

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    /**
     * Revokes all user sessions (wrapper for logout all)
     */
    async revokeAllUserSessions(
        userId: string,
        ipAddress: string,
        userAgent: string,
    ): Promise<void> {
        await this.authService.logoutAll(userId, ipAddress, userAgent);
    }

    /**
     * Devuelve el user DTO usado por el frontend (mismo que legacy v1).
     * Importante para que el dashboard pueda persistir sesión tras OTP.
     */
    async getUserResponseDto(userId: string): Promise<StepBasedUserResponse> {
        const user = await this.userService.findUserById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return this.userService.convertToResponseDto(user) as any;
    }
}
