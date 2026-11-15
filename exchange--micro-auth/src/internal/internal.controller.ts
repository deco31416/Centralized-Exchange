import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';

import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserService } from '../auth/services/user.service';
import { WithdrawalsHoldService } from '../auth/services/withdrawals-hold.service';
import { InternalAuthGuard } from './guards/internal-auth.guard';
import { AdminSetCountryDto } from './dto/admin-country-change.dto';
import { AdminSetSmsOtpDto } from './dto/admin-sms-otp.dto';
import { MfaFactor, MfaFactorDocument } from '../database/schemas/mfa-factor.schema';
import { MfaType } from '../shared/types/common.types';

@Controller('internal')
@UseGuards(InternalAuthGuard)
export class InternalController {
  constructor(
    private readonly userService: UserService,
    private readonly withdrawalsHoldService: WithdrawalsHoldService,
    @InjectModel(MfaFactor.name)
    private readonly mfaFactorModel: Model<MfaFactorDocument>,
  ) {}

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<{
    users: Array<{
      id: string;
      email?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      country?: string;
      status: string;
      emailVerified: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    return this.userService.listForAdmin({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      search,
    });
  }

  @Get('users/search')
  @HttpCode(HttpStatus.OK)
  async searchUsers(
    @Query('q') query: string,
  ): Promise<{
    results: Array<{
      userId: string;
      email?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    }>;
  }> {
    if (!query || query.trim().length < 3) {
      throw new BadRequestException('Query must be at least 3 characters');
    }

    const results = await this.userService.searchByPhoneOrEmail(query, 5);
    return { results };
  }

  @Get('users/:userId/profile')
  @HttpCode(HttpStatus.OK)
  async getUserProfile(@Param('userId') userId: string): Promise<{
    userId: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    birthDate?: string;
    country?: string;
    status: string;
    smsOtpEnabled: boolean;
    createdAt: string;
  }> {
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get primary email
    const emailData = await this.userService.getUserPrimaryEmail(userId);

    return {
      userId: (user._id as Types.ObjectId).toString(),
      email: emailData?.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      birthDate: user.birth_date,
      country: user.country,
      status: user.status,
      smsOtpEnabled: !!user.sms_otp_enabled,
      createdAt: user.created_at?.toISOString() || new Date().toISOString(),
    };
  }

  @Get('users/:userId/policy')
  @HttpCode(HttpStatus.OK)
  async getUserPolicy(@Param('userId') userId: string): Promise<{
    userId: string;
    country?: string;
    withdrawals_hold_until?: string;
    is_withdrawals_held: boolean;
    sms_otp_enabled?: boolean;
    totp_enabled?: boolean;
  }> {
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const holdUntil = user.withdrawals_hold_until;
    const isHeld = !!holdUntil && holdUntil.getTime() > Date.now();

    const totp = await this.mfaFactorModel
      .findOne({ user_id: new Types.ObjectId(userId), type: MfaType.TOTP })
      .select({ _id: 1 })
      .lean()
      .exec();

    return {
      userId,
      country: user.country,
      withdrawals_hold_until: holdUntil?.toISOString(),
      is_withdrawals_held: isHeld,
      sms_otp_enabled: !!user.sms_otp_enabled,
      totp_enabled: !!totp,
    };
  }

  @Post('users/:userId/sms-otp')
  @HttpCode(HttpStatus.OK)
  async adminSetSmsOtp(
    @Param('userId') userId: string,
    @Body() dto: AdminSetSmsOtpDto,
  ): Promise<{ success: true; enabled: boolean }> {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!!dto.enabled && !user.phone) {
      throw new BadRequestException({
        code: 'PHONE_REQUIRED',
        message: 'User must have phone set to enable SMS OTP',
      });
    }

    await this.userService.setSmsOtpEnabled(
      userId as unknown as Types.ObjectId,
      !!dto.enabled,
    );

    return { success: true, enabled: !!dto.enabled };
  }

  @Get('users/count')
  @HttpCode(HttpStatus.OK)
  async getUsersCount(): Promise<{ count: number }> {
    const count = await this.userService.countActive();
    return { count };
  }

  @Post('users/:userId/country')
  @HttpCode(HttpStatus.OK)
  async adminSetCountry(
    @Param('userId') userId: string,
    @Body() dto: AdminSetCountryDto,
  ): Promise<{ success: true; hold_until: string }> {
    const country = dto.country.trim().toUpperCase();
    const holdHours = dto.holdHours ?? 24;
    const holdMinutes = holdHours * 60;
    const holdUntil = new Date(Date.now() + holdMinutes * 60_000);

    await this.userService.updateUserProfile(
      userId as unknown as Types.ObjectId,
      {
        country,
      },
    );
    await this.userService.setWithdrawalsHoldUntil(
      userId as unknown as Types.ObjectId,
      holdUntil,
    );

    const email = await this.userService.getUserPrimaryEmail(userId);
    await this.withdrawalsHoldService.applyWithdrawalsHoldAndNotify({
      userId,
      email: email?.email,
      reason: 'country_changed',
      holdMinutes,
    });

    return { success: true, hold_until: holdUntil.toISOString() };
  }
}
