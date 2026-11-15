import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateRemittanceDto } from '../dto/create-remittance.dto';
import { RemittanceEntity } from '../../domain/entities/remittance.entity';
import { RemittanceStatus } from '../../domain/enums/remittance-status.enum';
import { AUTH_CLIENT } from '../../domain/ports/auth-client.port';
import type { AuthClientPort } from '../../domain/ports/auth-client.port';
import { REMITTANCE_REPOSITORY } from '../../domain/ports/remittance-repository.port';
import type { RemittanceRepositoryPort } from '../../domain/ports/remittance-repository.port';
import { WALLET_LEDGER_CLIENT } from '../../domain/ports/wallet-ledger-client.port';
import type { WalletLedgerClientPort } from '../../domain/ports/wallet-ledger-client.port';

@Injectable()
export class CreateRemittanceUseCase {
  constructor(
    @Inject(REMITTANCE_REPOSITORY)
    private readonly remittanceRepository: RemittanceRepositoryPort,
    @Inject(AUTH_CLIENT)
    private readonly authClient: AuthClientPort,
    @Inject(WALLET_LEDGER_CLIENT)
    private readonly walletLedgerClient: WalletLedgerClientPort,
  ) {}

  async execute(dto: CreateRemittanceDto): Promise<RemittanceEntity> {
    const sender = await this.authClient.validateUser(dto.senderUserId);

    if (!sender) {
      throw new BadRequestException('El usuario remitente no existe o no es válido');
    }

    const walletSummary = await this.walletLedgerClient.getSummary(dto.senderUserId);

    if (walletSummary.walletId !== dto.senderWalletId) {
      throw new BadRequestException(
        'El monedero enviado no coincide con el monedero principal del usuario',
      );
    }

    if (dto.receiverType === 'DECOX' && !dto.receiverUserId) {
      const recipient = await this.authClient.searchRecipient(dto.receiverIdentifier);

      if (!recipient) {
        throw new BadRequestException(
          'El destinatario DECOX no existe para el identificador enviado',
        );
      }

      dto.receiverUserId = recipient.id;
      dto.receiverName = dto.receiverName || recipient.name;
      dto.receiverEmail = dto.receiverEmail || recipient.email;
      dto.receiverPhone = dto.receiverPhone || recipient.phone;
    }

    const now = new Date().toISOString();

    const remittance = new RemittanceEntity({
      id: randomUUID(),
      senderUserId: dto.senderUserId,
      senderWalletId: dto.senderWalletId,
      senderName: sender.name,
      senderEmail: sender.email,
      receiverType: dto.receiverType,
      receiverUserId: dto.receiverUserId,
      receiverIdentifier: dto.receiverIdentifier,
      receiverName: dto.receiverName,
      receiverEmail: dto.receiverEmail,
      receiverPhone: dto.receiverPhone,
      amountdeco: dto.amountdeco,
      sourceCurrency: dto.sourceCurrency,
      targetCurrency: dto.targetCurrency,
      targetAmount: dto.targetAmount,
      fxRate: dto.fxRate,
      fee: dto.fee,
      concept: dto.concept,
      status: RemittanceStatus.CREATED,
      createdAt: now,
      updatedAt: now,
    });

    return this.remittanceRepository.create(remittance);
  }
}