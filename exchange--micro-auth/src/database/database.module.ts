import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserSchema } from './schemas/user.schema';
import { Email, EmailSchema } from './schemas/email.schema';
import { Credential, CredentialSchema } from './schemas/credential.schema';
import { Session, SessionSchema } from './schemas/session.schema';
import { SessionEvent, SessionEventSchema } from '../auth/schemas/session-event.schema';
import { Device, DeviceSchema } from './schemas/device.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { MfaFactor, MfaFactorSchema } from './schemas/mfa-factor.schema';
import {
  VerificationToken,
  VerificationTokenSchema,
} from './schemas/verification-token.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { SecurityPolicy, SecurityPolicySchema } from './schemas/security-policy.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        retryAttempts: 3,
        retryDelay: 1000,
        connectionFactory: (connection: any) => {
          // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          connection.plugin(require('mongoose-autopopulate'));
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return connection;
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Email.name, schema: EmailSchema },
      { name: Credential.name, schema: CredentialSchema },
      { name: Session.name, schema: SessionSchema },
      { name: SessionEvent.name, schema: SessionEventSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: MfaFactor.name, schema: MfaFactorSchema },
      { name: VerificationToken.name, schema: VerificationTokenSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: SecurityPolicy.name, schema: SecurityPolicySchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule { }
