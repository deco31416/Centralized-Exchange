import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { P2PDispute, P2PDisputeDocument } from './schemas/p2p-dispute.schema';
import { P2POrder, P2POrderDocument } from '../orders/schemas/p2p-order.schema';
import { P2PEscrow, P2PEscrowDocument } from '../escrow/schemas/p2p-escrow.schema';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { DisputeStatus, EscrowStatus, OrderStatus } from '../../shared/enums/p2p.enums';
import { NotificationClient } from '../../shared/clients/notification.client';
import { CryptoEscrowClient } from '../../shared/clients/crypto-escrow.client';

@Injectable()
export class DisputesService {
  private readonly logger = new Logger(DisputesService.name);

  constructor(
    @InjectModel(P2PDispute.name) private readonly disputeModel: Model<P2PDisputeDocument>,
    @InjectModel(P2POrder.name) private readonly orderModel: Model<P2POrderDocument>,
    @InjectModel(P2PEscrow.name) private readonly escrowModel: Model<P2PEscrowDocument>,
    private readonly notificationClient: NotificationClient,
    private readonly cryptoEscrowClient: CryptoEscrowClient,
  ) {}

  async open(userId: string, orderId: string, dto: CreateDisputeDto): Promise<P2PDispute> {
    const order = await this.orderModel.findOne({ orderId });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const isParticipant = order.buyerId === userId || order.sellerId === userId;
    if (!isParticipant) throw new ForbiddenException('No eres participante de esta orden');

    if (order.status === OrderStatus.RELEASED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('No puedes abrir disputa en una orden ya cerrada');
    }

    const existing = await this.disputeModel.findOne({ orderId, status: { $in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] } });
    if (existing) throw new ConflictException('Ya existe una disputa activa para esta orden');

    const dispute = await this.disputeModel.create({
      disputeId: uuidv4(),
      orderId,
      openedByUserId: userId,
      reason: dto.reason,
      status: DisputeStatus.OPEN,
    });

    order.status = OrderStatus.DISPUTED;
    await order.save();

    await this.notificationClient.notifyDisputeOpened(order.sellerId, order.buyerId, orderId);

