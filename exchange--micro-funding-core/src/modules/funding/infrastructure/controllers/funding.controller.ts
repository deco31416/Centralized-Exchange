import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InternalAuthGuard } from '../../../../common/guards/internal-auth.guard';
import { ConfirmFundingUseCase } from '../../application/use-cases/confirm-funding.use-case';
import { CreateFundingIntentUseCase } from '../../application/use-cases/create-funding-intent.use-case';
import { GetFundingMethodsUseCase } from '../../application/use-cases/get-funding-methods.use-case';
import { GetSavedCardsUseCase } from '../../application/use-cases/get-saved-cards.use-case';
import { QuoteFundingUseCase } from '../../application/use-cases/quote-funding.use-case';
import { SaveCardUseCase } from '../../application/use-cases/save-card.use-case';
import { FUNDING_METHODS_PORT } from '../../application/tokens';
import type { FundingMethodsPort } from '../../application/ports/funding-methods.port';
import type { FundingMethodEntity } from '../../domain/entities/funding-method.entity';
import { ConfirmFundingDto } from '../dtos/confirm-funding.dto';
import { CreateFundingIntentDto } from '../dtos/create-funding-intent.dto';
import { BlcAdminActionDto } from '../dtos/blc-admin-action.dto';
import { BlcDepositRequestDto } from '../dtos/blc-deposit-request.dto';
import { BlcDevTopupDto } from '../dtos/blc-dev-topup.dto';
import { QuoteFundingDto } from '../dtos/quote-funding.dto';
import { SaveCardDto } from '../dtos/save-card.dto';
import { BlcDepositRequestsStore, type BlcDepositMethod } from '../adapters/blc-deposit-requests.store';

@ApiTags('funding')
@ApiBearerAuth()
@ApiHeader({
  name: 'Authorization',
  required: false,
  description:
    'Bearer token interno. Opcional en local si INTERNAL_AUTH_TOKEN está vacío',
})
@UseGuards(InternalAuthGuard)
@Controller('funding')
export class FundingController {
  constructor(
    private readonly getFundingMethodsUseCase: GetFundingMethodsUseCase,
    private readonly createFundingIntentUseCase: CreateFundingIntentUseCase,
    private readonly quoteFundingUseCase: QuoteFundingUseCase,
    private readonly confirmFundingUseCase: ConfirmFundingUseCase,
    private readonly saveCardUseCase: SaveCardUseCase,
    private readonly getSavedCardsUseCase: GetSavedCardsUseCase,
    private readonly blcStore: BlcDepositRequestsStore,
    @Inject(FUNDING_METHODS_PORT)
    private readonly fundingMethodsPort: FundingMethodsPort,
  ) {}

  private resolveUserId(headerUserId?: string): string {
    if (!headerUserId || headerUserId.trim().length === 0) {
      throw new BadRequestException('x-user-id es requerido para operaciones BLC');
    }
    return headerUserId.trim();
  }

  @Get('methods')
  @ApiQuery({ name: 'fiat', required: false, example: 'MXN' })
  @ApiQuery({ name: 'country', required: false, example: 'MX' })
  async getMethods(
    @Query('fiat') fiat?: string,
    @Query('country') country?: string,
  ) {
    const data = await this.getFundingMethodsUseCase.execute({
      fiatCode: fiat,
      countryCode: country,
    });

    return {
      success: true,
      message: 'Funding methods retrieved successfully',
      data,
    };
  }

  @Post('intent')
  async createIntent(@Body() dto: CreateFundingIntentDto) {
    const data = await this.createFundingIntentUseCase.execute(dto);

    return {
      success: true,
      message: 'Funding intent created successfully',
      data,
    };
  }

  @Post('quote')
  async quote(@Body() dto: QuoteFundingDto) {
    const data = await this.quoteFundingUseCase.execute(dto);

    return {
      success: true,
      message: 'Funding quote generated successfully',
      data,
    };
  }

  @Post('confirm')
  async confirm(@Body() dto: ConfirmFundingDto) {
    const data = await this.confirmFundingUseCase.execute(dto);

    return {
      success: true,
      message: 'Funding confirmation processed successfully',
      data,
    };
  }

  @Get('cards')
  @ApiQuery({ name: 'userId', required: true })
  async getSavedCards(@Query('userId') userId: string) {
    const data = await this.getSavedCardsUseCase.execute(userId);

    return {
      success: true,
      message: 'Saved cards retrieved successfully',
      data,
    };
  }

