import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';
import { CryptoService } from '../../crypto/crypto.service';
import { MfaFactor, MfaFactorDocument } from '../../database/schemas/mfa-factor.schema';
import { MfaType } from '../../shared/types/common.types';

interface TotpSetupStored {
  userId: string;
  label: string;
  secretBase32: string;
  otpauthUrl: string;
  createdAt: number;
}

@Injectable()
export class TotpService {
  private readonly setupTtlSeconds: number;
  private readonly issuer: string;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    @InjectModel(MfaFactor.name)
    private readonly mfaFactorModel: Model<MfaFactorDocument>,
  ) {
    this.setupTtlSeconds = this.configService.get<number>('TOTP_SETUP_TTL_SECONDS', 600);
    this.issuer = this.configService.get<string>('TOTP_ISSUER', 'DECOEXCHANGE');
  }

  async getTotpFactor(userId: string): Promise<MfaFactorDocument | null> {
    return this.mfaFactorModel
      .findOne({ user_id: new Types.ObjectId(userId), type: MfaType.TOTP })
      .exec();
  }

  async startSetup(params: {
    userId: string;
    accountLabel: string; // e.g. email
    deviceLabel?: string; // optional user label
  }): Promise<{
    challengeId: string;
    otpauthUrl: string;
    secretBase32: string;
    qrDataUrl: string;
    expires_in: number;
  }> {
    const challengeId = uuidv4();

    const label = params.deviceLabel?.trim() || 'Primary';
    const name = `${this.issuer}:${params.accountLabel}`;

    const secret = speakeasy.generateSecret({
      length: 20,
      name,
      issuer: this.issuer,
    });

    if (!secret.base32 || !secret.otpauth_url) {
      throw new BadRequestException('Failed to generate TOTP secret');
    }

    const stored: TotpSetupStored = {
      userId: params.userId,
      label,
      secretBase32: secret.base32,
      otpauthUrl: secret.otpauth_url,
      createdAt: Date.now(),
    };

    await this.redisService.set(
      `totp:setup:${challengeId}`,
      JSON.stringify(stored),
      this.setupTtlSeconds,
    );

    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    return {
      challengeId,
      otpauthUrl: secret.otpauth_url,
      secretBase32: secret.base32,
      qrDataUrl,
      expires_in: this.setupTtlSeconds,
    };
  }

  async confirmSetup(params: {
    userId: string;
    challengeId: string;
    code: string;
  }): Promise<{ success: true }> {
    const key = `totp:setup:${params.challengeId}`;
    const storedStr = await this.redisService.get(key);
    if (!storedStr) {
      throw new BadRequestException({
        code: 'TOTP_SETUP_EXPIRED',
        message: 'TOTP setup session not found or expired',
      });
    }

    const stored = JSON.parse(storedStr) as TotpSetupStored;
    if (stored.userId !== params.userId) {
      throw new BadRequestException({
        code: 'TOTP_SETUP_MISMATCH',
        message: 'TOTP setup session mismatch',
      });
    }

    const ok = speakeasy.totp.verify({
      secret: stored.secretBase32,
      encoding: 'base32',
      token: params.code,
      window: 1,
    });

    if (!ok) {
      throw new BadRequestException({
        code: 'INVALID_TOTP',
        message: 'Invalid authenticator code',
      });
    }

    const enc = this.cryptoService.encryptString(stored.secretBase32);

    await this.mfaFactorModel
      .updateOne(
        { user_id: new Types.ObjectId(params.userId), type: MfaType.TOTP },
        {
          $set: {
            user_id: new Types.ObjectId(params.userId),
            type: MfaType.TOTP,
            label: stored.label,
            totp_secret_enc: enc,
            last_used_at: new Date(),
          },
          $setOnInsert: { created_at: new Date() },
        },
        { upsert: true },
      )
      .exec();

    await this.redisService.del(key);

    return { success: true };
  }

  async verifyTotpCode(params: { userId: string; code: string }): Promise<void> {
    const factor = await this.getTotpFactor(params.userId);
    if (!factor?.totp_secret_enc) {
      throw new BadRequestException({
        code: 'TOTP_NOT_ENABLED',
        message: 'Authenticator is not enabled for this user',
      });
    }

    const secretBase32 = this.cryptoService.decryptString(factor.totp_secret_enc);
    const ok = speakeasy.totp.verify({
      secret: secretBase32,
      encoding: 'base32',
      token: params.code,
      window: 1,
    });

    if (!ok) {
      throw new BadRequestException({
        code: 'INVALID_TOTP',
        message: 'Invalid authenticator code',
      });
    }

    await this.mfaFactorModel
      .updateOne(
        { _id: factor._id },
        { last_used_at: new Date() },
      )
      .exec();
  }

  async disableTotp(params: { userId: string; code: string }): Promise<{ success: true }> {
    await this.verifyTotpCode({ userId: params.userId, code: params.code });

    await this.mfaFactorModel
      .deleteOne({ user_id: new Types.ObjectId(params.userId), type: MfaType.TOTP })
      .exec();

    return { success: true };
  }
}
