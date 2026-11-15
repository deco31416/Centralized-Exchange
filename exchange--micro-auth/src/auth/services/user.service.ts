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

  /**
   * Searches for users by phone number or email.
   * Returns basic profile info (no sensitive data).
   */
  async searchByPhoneOrEmail(
    query: string,
    limit = 5,
  ): Promise<
    Array<{
      userId: string;
      email?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    }>
  > {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // Search by email
    const emailDocs = await this.emailModel
      .find({ email_lower: { $regex: `^${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` } })
      .limit(limit)
      .lean()
      .exec();

    const emailUserIds = emailDocs.map((e) => e.user_id);
    const emailMap = new Map(emailDocs.map((e) => [e.user_id.toString(), e.email]));

    // Search by phone (exact prefix match)
    const phoneDocs = await this.userModel
      .find({ phone: { $regex: `^${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` }, status: { $ne: 'DELETED' } })
      .select('_id username first_name last_name phone')
      .limit(limit)
      .lean()
      .exec();

    // Merge results, dedup by userId
    const seen = new Set<string>();
    const results: Array<{
      userId: string;
      email?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    }> = [];

    // Users found by email
    if (emailUserIds.length > 0) {
      const users = await this.userModel
        .find({ _id: { $in: emailUserIds }, status: { $ne: 'DELETED' } })
        .select('_id username first_name last_name phone')
        .lean()
        .exec();
      for (const u of users) {
        const id = (u._id as Types.ObjectId).toString();
        if (!seen.has(id)) {
          seen.add(id);
          results.push({
            userId: id,
            email: emailMap.get(id),
            username: u.username,
            firstName: u.first_name,
            lastName: u.last_name,
            phone: u.phone,
          });
        }
      }
    }

    // Users found by phone
    for (const u of phoneDocs) {
      const id = (u._id as Types.ObjectId).toString();
      if (!seen.has(id)) {
        seen.add(id);
        // Get email for this user
        const emailDoc = await this.emailModel
          .findOne({ user_id: u._id, is_primary: true })
          .lean()
          .exec();
        results.push({
          userId: id,
          email: emailDoc?.email,
          username: u.username,
          firstName: u.first_name,
          lastName: u.last_name,
          phone: u.phone,
        });
      }
    }

    return results.slice(0, limit);
  }

  async listForAdmin(options: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{
    users: Array<{
      id: string;
      email?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      country?: string;
      status: UserStatus;
      emailVerified: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.min(200, Math.max(1, Number(options.limit || 50)));
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {
      status: { $ne: UserStatus.DELETED },
    };

    if (options.status) {
      filter.status = options.status;
    }

    const search = String(options.search || '').trim().toLowerCase();
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matchingEmails = await this.emailModel
        .find({ email_lower: { $regex: escaped } })
        .select({ user_id: 1 })
        .lean()
        .exec();
      const matchingIds = matchingEmails.map((email) => email.user_id);

      filter.$or = [
        { _id: { $in: matchingIds } },
        { username_lower: { $regex: escaped } },
        { phone: { $regex: escaped } },
        { first_name: { $regex: escaped, $options: 'i' } },
        { last_name: { $regex: escaped, $options: 'i' } },
      ];
    }

    const [total, users] = await Promise.all([
      this.userModel.countDocuments(filter).exec(),
      this.userModel
        .find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
    ]);

    const userIds = users.map((user) => user._id as Types.ObjectId);
    const emails = await this.emailModel
      .find({ user_id: { $in: userIds }, is_primary: true })
      .lean()
      .exec();
    const emailByUserId = new Map(
      emails.map((email) => [email.user_id.toString(), email]),
    );

    return {
      users: users.map((user) => {
        const id = (user._id as Types.ObjectId).toString();
        const email = emailByUserId.get(id);

        return {
          id,
          email: email?.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          country: user.country,
          status: user.status,
          emailVerified: !!email?.is_verified,
          createdAt: user.created_at?.toISOString?.() || new Date().toISOString(),
          updatedAt: user.updated_at?.toISOString?.() || new Date().toISOString(),
        };
      }),
      total,
      page,
      limit,
    };
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
   * Returns total count of non-deleted users (aggregate stat — no PII).
   */
  async countActive(): Promise<number> {
    return this.userModel
      .countDocuments({ status: { $ne: UserStatus.DELETED } })
      .exec();
  }
}
