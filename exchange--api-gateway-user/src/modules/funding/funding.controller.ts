import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Controller('funding')
export class FundingController {
  private readonly baseUrl: string;
  private readonly internalToken: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('config.services.funding');
    this.internalToken = this.configService.get<string>('config.internalAuthToken') || '';
  }

  private headers(req: Request) {
    const userIdHeader = req.headers['x-user-id'];
    const userEmailHeader = req.headers['x-user-email'];
    const authorizationHeader = req.headers['authorization'];

    const normalizedUserId =
      Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;
    const normalizedUserEmail =
      Array.isArray(userEmailHeader) ? userEmailHeader[0] : userEmailHeader;
    const normalizedAuth =
      Array.isArray(authorizationHeader) ? authorizationHeader[0] : authorizationHeader;

    return {
      Authorization: `Bearer ${this.internalToken}`,
      'X-Internal-Auth': this.internalToken,
      'X-Forwarded-Authorization': normalizedAuth || '',
      ...(normalizedUserId ? { 'x-user-id': normalizedUserId } : {}),
      ...(normalizedUserEmail ? { 'x-user-email': normalizedUserEmail } : {}),
    };
  }

  private assertUserContext(req: Request) {
    const userIdHeader = req.headers['x-user-id'];
    const normalizedUserId =
      Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;

    if (!normalizedUserId || normalizedUserId.trim().length === 0) {
      throw new UnauthorizedException('User context missing (x-user-id)');
    }
  }

  @Get('methods')
  async getMethods(
    @Query('fiat') fiat?: string,
    @Query('country') country?: string,
    @Req() req?: Request,
  ) {
    const response = await firstValueFrom(
      this.http.get(`${this.baseUrl}/api/v1/funding/methods`, {
        headers: this.headers(req as Request),
        params: {
          ...(fiat ? { fiat } : {}),
          ...(country ? { country } : {}),
        },
      }),
    );

    return response.data;
  }

  @Post('intent')
  async createIntent(@Body() body: any, @Req() req: Request) {
    const response = await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/funding/intent`, body, {
        headers: this.headers(req),
      }),
    );

    return response.data;
  }

  @Post('quote')
  async quote(@Body() body: any, @Req() req: Request) {
    const response = await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/funding/quote`, body, {
        headers: this.headers(req),
      }),
    );

    return response.data;
  }

  @Post('confirm')
  async confirm(@Body() body: any, @Req() req: Request) {
    const response = await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/funding/confirm`, body, {
        headers: this.headers(req),
      }),
    );

    return response.data;
  }

  @Get('cards')
  async getSavedCards(@Query('userId') userId: string, @Req() req: Request) {
    const response = await firstValueFrom(
      this.http.get(`${this.baseUrl}/api/v1/funding/cards`, {
        params: { userId },
        headers: this.headers(req),
      }),
    );

    return response.data;
  }

  @Post('cards')
  async saveCard(@Body() body: any, @Req() req: Request) {
    const response = await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/funding/cards`, body, {
        headers: this.headers(req),
      }),
    );

    return response.data;
  }

  @Get('blc/deposit-methods')
  async getBlcDepositMethods(
    @Query('fiat') fiat?: string,
    @Query('country') country?: string,
    @Req() req?: Request,
  ) {
    this.assertUserContext(req as Request);

    const response = await firstValueFrom(
      this.http.get(`${this.baseUrl}/api/v1/funding/blc/deposit-methods`, {
        headers: this.headers(req as Request),
        params: {
          ...(fiat ? { fiat } : {}),
          ...(country ? { country } : {}),
        },
      }),
    );

    return response.data;
  }

  @Post('blc/dev-topup')
  async createBlcDevTopup(@Body() body: any, @Req() req: Request) {
    this.assertUserContext(req);

    const response = await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/funding/blc/dev-topup`, body, {
        headers: this.headers(req),
      }),
    );
    return response.data;
  }

  @Post('blc/deposit-requests')
  async createBlcDepositRequest(@Body() body: any, @Req() req: Request) {
    this.assertUserContext(req);

    const response = await firstValueFrom(
      this.http.post(`${this.baseUrl}/api/v1/funding/blc/deposit-requests`, body, {
        headers: this.headers(req),
      }),
    );
    return response.data;
  }

  @Get('blc/deposit-requests')
  async listBlcDepositRequests(@Req() req: Request) {
    this.assertUserContext(req);

    const response = await firstValueFrom(
      this.http.get(`${this.baseUrl}/api/v1/funding/blc/deposit-requests`, {
        headers: this.headers(req),
      }),
    );
    return response.data;
  }
}