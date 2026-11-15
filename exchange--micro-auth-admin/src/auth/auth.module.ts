import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CryptoModule } from '../crypto/crypto.module';
import { RedisModule } from '../redis/redis.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from './controllers/auth.controller';
import { StepBasedAuthController } from './controllers/step-based-auth.controller';
import { SecurityController } from './controllers/security.controller';
import { SmsOtpController } from './controllers/sms-otp.controller';
import { MfaController } from './controllers/mfa.controller';
import { ReauthController } from './controllers/reauth.controller';
import { UserService } from './services/user.service';
import { CredentialService } from './services/credential.service';
import { SessionService } from './services/session.service';
import { TokenService } from './services/token.service';
import { AuthService } from './services/auth.service';
import { AuditService } from './services/audit.service';
import { OtpService } from './services/otp.service';
import { SmsOtpService } from './services/sms-otp.service';
import { TotpService } from './services/totp.service';
import { ReauthService } from './services/reauth.service';
import { TelemetryService } from './services/telemetry.service';
import { EmailDomainValidator } from './validators/email-domain.validator';
import { StepBasedAuthService } from './services/step-based-auth.service';
import { SuspiciousActivityService } from './services/suspicious-activity.service';
import { WithdrawalsHoldService } from './services/withdrawals-hold.service';
import { GeoIpService } from './services/geoip/geoip.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { SecurityHeadersInterceptor } from './interceptors/security-headers.interceptor';

@Module({
  imports: [DatabaseModule, CryptoModule, RedisModule, NotificationsModule],
  controllers: [
    AuthController,
    StepBasedAuthController,
    SecurityController,
    SmsOtpController,
    MfaController,
    ReauthController,
  ],
  providers: [
    UserService,
    CredentialService,
    SessionService,
    TokenService,
    AuthService,
    AuditService,
    OtpService,
    SmsOtpService,
    TotpService,
    ReauthService,
    TelemetryService,
    EmailDomainValidator,
    StepBasedAuthService,
    SuspiciousActivityService,
    WithdrawalsHoldService,
    GeoIpService,
    JwtAuthGuard,
    RateLimitGuard,
    SecurityHeadersInterceptor,
  ],
  exports: [
    AuthService,
    UserService,
    OtpService,
    TelemetryService,
    WithdrawalsHoldService,
    JwtAuthGuard,
    RateLimitGuard,
    SecurityHeadersInterceptor,
  ],
})
export class AuthModule { }