    this.logger.warn(`[Disputes] opened | disputeId=${dispute.disputeId} | orderId=${orderId} | by=${userId}`);
    return dispute;
  }

  async findByOrder(orderId: string): Promise<P2PDispute[]> {
    return this.disputeModel.find({ orderId }).lean();
  }

  async findOpen(): Promise<P2PDispute[]> {
    return this.disputeModel
      .find({ status: { $in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] } })
      .sort({ createdAt: 1 })
      .lean();
  }

  async findAll(filters: { status?: string; page?: number; limit?: number } = {}): Promise<{
    disputes: P2PDispute[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;

    const [disputes, total] = await Promise.all([
      this.disputeModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.disputeModel.countDocuments(query),
    ]);

    return { disputes, total, page, limit };
  }

  async findOne(disputeId: string): Promise<P2PDispute> {
    const dispute = await this.disputeModel.findOne({ disputeId }).lean();
    if (!dispute) throw new NotFoundException(`Dispute ${disputeId} not found`);
    return dispute;
  }

  /**
   * Resuelve una disputa ejecutando la acción de escrow correspondiente.
   *
   * RELEASE → Libera el escrow al comprador: releaseCrypto() + order.status = RELEASED
   * REFUND  → Devuelve el escrow al vendedor: refundCrypto() + order.status = CANCELLED
   * REJECT  → Cierra la disputa sin mover cripto (admin rechaza la queja)
   *
   * FIX P2P-STATE-CONSISTENCY-001 (2025-05-02):
   *   La custody call (externa) ocurre PRIMERO.
   *   Si tiene éxito, escrow + order + dispute se actualizan en una transacción MongoDB atómica.
   *   Si la transacción Mongo falla DESPUÉS de que custody ejecutó:
   *     - Se loggea CRITICAL para compensación manual
   *     - Se retorna 500 con información suficiente para correlacionar el estado real
   */
  async resolve(adminId: string, disputeId: string, dto: ResolveDisputeDto): Promise<P2PDispute> {
    const dispute = await this.disputeModel.findOne({ disputeId });
    if (!dispute) throw new NotFoundException(`Dispute ${disputeId} not found`);

    const resolvedStatuses = [DisputeStatus.RESOLVED, DisputeStatus.REJECTED];
    if (resolvedStatuses.includes(dispute.status as DisputeStatus)) {
      throw new BadRequestException('La disputa ya fue resuelta');
    }

    const order = await this.orderModel.findOne({ orderId: dispute.orderId });
    if (!order) throw new NotFoundException(`Order ${dispute.orderId} associated to dispute not found`);

    if (dto.resolution === 'RELEASE' || dto.resolution === 'REFUND') {
      // Buscar el registro de escrow asociado a la orden
      const escrow = await this.escrowModel.findOne({ orderId: dispute.orderId });

      if (!escrow || !escrow.escrowId) {
        throw new BadRequestException(
          `No existe escrow asociado a la orden ${dispute.orderId} — no se puede ejecutar ${dto.resolution}`,
        );
      }

      if (escrow.status === EscrowStatus.RELEASED || escrow.status === EscrowStatus.REFUNDED) {
        throw new BadRequestException(
          `El escrow ya fue liquidado (status=${escrow.status}) — disputa inconsistente`,
        );
      }

      // PASO 1: Llamada EXTERNA a custody-crypto (idempotente por escrowId).
      // Debe ocurrir ANTES de las escrituras Mongo para evitar inconsistencia:
      // si Mongo falla, custody no ejecutó → estado limpio; si custody falla → Mongo no cambia.
      let custodyLedgerTxId: string | undefined;

      if (dto.resolution === 'RELEASE') {
        this.logger.log(
          `[Disputes] ejecutando RELEASE | disputeId=${disputeId} | escrowId=${escrow.escrowId} | orderId=${order.orderId}`,
        );

        const result = await this.cryptoEscrowClient.releaseCrypto({
          escrowId: escrow.escrowId,
          orderId: order.orderId,
          sellerCustodyAccountId: escrow.custodyAccountId,
          buyerUserId: order.buyerId,
          assetCode: order.assetCode,
          cryptoAmount: order.cryptoAmount,
        });

        if (!result.success) {
          throw new InternalServerErrorException(
            `Fallo al liberar escrow: ${result.message || 'error en custody-crypto'}`,
          );
        }

        custodyLedgerTxId = result.ledgerTxId;
        this.logger.log(
          `[Disputes] custody RELEASE OK | disputeId=${disputeId} | ledgerTxId=${custodyLedgerTxId}`,
        );
      } else {
        // REFUND
        this.logger.log(
          `[Disputes] ejecutando REFUND | disputeId=${disputeId} | escrowId=${escrow.escrowId} | orderId=${order.orderId}`,
        );

        const result = await this.cryptoEscrowClient.refundCrypto({
          escrowId: escrow.escrowId,
          orderId: order.orderId,
        });

        if (!result.success) {
          throw new InternalServerErrorException(
            `Fallo al reembolsar escrow: ${result.message || 'error en custody-crypto'}`,
          );
        }

        this.logger.log(`[Disputes] custody REFUND OK | disputeId=${disputeId}`);
      }

      // PASO 2: Actualizar escrow + order + dispute en una transacción MongoDB atómica.
      // FIX P2P-STATE-CONSISTENCY-001: los tres documentos se persisten juntos o ninguno.
      const finalDisputeStatus = DisputeStatus.RESOLVED;
      const newEscrowStatus =
        dto.resolution === 'RELEASE' ? EscrowStatus.RELEASED : EscrowStatus.REFUNDED;
      const newOrderStatus =
        dto.resolution === 'RELEASE' ? OrderStatus.RELEASED : OrderStatus.CANCELLED;
      const resolutionText =
        `[${dto.resolution}] ${dto.adminDecision} — ${dto.reason}` +
        (dto.evidenceNotes ? ` | Evidencia: ${dto.evidenceNotes}` : '');

      const session = await this.disputeModel.db.startSession();
      try {
        await session.withTransaction(async () => {
          escrow.status = newEscrowStatus;
          await escrow.save({ session });

          order.status = newOrderStatus;
          if (custodyLedgerTxId) order.ledgerTxIds.push(custodyLedgerTxId);
          await order.save({ session });

          dispute.status = finalDisputeStatus;
          dispute.resolvedByAdminId = adminId;
          dispute.resolution = resolutionText;
          dispute.resolvedAt = new Date();
          await dispute.save({ session });
        });
      } catch (txError: unknown) {
        const errMsg = txError instanceof Error ? txError.message : String(txError);
        this.logger.error(
          `[Disputes][CRITICAL] Custody ejecutó ${dto.resolution} PERO la transacción Mongo falló — ` +
            `estado INCONSISTENTE. Requiere compensación manual. ` +
            `disputeId=${disputeId} | orderId=${order.orderId} | escrowId=${escrow.escrowId} | ` +
            `custodyLedgerTxId=${custodyLedgerTxId ?? 'none'} | error=${errMsg}`,
        );
        throw new InternalServerErrorException(
          `Custody ${dto.resolution} ejecutado (custodyLedgerTxId=${custodyLedgerTxId ?? 'none'}) ` +
            `pero no se pudo actualizar el estado interno. ` +
            `Contactar soporte con disputeId=${disputeId} para compensación manual.`,
        );
      } finally {
        await session.endSession();
      }

      this.logger.log(
        `[Disputes] resolved | disputeId=${disputeId} | adminId=${adminId} | resolution=${dto.resolution}`,
      );
      return dispute.toObject();
    }

    // REJECT: no mover cripto — solo actualizar la disputa
    const rejectText =
      `[REJECT] ${dto.adminDecision} — ${dto.reason}` +
      (dto.evidenceNotes ? ` | Evidencia: ${dto.evidenceNotes}` : '');

    const session = await this.disputeModel.db.startSession();
    try {
      await session.withTransaction(async () => {
        dispute.status = DisputeStatus.REJECTED;
        dispute.resolvedByAdminId = adminId;
        dispute.resolution = rejectText;
        dispute.resolvedAt = new Date();
        await dispute.save({ session });
      });
    } finally {
      await session.endSession();
    }

    this.logger.log(
      `[Disputes] rejected | disputeId=${disputeId} | adminId=${adminId}`,
    );
    return dispute.toObject();
  }
}
