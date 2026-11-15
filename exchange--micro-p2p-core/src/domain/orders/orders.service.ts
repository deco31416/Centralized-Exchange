import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { P2POrder, P2POrderDocument } from './schemas/p2p-order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { P2PAd, P2PAdDocument } from '../ads/schemas/p2p-ad.schema';
import { P2PEscrow, P2PEscrowDocument } from '../escrow/schemas/p2p-escrow.schema';
import {
  AdStatus,
  EscrowStatus,
  FiatSettlementStatus,
  OrderStatus,
  PaymentRail,
  PaymentStatus,
} from '../../shared/enums/p2p.enums';
import { CryptoEscrowClient } from '../../shared/clients/crypto-escrow.client';
import { PricingClient } from '../../shared/clients/pricing.client';
import { NotificationClient } from '../../shared/clients/notification.client';

const ORDER_TTL_MINUTES = 30;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(P2POrder.name) private readonly orderModel: Model<P2POrderDocument>,
    @InjectModel(P2PAd.name) private readonly adModel: Model<P2PAdDocument>,
    @InjectModel(P2PEscrow.name) private readonly escrowModel: Model<P2PEscrowDocument>,
    private readonly escrowClient: CryptoEscrowClient,
    private readonly pricingClient: PricingClient,
    private readonly notificationClient: NotificationClient,
    private readonly configService: ConfigService,
  ) {}

  async create(buyerId: string, dto: CreateOrderDto): Promise<P2POrder> {
    // --- Validación del rail de pago ---
    const paymentRail = dto.paymentRail ?? PaymentRail.EXTERNAL_FIAT_PAYMENT;

    if (paymentRail === PaymentRail.INTERNAL_FIAT_WALLET) {
      const enabled = this.configService.get<boolean>('p2pEnableInternalFiatWallet') ?? false;
      if (!enabled) {
        throw new ServiceUnavailableException(
          'INTERNAL_FIAT_WALLET rail no habilitado. ' +
            'Requiere implementación de holds fiat reales en wallet-ledger (P2P-FIAT-HOLD-INTEGRATION-001). ' +
            'Activa con P2P_ENABLE_INTERNAL_FIAT_WALLET=true únicamente cuando el servicio esté listo.',
        );
      }
    }

    if (paymentRail === PaymentRail.EXTERNAL_FIAT_PAYMENT && !dto.paymentMethodId) {
      throw new BadRequestException(
        'paymentMethodId es requerido para el rail EXTERNAL_FIAT_PAYMENT',
      );
    }

    const ad = await this.adModel.findOne({ adId: dto.adId });
    if (!ad) throw new NotFoundException(`Ad ${dto.adId} not found`);
    if (ad.status !== AdStatus.ACTIVE) throw new BadRequestException(`Ad no está ACTIVE (status=${ad.status})`);
    if (buyerId === ad.userId) throw new BadRequestException('No puedes crear una orden en tu propio anuncio');

    // Verificar que el ad acepta el rail solicitado
    const acceptedRails: string[] = (ad.acceptedPaymentRails as string[]) ?? [PaymentRail.EXTERNAL_FIAT_PAYMENT];
    if (!acceptedRails.includes(paymentRail)) {
      throw new BadRequestException(
        `Este anuncio no acepta el rail de pago '${paymentRail}'. Rails aceptados: ${acceptedRails.join(', ')}`,
      );
    }
    // Calcular precio fiat
    let price = ad.fixedPrice || 0;
    if (!price) {
      const conversion = await this.pricingClient.getConversion(ad.assetCode, ad.fiatCode, dto.cryptoAmount);
      if (!conversion.success) throw new BadRequestException('No se pudo obtener precio actual — intenta de nuevo');
      price = conversion.rate;
    }
    const fiatAmount = Number((dto.cryptoAmount * price).toFixed(2));

    if (fiatAmount < ad.minFiatAmount || fiatAmount > ad.maxFiatAmount) {
      throw new BadRequestException(`Monto fiat (${fiatAmount}) fuera del rango [${ad.minFiatAmount} - ${ad.maxFiatAmount}]`);
    }

    // Fee P2P — 0% para MVP (P2P-FEES-ADMIN-001)
    const fee = await this.pricingClient.getP2PFee(ad.assetCode, dto.cryptoAmount);

    // Reservar amount en el Ad de forma atómica (hold-on-order: previene overselling sin hold duplicado en custody)
    const updatedAd = await this.adModel.findOneAndUpdate(
      {
        adId: dto.adId,
        status: AdStatus.ACTIVE,
        availableCryptoAmount: { $gte: dto.cryptoAmount },
      },
      {
        $inc: {
          availableCryptoAmount: -dto.cryptoAmount,
          reservedCryptoAmount: dto.cryptoAmount,
        },
      },
      { new: true },
    );
    if (!updatedAd) {
      throw new BadRequestException(
        `Ad sin suficiente cantidad disponible o no está ACTIVE (adId=${dto.adId}, solicitado=${dto.cryptoAmount})`,
      );
    }
    // Si el Ad quedó agotado, marcarlo COMPLETED
    if (updatedAd.availableCryptoAmount <= 0) {
      await this.adModel.updateOne({ adId: dto.adId }, { $set: { status: AdStatus.COMPLETED } });
    }

    // Escrow de crypto del vendedor (hold-on-order: hold creado por Order, no por Ad)
    const orderId = uuidv4();
    const escrowRef = `order-${orderId}`;
    const escrowResult = await this.escrowClient.lockCrypto({
      userId: ad.userId,
      assetCode: ad.assetCode,
      amount: dto.cryptoAmount,
      reference: escrowRef,
    });

    // Si el escrow falla, restaurar la reserva del Ad antes de lanzar error
    if (!escrowResult.success) {
      await this.adModel.updateOne(
        { adId: dto.adId },
        { $inc: { availableCryptoAmount: dto.cryptoAmount, reservedCryptoAmount: -dto.cryptoAmount } },
      );
      await this.adModel.updateOne(
        { adId: dto.adId, status: AdStatus.COMPLETED },
        { $set: { status: AdStatus.ACTIVE } },
      );
      throw new BadRequestException(
        `No se pudo crear el escrow para la orden: ${escrowResult.message || 'saldo insuficiente en custody'}`,
      );
    }

    // Guardar escrow record
    const escrowId = escrowResult.escrowId || uuidv4();
    await this.escrowModel.create({
      escrowId,
      orderId,
      ownerUserId: ad.userId,
      beneficiaryUserId: buyerId,
      assetCode: ad.assetCode,
      amount: dto.cryptoAmount,
      ledgerHoldRef: escrowResult.escrowId,
      custodyAccountId: escrowResult.custodyAccountId,
      status: escrowResult.status,
      failReason: escrowResult.message,
    });

    const expiresAt = new Date(Date.now() + ORDER_TTL_MINUTES * 60 * 1000);

    const order = await this.orderModel.create({
      orderId,
      adId: ad.adId,
      buyerId,
      sellerId: ad.userId,
      assetCode: ad.assetCode,
      fiatCode: ad.fiatCode,
      cryptoAmount: dto.cryptoAmount,
      fiatAmount,
      price,
      feeAmount: fee.feeAmount,
      feeAsset: fee.feeAsset,
      feeRate: fee.feeRate,
      feeSource: fee.feeSource,
      paymentMethodId: dto.paymentMethodId,
      paymentStatus: PaymentStatus.NOT_PAID,
      status: OrderStatus.PAYMENT_PENDING,
      escrowId,
      expiresAt,
      buyerNote: dto.buyerNote,
      paymentRail,
      fiatSettlementStatus: FiatSettlementStatus.NOT_APPLICABLE,
    });

    await this.notificationClient.notifyOrderCreated(ad.userId, orderId, buyerId);

    this.logger.log(
      `[Orders] created | orderId=${orderId} | buyerId=${buyerId} | sellerId=${ad.userId} | status=PAYMENT_PENDING | escrow=${escrowResult.status}`,
    );

    return order;
  }

  async findById(orderId: string): Promise<P2POrder> {
    const order = await this.orderModel.findOne({ orderId }).lean();
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    return order;
  }

  async findByUser(userId: string, query: QueryOrdersDto) {
    const filter: Record<string, any> = { $or: [{ buyerId: userId }, { sellerId: userId }] };
    if (query.status) filter.status = query.status;
    if (query.assetCode) filter.assetCode = query.assetCode;

    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.orderModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  /** Comprador marca que pagó en fiat externo */
  async markPaid(buyerId: string, orderId: string): Promise<P2POrder> {
    const order = await this.orderModel.findOne({ orderId });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (order.buyerId !== buyerId) throw new ForbiddenException('Solo el comprador puede marcar pago');
    if (order.paymentStatus !== PaymentStatus.NOT_PAID) throw new BadRequestException(`paymentStatus actual: ${order.paymentStatus}`);
    if (order.status !== OrderStatus.PAYMENT_PENDING) throw new BadRequestException(`Order no está en PAYMENT_PENDING (status=${order.status})`);

    order.paymentStatus = PaymentStatus.MARKED_PAID;
    order.status = OrderStatus.PAYMENT_MARKED;
    await order.save();

    await this.notificationClient.notifyPaymentMarked(order.sellerId, orderId);
    this.logger.log(`[Orders] markPaid | orderId=${orderId} | buyerId=${buyerId}`);
    return order.toObject();
  }

  /** Vendedor confirma que recibió el fiat externo */
  async confirmReceived(sellerId: string, orderId: string): Promise<P2POrder> {
    const order = await this.orderModel.findOne({ orderId });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (order.sellerId !== sellerId) throw new ForbiddenException('Solo el vendedor puede confirmar recepción');
    if (order.paymentStatus !== PaymentStatus.MARKED_PAID) {
      throw new BadRequestException('El comprador aún no ha marcado el pago');
    }

    order.paymentStatus = PaymentStatus.CONFIRMED_RECEIVED;
    order.status = OrderStatus.RELEASE_PENDING;
    await order.save();

    this.logger.log(`[Orders] confirmReceived | orderId=${orderId} | sellerId=${sellerId}`);
    return order.toObject();
  }

  /** Vendedor libera el crypto al comprador */
  async releaseCrypto(sellerId: string, orderId: string): Promise<P2POrder> {
    const order = await this.orderModel.findOne({ orderId });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (order.sellerId !== sellerId) throw new ForbiddenException('Solo el vendedor puede liberar');
    if (order.paymentStatus !== PaymentStatus.CONFIRMED_RECEIVED) {
      throw new BadRequestException('Debes confirmar recepción del pago antes de liberar');
    }
    if (order.status !== OrderStatus.RELEASE_PENDING) {
      throw new BadRequestException(`Order no está en RELEASE_PENDING (status=${order.status})`);
    }

    // Verificar escrow
    const escrow = await this.escrowModel.findOne({ escrowId: order.escrowId });
    if (!escrow || escrow.status !== EscrowStatus.LOCKED) {
      throw new BadRequestException('Escrow no disponible o ya fue procesado — contacta soporte');
    }

    const releaseResult = await this.escrowClient.releaseCrypto({
      escrowId: order.escrowId,
      orderId,
      sellerCustodyAccountId: escrow.custodyAccountId,
      buyerUserId: order.buyerId,
      assetCode: order.assetCode,
      cryptoAmount: order.cryptoAmount,
    });

    if (!releaseResult.success) {
      this.logger.error(`[Orders] releaseCrypto FAILED | orderId=${orderId} | ${releaseResult.message}`);
      throw new BadRequestException(`No se pudo liberar el escrow: ${releaseResult.message}`);
    }

    escrow.status = EscrowStatus.RELEASED;
    await escrow.save();

    order.status = OrderStatus.RELEASED;
    if (releaseResult.ledgerTxId) order.ledgerTxIds.push(releaseResult.ledgerTxId);
    await order.save();

    // Actualizar tracking del Ad: reservedCryptoAmount ↓, releasedCryptoAmount ↑
    await this.adModel.updateOne(
      { adId: order.adId },
      { $inc: { reservedCryptoAmount: -order.cryptoAmount, releasedCryptoAmount: order.cryptoAmount } },
    );

    await this.notificationClient.notifyOrderReleased(order.buyerId, orderId);
    this.logger.log(`[Orders] releaseCrypto OK | orderId=${orderId} | buyerId=${order.buyerId}`);
    return order.toObject();
  }

  /** Cancelar orden — prohibido si pago marcado (sugerir disputa) */
  async cancel(userId: string, orderId: string): Promise<P2POrder> {
    const order = await this.orderModel.findOne({ orderId });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const isParticipant = order.buyerId === userId || order.sellerId === userId;
    if (!isParticipant) throw new ForbiddenException('No eres participante de esta orden');

    if (order.paymentStatus === PaymentStatus.MARKED_PAID) {
      throw new BadRequestException(
        'El comprador marcó el pago — no puedes cancelar. Abre una disputa si hay problema.',
      );
    }

    const cancelable = [OrderStatus.CREATED, OrderStatus.PAYMENT_PENDING, OrderStatus.ESCROW_NOT_AVAILABLE];
    if (!cancelable.includes(order.status as OrderStatus)) {
      throw new BadRequestException(`No se puede cancelar en estado ${order.status}`);
    }

    // Devolver escrow si estaba locked
    if (order.escrowId) {
      const escrow = await this.escrowModel.findOne({ escrowId: order.escrowId });
      if (escrow && escrow.status === EscrowStatus.LOCKED) {
        const refund = await this.escrowClient.refundCrypto({ escrowId: order.escrowId, orderId });
        if (refund.success) {
          escrow.status = EscrowStatus.REFUNDED;
          await escrow.save();
        } else {
          this.logger.error(`[Orders] cancel: refund FAILED | orderId=${orderId} | ${refund.message}`);
        }
      }
    }

    // Restaurar amount en el Ad (hold-on-order: libera la reserva de la orden cancelada)
    await this.adModel.updateOne(
      { adId: order.adId },
      { $inc: { availableCryptoAmount: order.cryptoAmount, reservedCryptoAmount: -order.cryptoAmount } },
    );
    // Reactivar el Ad si estaba COMPLETED (fue agotado cuando se creó esta orden)
    await this.adModel.updateOne(
      { adId: order.adId, status: AdStatus.COMPLETED },
      { $set: { status: AdStatus.ACTIVE } },
    );

    order.status = OrderStatus.CANCELLED;
    await order.save();

    await this.notificationClient.notifyOrderCancelled(order.buyerId === userId ? order.sellerId : order.buyerId, orderId);
    this.logger.log(`[Orders] cancelled | orderId=${orderId} | by=${userId}`);
    return order.toObject();
  }

  /** Abrir disputa — disponible para comprador o vendedor si la orden no está finalizada */
  async dispute(userId: string, orderId: string, reason: string): Promise<P2POrder> {
    const order = await this.orderModel.findOne({ orderId });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const isParticipant = order.buyerId === userId || order.sellerId === userId;
    if (!isParticipant) throw new ForbiddenException('No eres participante de esta orden');

    const nonDisputeable = [OrderStatus.RELEASED, OrderStatus.CANCELLED, OrderStatus.DISPUTED];
    if (nonDisputeable.includes(order.status as OrderStatus)) {
      throw new BadRequestException(`No se puede abrir disputa en estado ${order.status}`);
    }

    order.status = OrderStatus.DISPUTED;
    // Registrar la razón en la nota del rol correspondiente
    if (order.buyerId === userId) {
      order.buyerNote = reason;
    } else {
      order.sellerNote = reason;
    }
    await order.save();

    await this.notificationClient.notifyDisputeOpened(order.sellerId, order.buyerId, orderId);
    this.logger.log(`[Orders] dispute opened | orderId=${orderId} | by=${userId}`);
    return order.toObject();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Admin-only operations
  // ─────────────────────────────────────────────────────────────────────────

  /** Lista paginada de órdenes para panel admin con filtros opcionales */
  async adminFindAll(filters: {
    status?: string;
    buyerId?: string;
    sellerId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ orders: P2POrder[]; total: number; page: number; limit: number }> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    if (filters.buyerId) query.buyerId = filters.buyerId;
    if (filters.sellerId) query.sellerId = filters.sellerId;

    const [orders, total] = await Promise.all([
      this.orderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.orderModel.countDocuments(query),
    ]);

    return { orders, total, page, limit };
  }

  /** Obtiene una orden por orderId para el panel admin */
  async adminFindOne(orderId: string): Promise<P2POrder> {
    const order = await this.orderModel.findOne({ orderId }).lean();
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    return order;
  }

  /**
   * ADMIN: Fuerza la liberación del escrow al comprador.
   * Usado cuando el admin determina que el comprador tiene razón pero la orden no está en DISPUTED.
   * Requiere que el escrow exista y esté en estado LOCKED.
   */
  async adminForceRelease(adminId: string, orderId: string, reason: string): Promise<P2POrder> {
    const order = await this.orderModel.findOne({ orderId });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    if (order.status === OrderStatus.RELEASED) {
      throw new BadRequestException(`Orden ya fue liberada (status=${order.status})`);
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(`Orden ya fue cancelada — no se puede hacer force release`);
    }

    if (!order.escrowId) {
      throw new BadRequestException(`Orden ${orderId} no tiene escrow asociado — no se puede forzar release`);
    }

    const escrow = await this.escrowModel.findOne({ escrowId: order.escrowId });
    if (!escrow) throw new NotFoundException(`Escrow ${order.escrowId} not found`);

    if (escrow.status !== EscrowStatus.LOCKED) {
      throw new BadRequestException(
        `Escrow no está en LOCKED (status=${escrow.status}) — no se puede hacer force release`,
      );
    }

    this.logger.warn(`[Orders] adminForceRelease | orderId=${orderId} | adminId=${adminId} | reason=${reason}`);

    const result = await this.escrowClient.releaseCrypto({
      escrowId: order.escrowId,
      orderId,
      sellerCustodyAccountId: escrow.custodyAccountId,
      buyerUserId: order.buyerId,
      assetCode: order.assetCode,
      cryptoAmount: order.cryptoAmount,
    });

    if (!result.success) {
      throw new InternalServerErrorException(
        `adminForceRelease: fallo en custody-crypto — ${result.message || 'error desconocido'}`,
      );
    }

    escrow.status = EscrowStatus.RELEASED;
    await escrow.save();

    order.status = OrderStatus.RELEASED;
    if (result.ledgerTxId) order.ledgerTxIds.push(result.ledgerTxId);
    order.sellerNote = `[ADMIN FORCE RELEASE] adminId=${adminId} | ${reason}`;
    await order.save();

    await this.adModel.updateOne(
      { adId: order.adId },
      { $inc: { reservedCryptoAmount: -order.cryptoAmount, releasedCryptoAmount: order.cryptoAmount } },
    );

    await this.notificationClient.notifyOrderReleased(order.buyerId, orderId);
    this.logger.log(`[Orders] adminForceRelease OK | orderId=${orderId}`);
    return order.toObject();
  }

  /**
   * ADMIN: Fuerza la devolución del escrow al vendedor.
   * Usado cuando el admin determina que la orden debe cancelarse y el vendedor debe recuperar el cripto.
   */
  async adminForceRefund(adminId: string, orderId: string, reason: string): Promise<P2POrder> {
    const order = await this.orderModel.findOne({ orderId });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    if (order.status === OrderStatus.RELEASED) {
      throw new BadRequestException(`Orden ya fue liberada — no se puede reembolsar`);
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(`Orden ya está cancelada`);
    }

    if (!order.escrowId) {
      throw new BadRequestException(`Orden ${orderId} no tiene escrow asociado`);
    }

    const escrow = await this.escrowModel.findOne({ escrowId: order.escrowId });
    if (!escrow) throw new NotFoundException(`Escrow ${order.escrowId} not found`);

    if (escrow.status !== EscrowStatus.LOCKED) {
      throw new BadRequestException(
        `Escrow no está en LOCKED (status=${escrow.status}) — no se puede hacer force refund`,
      );
    }

    this.logger.warn(`[Orders] adminForceRefund | orderId=${orderId} | adminId=${adminId} | reason=${reason}`);

    const result = await this.escrowClient.refundCrypto({
      escrowId: order.escrowId,
      orderId,
    });

    if (!result.success) {
      throw new InternalServerErrorException(
        `adminForceRefund: fallo en custody-crypto — ${result.message || 'error desconocido'}`,
      );
    }

    escrow.status = EscrowStatus.REFUNDED;
    await escrow.save();

    order.status = OrderStatus.CANCELLED;
    order.buyerNote = `[ADMIN FORCE REFUND] adminId=${adminId} | ${reason}`;
    await order.save();

    // Restaurar amount en el Ad
    await this.adModel.updateOne(
      { adId: order.adId },
      { $inc: { availableCryptoAmount: order.cryptoAmount, reservedCryptoAmount: -order.cryptoAmount } },
    );
    await this.adModel.updateOne(
      { adId: order.adId, status: AdStatus.COMPLETED },
      { $set: { status: AdStatus.ACTIVE } },
    );

    await this.notificationClient.notifyOrderCancelled(order.buyerId, orderId);
    this.logger.log(`[Orders] adminForceRefund OK | orderId=${orderId}`);
    return order.toObject();
  }
}
