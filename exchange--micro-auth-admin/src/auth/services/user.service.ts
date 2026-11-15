import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Email, EmailDocument } from '../../database/schemas/email.schema';
import { UserStatus } from '../../shared/types/common.types';
import { CryptoService } from '../../crypto/crypto.service';
import { RegisterDto } from '../dto/register.dto';
import { UserResponseDto } from '../dto/response.dto';

/**
 * Service for managing users and their basic information
 */
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Email.name) private readonly emailModel: Model<EmailDocument>,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * Creates a new user with email
   */
  async createUser(registerDto: RegisterDto): Promise<UserDocument> {
    const { email, org_id } = registerDto;
    const emailLower = email.toLowerCase();

    // Check if email already exists
    const existingEmail = await this.emailModel
      .findOne({ email_lower: emailLower })
      .exec();
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    // Create user
    const user = new this.userModel({
      status: UserStatus.PENDING_VERIFICATION,
      org_id,
    });
    await user.save();

    // Create email record
    const emailRecord = new this.emailModel({
      user_id: user._id,
      email,
      email_lower: emailLower,
      is_primary: true,
      is_verified: false,
    });
    await emailRecord.save();

    // Update user with primary email reference
    user.primary_email_id = emailRecord._id as Types.ObjectId;
    await user.save();

    return user;
  }

  /**
   * Finds user by email
   */
  async findUserByEmail(email: string): Promise<UserDocument | null> {
    const emailLower = email.toLowerCase();
    const emailRecord = await this.emailModel
      .findOne({ email_lower: emailLower })
      .exec();

    if (!emailRecord) {
      return null;
    }

    return await this.userModel.findById(emailRecord.user_id).exec();
  }

  /**
   * Finds user by ID
   */
  async findUserById(
    userId: string | Types.ObjectId,
  ): Promise<UserDocument | null> {
    return await this.userModel.findById(userId).exec();
  }

  async findUserByUsername(username: string): Promise<UserDocument | null> {
    const usernameLower = this.normalizeUsername(username);
    return await this.userModel.findOne({ username_lower: usernameLower }).exec();
  }

  async setUsername(userId: string | Types.ObjectId, username: string): Promise<void> {
    const normalized = this.normalizeUsername(username);
    this.assertUsernameValid(normalized);

    const existing = await this.userModel
      .findOne({ username_lower: normalized, _id: { $ne: userId } })
      .exec();
    if (existing) {
      throw new ConflictException({ code: 'USERNAME_TAKEN', message: 'Username not available' });
    }

    const result = await this.userModel
      .updateOne(
        { _id: userId },
        { username: username.trim(), username_lower: normalized, updated_at: new Date() },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Updates user status
   */
  async updateUserStatus(
    userId: string | Types.ObjectId,
    status: UserStatus,
  ): Promise<void> {
    const result = await this.userModel
      .updateOne({ _id: userId }, { status, updated_at: new Date() })
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async setUserRoles(
    userId: string | Types.ObjectId,
    roles: string[],
  ): Promise<void> {
    const uniqueRoles = Array.from(
      new Set((roles || []).map((r) => String(r || '').trim()).filter(Boolean)),
    );

    if (uniqueRoles.length === 0) {
      throw new BadRequestException({
        code: 'ROLES_REQUIRED',
        message: 'roles must contain at least one role',
      });
    }

    const result = await this.userModel
      .updateOne(
        { _id: userId },
        { roles: uniqueRoles, updated_at: new Date() },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  private normalizeUsername(username: string): string {
    return String(username || '').trim().toLowerCase();
  }

  private assertUsernameValid(usernameLower: string): void {
    // Keep consistent with dashboard legacy: 4-18, letters/numbers/._-
    if (!/^[a-z0-9._-]{4,18}$/.test(usernameLower)) {
      throw new BadRequestException({
        code: 'INVALID_USERNAME',
        message: 'username must match ^[a-zA-Z0-9._-]{4,18}$',
      });
    }
  }

  /**
   * Verifies user's primary email
   */
  async verifyUserEmail(userId: string | Types.ObjectId): Promise<void> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mark primary email as verified
    await this.emailModel
      .updateOne({ _id: user.primary_email_id }, { is_verified: true })
      .exec();

    // Update user status if pending verification
    if (user.status === UserStatus.PENDING_VERIFICATION) {
      await this.updateUserStatus(userId, UserStatus.ACTIVE);
    }
  }

  /**
   * Updates user profile information (firstName, lastName, phone, birthDate)
   */
  async updateUserProfile(
    userId: string | Types.ObjectId,
    profileData: {
      username?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      birthDate?: string; // ISO format: YYYY-MM-DD
      country?: string;
    },
  ): Promise<void> {
    const updateData: any = { updated_at: new Date() };

    if (profileData.username !== undefined) {
      const normalized = this.normalizeUsername(profileData.username);
      this.assertUsernameValid(normalized);

      const existing = await this.userModel
        .findOne({ username_lower: normalized, _id: { $ne: userId } })
        .exec();
      if (existing) {
        throw new ConflictException({
          code: 'USERNAME_TAKEN',
          message: 'Username not available',
        });
      }

      updateData.username = String(profileData.username || '').trim();
      updateData.username_lower = normalized;
    }

    if (profileData.firstName !== undefined) {
      updateData.first_name = profileData.firstName;
    }
    if (profileData.lastName !== undefined) {
      updateData.last_name = profileData.lastName;
    }
    if (profileData.phone !== undefined) {
      updateData.phone = profileData.phone;
    }
    if (profileData.birthDate !== undefined) {
      updateData.birth_date = profileData.birthDate;
    }
    if (profileData.country !== undefined) {
      updateData.country = profileData.country;
    }

    const result = await this.userModel
      .updateOne({ _id: userId }, updateData)
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async setSmsOtpEnabled(
    userId: string | Types.ObjectId,
    enabled: boolean,
  ): Promise<void> {
    const result = await this.userModel
      .updateOne(
        { _id: userId },
        { sms_otp_enabled: enabled, updated_at: new Date() },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async getUserPhone(
    userId: string | Types.ObjectId,
  ): Promise<string | undefined> {
    const user = await this.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user.phone || undefined;
  }

  async setWithdrawalsHoldUntil(
    userId: string | Types.ObjectId,
    withdrawalsHoldUntil: Date,
  ): Promise<void> {
    const result = await this.userModel
      .updateOne(
        { _id: userId },
        { withdrawals_hold_until: withdrawalsHoldUntil, updated_at: new Date() },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async changePrimaryEmail(
    userId: string | Types.ObjectId,
    newEmail: string,
  ): Promise<EmailDocument> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const emailLower = newEmail.toLowerCase();
    const existingEmail = await this.emailModel
      .findOne({ email_lower: emailLower })
      .exec();

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    if (user.primary_email_id) {
      await this.emailModel
        .updateOne({ _id: user.primary_email_id }, { is_primary: false })
        .exec();
    }

    const emailRecord = new this.emailModel({
      user_id: user._id,
      email: newEmail,
      email_lower: emailLower,
      is_primary: true,
      is_verified: false,
    });

    await emailRecord.save();

    user.primary_email_id = emailRecord._id as Types.ObjectId;
    user.updated_at = new Date();
    await user.save();

    return emailRecord;
  }

  /**
   * Gets user's primary email
   */
  async getUserPrimaryEmail(
    userId: string | Types.ObjectId,
  ): Promise<EmailDocument | null> {
    const user = await this.findUserById(userId);
    if (!user || !user.primary_email_id) {
      return null;
    }

    return await this.emailModel.findById(user.primary_email_id).exec();
  }

  /**
   * Checks if user email is verified
   */
  async isUserEmailVerified(userId: string | Types.ObjectId): Promise<boolean> {
    const emailRecord = await this.getUserPrimaryEmail(userId);
    return emailRecord?.is_verified || false;
  }

  /**
   * Converts user document to response DTO
   */
  async convertToResponseDto(user: UserDocument): Promise<UserResponseDto> {
    const emailRecord = await this.getUserPrimaryEmail(
      user._id as Types.ObjectId,
    );

    return {
      id: (user._id as Types.ObjectId).toString(),
      email: emailRecord?.email || '',
      status: user.status,
      is_email_verified: emailRecord?.is_verified || false,
      has_mfa: false, // Will be implemented by MFA service
      created_at: user.created_at,
      updated_at: user.updated_at,
      org_id: user.org_id,
      roles: Array.isArray((user as any).roles) ? (user as any).roles : undefined,
    };
  }

  /**
   * Soft deletes a user (marks as deleted)
   */
  async deleteUser(userId: string | Types.ObjectId): Promise<void> {
    const result = await this.userModel
      .updateOne(
        { _id: userId },
        { status: UserStatus.DELETED, updated_at: new Date() },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Validates user can perform action (active and verified)
   */
  async validateUserActive(
    userId: string | Types.ObjectId,
  ): Promise<UserDocument> {
    const user = await this.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === UserStatus.DELETED) {
      throw new BadRequestException('User account has been deleted');
    }

    if (user.status === UserStatus.LOCKED) {
      throw new BadRequestException('User account is locked');
    }

    return user;
  }

  /**
   * 📋 Find users with pagination
   */
  async findUsersWithPagination(
    query: any,
    skip: number,
    limit: number,
  ): Promise<UserDocument[]> {
    return await this.userModel
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  /**
   * 🔢 Count users matching query
   */
  async countUsers(query: any): Promise<number> {
    return await this.userModel.countDocuments(query).exec();
  }

  /**
   * 🔍 Search users by email (partial match)
   */
  async searchUsersByEmail(searchTerm: string): Promise<EmailDocument[]> {
    const emailLower = searchTerm.toLowerCase();
    return await this.emailModel
      .find({
        email_lower: new RegExp(emailLower, 'i'),
      })
      .limit(100)
      .exec();
  }
}
