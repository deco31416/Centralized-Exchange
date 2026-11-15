import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRemittanceDto } from '../../../application/dto/create-remittance.dto';
import { QuoteRemittanceDto } from '../../../application/dto/quote-remittance.dto';
import { ReceiveRemittanceDto } from '../../../application/dto/receive-remittance.dto';
import { UpdateRemittanceStatusDto } from '../../../application/dto/update-remittance-status.dto';
import { CancelRemittanceUseCase } from '../../../application/use-cases/cancel-remittance.use-case';
import { ConfirmRemittanceUseCase } from '../../../application/use-cases/confirm-remittance.use-case';
import { CreateRemittanceUseCase } from '../../../application/use-cases/create-remittance.use-case';
import { GetIncomingRemittancesUseCase } from '../../../application/use-cases/get-incoming-remittances.use-case';
import { GetRemittanceByIdUseCase } from '../../../application/use-cases/get-remittance-by-id.use-case';
import { GetRemittanceQuoteUseCase } from '../../../application/use-cases/get-remittance-quote.use-case';
import { GetRemittanceSummaryUseCase } from '../../../application/use-cases/get-remittance-summary.use-case';
import { GetUserRemittancesUseCase } from '../../../application/use-cases/get-user-remittances.use-case';
import { ReceiveRemittanceUseCase } from '../../../application/use-cases/receive-remittance.use-case';
import { SearchRecipientUseCase } from '../../../application/use-cases/search-recipient.use-case';
import { SendRemittanceUseCase } from '../../../application/use-cases/send-remittance.use-case';
import { UpdateRemittanceStatusUseCase } from '../../../application/use-cases/update-remittance-status.use-case';

@ApiTags('Remittances')
@ApiBearerAuth()
@Controller('remittances')
export class RemittancesController {
  constructor(
    private readonly createRemittanceUseCase: CreateRemittanceUseCase,
    private readonly getRemittanceByIdUseCase: GetRemittanceByIdUseCase,
    private readonly getUserRemittancesUseCase: GetUserRemittancesUseCase,
    private readonly updateRemittanceStatusUseCase: UpdateRemittanceStatusUseCase,
    private readonly confirmRemittanceUseCase: ConfirmRemittanceUseCase,
    private readonly cancelRemittanceUseCase: CancelRemittanceUseCase,
    private readonly sendRemittanceUseCase: SendRemittanceUseCase,
    private readonly getRemittanceSummaryUseCase: GetRemittanceSummaryUseCase,
    private readonly getRemittanceQuoteUseCase: GetRemittanceQuoteUseCase,
    private readonly searchRecipientUseCase: SearchRecipientUseCase,
    private readonly getIncomingRemittancesUseCase: GetIncomingRemittancesUseCase,
    private readonly receiveRemittanceUseCase: ReceiveRemittanceUseCase,
  ) {}

  @Get('me/summary')
  @ApiOperation({ summary: 'Resumen del usuario y su monedero para remesas' })
  getSummary(@Query('userId') userId: string) {
    return this.getRemittanceSummaryUseCase.execute(userId);
  }

  @Post('quote')
  @ApiOperation({ summary: 'Cotizar remesa DECOX -> moneda local' })
  quote(@Body() dto: QuoteRemittanceDto) {
    return this.getRemittanceQuoteUseCase.execute(dto);
  }

  @Get('recipients/search')
  @ApiOperation({ summary: 'Buscar destinatario por correo o teléfono' })
  searchRecipient(@Query('q') query: string) {
    return this.searchRecipientUseCase.execute(query);
  }

  @Post()
  @ApiOperation({ summary: 'Crear remesa' })
  create(@Body() dto: CreateRemittanceDto) {
    return this.createRemittanceUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar remesa por id' })
  findOne(@Param('id') id: string) {
    return this.getRemittanceByIdUseCase.execute(id);
  }

  @Get('user/:senderUserId')
  @ApiOperation({ summary: 'Listar remesas enviadas por un usuario' })
  findByUser(@Param('senderUserId') senderUserId: string) {
    return this.getUserRemittancesUseCase.execute(senderUserId);
  }

  @Get('incoming/:receiverIdentifier')
  @ApiOperation({ summary: 'Listar remesas entrantes por identificador receptor' })
  findIncoming(
    @Param('receiverIdentifier') receiverIdentifier: string,
    @Query('status') status?: 'pending' | 'received',
  ) {
    return this.getIncomingRemittancesUseCase.execute(receiverIdentifier, status);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado manual de la remesa' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateRemittanceStatusDto) {
    return this.updateRemittanceStatusUseCase.execute(id, dto.status);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirmar remesa y reservar saldo en wallet-ledger' })
  confirm(@Param('id') id: string) {
    return this.confirmRemittanceUseCase.execute(id);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Enviar remesa y capturar la reserva en wallet-ledger' })
  send(@Param('id') id: string) {
    return this.sendRemittanceUseCase.execute(id);
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'Cobrar remesa' })
  receive(@Param('id') id: string, @Body() dto: ReceiveRemittanceDto) {
    return this.receiveRemittanceUseCase.execute(id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar remesa' })
  cancel(@Param('id') id: string) {
    return this.cancelRemittanceUseCase.execute(id);
  }
}