  @Post('cards')
  async saveCard(@Body() dto: SaveCardDto) {
    const data = await this.saveCardUseCase.execute(dto);

    return {
      success: true,
      message: 'Card saved successfully',
      data,
    };
  }

  @Get('blc/deposit-methods')
  @ApiQuery({ name: 'country', required: false, example: 'MX' })
  @ApiQuery({ name: 'fiat', required: false, example: 'MXN' })
  async getBlcDepositMethods(
    @Query('country') country?: string,
    @Query('fiat') fiat?: string,
  ) {
    const data = this.blcStore.getDepositMethods({
      country,
      fiatCode: fiat,
    });

    return {
      success: true,
      message: 'BLC deposit methods retrieved successfully',
      data,
    };
  }

  @Post('blc/dev-topup')
  async blcDevTopup(
    @Body() dto: BlcDevTopupDto,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const isProduction = (process.env.NODE_ENV || 'development') === 'production';
    const devTopupEnabled =
      String(process.env.BLC_DEV_TOPUP_ENABLED || '').toLowerCase() === 'true';

    if (isProduction && !devTopupEnabled) {
      throw new ForbiddenException('BLC dev topup no disponible en producción');
    }

    if (dto.currency !== 'BLC') {
      throw new BadRequestException('Solo se permite currency=BLC para dev topup');
    }

    const userId = this.resolveUserId(headerUserId);
    const data = await this.blcStore.createDevTopup({
      userId,
      amount: dto.amount,
      reason: dto.reason,
    });

    return {
      success: true,
      message: 'BLC dev topup acreditado en wallet-ledger',
      data,
    };
  }

  @Post('blc/deposit-requests')
  async createBlcDepositRequest(
    @Body() dto: BlcDepositRequestDto,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    if (dto.currency !== 'BLC') {
      throw new BadRequestException('Solo se aceptan solicitudes en moneda BLC');
    }
    const userId = this.resolveUserId(headerUserId);
    const data = this.blcStore.createDepositRequest({
      userId,
      amount: dto.amount,
      selectedPaymentMethodId: dto.selectedPaymentMethodId,
      userNote: dto.userNote,
      reference: dto.reference,
    });

    return {
      success: true,
      message: 'Solicitud de carga BLC creada en estado PENDING_REVIEW',
      data,
    };
  }

  @Get('blc/deposit-requests')
  async listBlcDepositRequests(@Headers('x-user-id') headerUserId?: string) {
    const userId = this.resolveUserId(headerUserId);
    const data = this.blcStore.listUserRequests(userId);
    return {
      success: true,
      message: 'Solicitudes BLC recuperadas',
      data,
    };
  }

  @Get('admin/methods')
  async adminListFundingMethods() {
    const data = await this.fundingMethodsPort.listAllMethods();
    return {
      success: true,
      message: 'Métodos admin de funding recuperados',
      data,
    };
  }

  @Get('admin/methods/:code')
  async adminGetFundingMethod(@Param('code') code: string) {
    const method = await this.fundingMethodsPort.getMethodByCode(code);
    if (!method) {
      throw new NotFoundException('Método no encontrado');
    }
    return {
      success: true,
      message: 'Método recuperado',
      data: method,
    };
  }

  @Post('admin/methods')
  async adminCreateFundingMethod(@Body() dto: FundingMethodEntity) {
    const data = await this.fundingMethodsPort.createMethod(dto);
    return {
      success: true,
      message: 'Método creado',
      data,
    };
  }

  @Patch('admin/methods/:code')
  async adminPatchFundingMethod(@Param('code') code: string, @Body() dto: Partial<FundingMethodEntity>) {
    const data = await this.fundingMethodsPort.updateMethod(code, dto);
    if (!data) {
      throw new NotFoundException('Método no encontrado');
    }
    return {
      success: true,
      message: 'Método actualizado',
      data,
    };
  }

  @Post('admin/methods/:code/enable')
  async adminEnableFundingMethod(@Param('code') code: string) {
    const data = await this.fundingMethodsPort.updateMethod(code, {
      enabled: true,
      disabledReason: undefined,
    });
    if (!data) {
      throw new NotFoundException('Método no encontrado');
    }
    return {
      success: true,
      message: 'Método habilitado',
      data,
    };
  }

