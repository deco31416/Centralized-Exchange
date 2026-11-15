import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Credential,
  CredentialDocument,
} from '../../database/schemas/credential.schema';
import { CredentialType } from '../../shared/types/common.types';
import { CryptoService } from '../../crypto/crypto.service';
import zxcvbn from 'zxcvbn';

/**
 * Service for managing user credentials (passwords, WebAuthn, etc.)
 */
@Injectable()
export class CredentialService {
  private readonly passwordBlocklist = new Set([
    'password',
    'password123',
    '123456',
    'qwerty',
    'abc123',
    'letmein',
    'welcome',
    'monkey',
    '1234567890',
    'password1',
    'admin',
    'root',
  ]);

  constructor(
    @InjectModel(Credential.name)
    private readonly credentialModel: Model<CredentialDocument>,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * Creates a password credential for user
   */
  async createPasswordCredential(
    userId: string | Types.ObjectId,
    password: string,
  ): Promise<void> {
    this.validatePasswordStrength(password);

    const { hash, salt } = await this.cryptoService.hashPassword(password);

    // Ensure userId is ObjectId
    const objectIdUserId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const credential = new this.credentialModel({
      user_id: objectIdUserId,
      type: CredentialType.PASSWORD,
      password_hash: hash,
      password_salt: salt,
    });

    await credential.save();
  }

  /**
   * Verifies password for user
   */
  async verifyPassword(
    userId: string | Types.ObjectId,
    password: string,
  ): Promise<boolean> {
    // Ensure userId is ObjectId
    const objectIdUserId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    
    const credential = await this.credentialModel
      .findOne({
        user_id: objectIdUserId,
        type: CredentialType.PASSWORD,
      })
      .exec();

    if (!credential || !credential.password_hash || !credential.password_salt) {
      return false;
    }

    const isValid = await this.cryptoService.verifyPassword(
      password,
      credential.password_hash,
      credential.password_salt,
    );

    if (isValid) {
      // Update last used timestamp
      credential.last_used_at = new Date();
      await credential.save();
    }

    return isValid;
  }

  /**
   * Updates user password
   */
  async updatePassword(
    userId: string | Types.ObjectId,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Verify current password
    const isCurrentValid = await this.verifyPassword(userId, currentPassword);
    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password
    this.validatePasswordStrength(newPassword);

    // Hash new password
    const { hash, salt } = await this.cryptoService.hashPassword(newPassword);

    // Ensure userId is ObjectId
    const objectIdUserId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    // Update credential
    const result = await this.credentialModel
      .updateOne(
        { user_id: objectIdUserId, type: CredentialType.PASSWORD },
        {
          password_hash: hash,
          password_salt: salt,
          last_used_at: new Date(),
        },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new BadRequestException('Password credential not found');
    }
  }

  /**
   * Resets user password with new password
   */
  async resetPassword(
    userId: string | Types.ObjectId,
    newPassword: string,
  ): Promise<void> {
    this.validatePasswordStrength(newPassword);

    const { hash, salt } = await this.cryptoService.hashPassword(newPassword);

    // Ensure userId is ObjectId
    const objectIdUserId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const result = await this.credentialModel
      .updateOne(
        { user_id: objectIdUserId, type: CredentialType.PASSWORD },
        {
          password_hash: hash,
          password_salt: salt,
          last_used_at: new Date(),
        },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new BadRequestException('Password credential not found');
    }
  }

  /**
   * Checks if user has password credential
   */
  async hasPasswordCredential(
    userId: string | Types.ObjectId,
  ): Promise<boolean> {
    // Ensure userId is ObjectId
    const objectIdUserId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    
    const count = await this.credentialModel
      .countDocuments({
        user_id: objectIdUserId,
        type: CredentialType.PASSWORD,
      })
      .exec();

    return count > 0;
  }

  /**
   * Creates WebAuthn credential for user
   */
  async createWebAuthnCredential(
    userId: string | Types.ObjectId,
    credentialId: string,
    publicKey: string,
    counter: number = 0,
  ): Promise<void> {
    // Check if credential ID already exists
    const existing = await this.credentialModel
      .findOne({
        type: CredentialType.WEBAUTHN,
        webauthn_credential_id: credentialId,
      })
      .exec();

    if (existing) {
      throw new BadRequestException('WebAuthn credential already exists');
    }

    const credential = new this.credentialModel({
      user_id: userId,
      type: CredentialType.WEBAUTHN,
      webauthn_credential_id: credentialId,
      webauthn_public_key: publicKey,
      webauthn_counter: counter,
    });

    await credential.save();
  }

  /**
   * Gets WebAuthn credential by credential ID
   */
  async getWebAuthnCredential(
    credentialId: string,
  ): Promise<CredentialDocument | null> {
    return await this.credentialModel
      .findOne({
        type: CredentialType.WEBAUTHN,
        webauthn_credential_id: credentialId,
      })
      .exec();
  }

  /**
   * Updates WebAuthn counter
   */
  async updateWebAuthnCounter(
    credentialId: string,
    newCounter: number,
  ): Promise<void> {
    await this.credentialModel
      .updateOne(
        { webauthn_credential_id: credentialId },
        {
          webauthn_counter: newCounter,
          last_used_at: new Date(),
        },
      )
      .exec();
  }

  /**
   * Gets user's WebAuthn credentials
   */
  async getUserWebAuthnCredentials(
    userId: string | Types.ObjectId,
  ): Promise<CredentialDocument[]> {
    return await this.credentialModel
      .find({
        user_id: userId,
        type: CredentialType.WEBAUTHN,
      })
      .exec();
  }

  /**
   * Removes credential by ID
   */
  async removeCredential(credentialId: string | Types.ObjectId): Promise<void> {
    await this.credentialModel.findByIdAndDelete(credentialId).exec();
  }

  /**
   * Validates password strength using zxcvbn
   */
  private validatePasswordStrength(password: string): void {
    // Check against blocklist
    if (this.passwordBlocklist.has(password.toLowerCase())) {
      throw new BadRequestException('Password is too common and not allowed');
    }

    // Check minimum requirements
    if (password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    if (password.length > 128) {
      throw new BadRequestException(
        'Password must be no more than 128 characters long',
      );
    }

    // Use zxcvbn for strength analysis
    const result = zxcvbn(password);

    if (result.score < 3) {
      const feedback =
        result.feedback.suggestions.join(' ') || 'Password is too weak';
      throw new BadRequestException(
        `Password strength insufficient: ${feedback}`,
      );
    }
  }
}
