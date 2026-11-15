import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';

import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserService } from '../auth/services/user.service';
import { CredentialService } from '../auth/services/credential.service';
import { WithdrawalsHoldService } from '../auth/services/withdrawals-hold.service';
import { InternalAuthGuard } from './guards/internal-auth.guard';
import { AdminSetCountryDto } from './dto/admin-country-change.dto';
import { AdminSetSmsOtpDto } from './dto/admin-sms-otp.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { MfaFactor, MfaFactorDocument } from '../database/schemas/mfa-factor.schema';
import { MfaType } from '../shared/types/common.types';

@Controller('internal')
@UseGuards(InternalAuthGuard)
export class InternalController {
  constructor(
    private readonly userService: UserService,
    private readonly credentialService: CredentialService,
    private readonly withdrawalsHoldService: WithdrawalsHoldService,
    @InjectModel(MfaFactor.name)
    private readonly mfaFactorModel: Model<MfaFactorDocument>,
  ) {}

  @Post('admin-users')
  @HttpCode(HttpStatus.CREATED)
  async createAdminUser(@Body() dto: CreateAdminUserDto) {
    // Create user (email record + pending user)
    const user = await this.userService.createUser({
      email: dto.email,
      password: dto.password,
      org_id: dto.org_id,
    } as any);

    // Set password credential
    await this.credentialService.createPasswordCredential(user._id, dto.password);

    // Optionally set username
    if (dto.username) {
      await this.userService.setUsername(user._id, dto.username);
    }

    // Set roles (default already 'admin' via schema)
    if (dto.roles && dto.roles.length > 0) {
      const uniqueRoles = Array.from(
        new Set(dto.roles.map((r) => String(r || '').trim()).filter(Boolean)),
      );

      await this.userService.setUserRoles(user._id, uniqueRoles);
    }

    // Mark email verified + activate user
    await this.userService.verifyUserEmail(user._id);

    const fresh = await this.userService.findUserById(user._id);
    if (!fresh) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      user: await this.userService.convertToResponseDto(fresh),
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

  /**
   * 📋 Listar todos los usuarios (con paginación y filtros)
   */
  @Get('users')
  @HttpCode(HttpStatus.OK)
  async listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '50', 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    // Filtro por status
    if (status) {
      query.status = status;
    }

    // Filtro por rol
    if (role) {
      query.roles = role;
    }

    // Búsqueda por email o username
    if (search) {
      const emailRecords = await this.userService.searchUsersByEmail(search);
      const userIds = emailRecords.map(e => e.user_id);
      
      query.$or = [
        { _id: { $in: userIds } },
        { username: new RegExp(search, 'i') },
      ];
    }

    const [users, total] = await Promise.all([
      this.userService.findUsersWithPagination(query, skip, limitNum),
      this.userService.countUsers(query),
    ]);

    const usersWithEmails = await Promise.all(
      users.map(async (user) => {
        const email = await this.userService.getUserPrimaryEmail(user._id.toString());
        return {
          ...await this.userService.convertToResponseDto(user),
          email: email?.email,
        };
      }),
    );

    return {
      users: usersWithEmails,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    };
  }

  /**
   * 👥 Listar solo usuarios administrativos
   */
  @Get('admins')
  @HttpCode(HttpStatus.OK)
  async listAdmins(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '50', 10);
    const skip = (pageNum - 1) * limitNum;

    // Buscar usuarios con roles admin
    const query = { roles: { $exists: true, $ne: [] } };

    const [admins, total] = await Promise.all([
      this.userService.findUsersWithPagination(query, skip, limitNum),
      this.userService.countUsers(query),
    ]);

    const adminsWithEmails = await Promise.all(
      admins.map(async (user) => {
        const email = await this.userService.getUserPrimaryEmail(user._id.toString());
        return {
          ...await this.userService.convertToResponseDto(user),
          email: email?.email,
        };
      }),
    );

    return {
      admins: adminsWithEmails,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    };
  }

  /**
   * 🔍 Obtener detalles de un usuario específico
   */
  @Get('users/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserDetails(@Param('userId') userId: string) {
    const user = await this.userService.findUserById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const email = await this.userService.getUserPrimaryEmail(userId);
    const totp = await this.mfaFactorModel
      .findOne({ user_id: new Types.ObjectId(userId), type: MfaType.TOTP })
      .select({ _id: 1 })
      .lean()
      .exec();

    return {
      ...await this.userService.convertToResponseDto(user),
      email: email?.email,
      email_verified: email?.is_verified,
      totp_enabled: !!totp,
    };
  }
}