  @Post('admin/methods/:code/disable')
  async adminDisableFundingMethod(@Param('code') code: string, @Body() dto?: BlcAdminActionDto) {
    const data = await this.fundingMethodsPort.updateMethod(code, {
      enabled: false,
      disabledReason: dto?.adminNote || 'Próximamente disponible',
    });
    if (!data) {
      throw new NotFoundException('Método no encontrado');
    }
    return {
      success: true,
      message: 'Método deshabilitado',
      data,
    };
  }

  @Delete('admin/methods/:code')
  async adminDeleteFundingMethod(@Param('code') code: string) {
    const deleted = await this.fundingMethodsPort.updateMethod(code, { enabled: false });
    if (!deleted) {
      throw new NotFoundException('Método no encontrado');
    }
    return {
      success: true,
      message: 'Método eliminado',
    };
  }

  @Get('admin/blc/deposit-methods')
  async adminListBlcDepositMethods() {
    const data = this.blcStore.getAllMethods();
    return {
      success: true,
      message: 'Métodos BLC admin recuperados',
      data,
    };
  }

  @Post('admin/blc/deposit-methods')
  async adminCreateBlcDepositMethod(@Body() dto: Omit<BlcDepositMethod, 'methodId' | 'createdAt' | 'updatedAt'>) {
    const data = this.blcStore.createMethod(dto);
    return {
      success: true,
      message: 'Método BLC creado',
      data,
    };
  }

  @Patch('admin/blc/deposit-methods/:id')
  async adminPatchBlcDepositMethod(@Param('id') id: string, @Body() dto: Partial<BlcDepositMethod>) {
    const data = this.blcStore.updateMethod(id, dto);
    if (!data) {
      throw new NotFoundException('Método no encontrado');
    }
    return {
      success: true,
      message: 'Método BLC actualizado',
      data,
    };
  }

  @Post('admin/blc/deposit-methods/:id/enable')
  async adminEnableBlcDepositMethod(@Param('id') id: string) {
    const data = this.blcStore.enableMethod(id);
    if (!data) {
      throw new NotFoundException('Método no encontrado');
    }
    return {
      success: true,
      message: 'Método BLC habilitado',
      data,
    };
  }

  @Post('admin/blc/deposit-methods/:id/disable')
  async adminDisableBlcDepositMethod(@Param('id') id: string) {
    const data = this.blcStore.disableMethod(id);
    if (!data) {
      throw new NotFoundException('Método no encontrado');
    }
    return {
      success: true,
      message: 'Método BLC deshabilitado',
      data,
    };
  }

  @Get('admin/blc/deposit-requests')
  async adminListBlcRequests(@Query('status') status?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_MORE_INFO') {
    const data = this.blcStore.listAllRequests(status);
    return {
      success: true,
      message: 'Solicitudes BLC admin recuperadas',
      data,
    };
  }

  @Post('admin/blc/deposit-requests/:id/approve')
  async adminApproveBlcRequest(
    @Param('id') id: string,
    @Body() dto: BlcAdminActionDto,
    @Headers('x-admin-id') adminId?: string,
  ) {
    const data = await this.blcStore.approveRequest(id, adminId?.trim() || 'admin', dto.adminNote);
    if (!data) {
      throw new NotFoundException('Solicitud BLC no encontrada');
    }
    return {
      success: true,
      message: 'Solicitud BLC aprobada',
      data,
    };
  }

  @Post('admin/blc/deposit-requests/:id/reject')
  async adminRejectBlcRequest(
    @Param('id') id: string,
    @Body() dto: BlcAdminActionDto,
    @Headers('x-admin-id') adminId?: string,
  ) {
    const data = this.blcStore.rejectRequest(id, adminId?.trim() || 'admin', dto.adminNote);
    if (!data) {
      throw new NotFoundException('Solicitud BLC no encontrada');
    }
    return {
      success: true,
      message: 'Solicitud BLC rechazada',
      data,
    };
  }

  @Post('admin/blc/deposit-requests/:id/needs-more-info')
  async adminNeedsMoreInfoBlcRequest(
    @Param('id') id: string,
    @Body() dto: BlcAdminActionDto,
    @Headers('x-admin-id') adminId?: string,
  ) {
    const data = this.blcStore.needsMoreInfoRequest(id, adminId?.trim() || 'admin', dto.adminNote);
    if (!data) {
      throw new NotFoundException('Solicitud BLC no encontrada');
    }
    return {
      success: true,
      message: 'Solicitud BLC marcada como NEEDS_MORE_INFO',
      data,
    };
  }
}