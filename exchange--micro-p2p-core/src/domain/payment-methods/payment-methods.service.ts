import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { P2PPaymentMethod, P2PPaymentMethodDocument } from './schemas/p2p-payment-method.schema';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodStatus } from '../../shared/enums/p2p.enums';
import { FieldEncryptionService } from '../../shared/crypto/field-encryption.service';

/** Vista segura de un método de pago — sin datos sensibles completos */
export interface PaymentMethodSafeView {
  paymentMethodId: string;
  userId: string;
  type: string;
  country: string;
  currency: string;
  label: string;
  status: string;
  adminApproved: boolean;
  adminNotes?: string;
  maskedDetails?: Record<string, string>;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class PaymentMethodsService {
  private readonly logger = new Logger(PaymentMethodsService.name);

  constructor(
    @InjectModel(P2PPaymentMethod.name)
    private readonly pmModel: Model<P2PPaymentMethodDocument>,
    private readonly encryptionService: FieldEncryptionService,
  ) {}

  async create(userId: string, dto: CreatePaymentMethodDto): Promise<PaymentMethodSafeView> {
    const paymentMethodId = uuidv4();

    let detailsEncrypted: Record<string, unknown> | null = null;
    if (dto.details && Object.keys(dto.details).length > 0) {
      detailsEncrypted = this.encryptionService.encryptJson(dto.details);
    }

    const doc = await this.pmModel.create({
      paymentMethodId,
      userId,
      type: dto.type,
      country: dto.country.toUpperCase(),
      currency: dto.currency.toUpperCase(),
      label: dto.label,
      detailsEncrypted,
      status: PaymentMethodStatus.PENDING_REVIEW,
      adminApproved: false,
    });

    this.logger.log(`[PM] created | paymentMethodId=${paymentMethodId} | userId=${userId} | type=${dto.type}`);
    return this.toSafeView(doc.toObject());
  }

  async findByUser(userId: string): Promise<PaymentMethodSafeView[]> {
    const docs = await this.pmModel.find({ userId }).lean();
    return docs.map((d) => this.toSafeView(d));
  }

  async findById(paymentMethodId: string): Promise<P2PPaymentMethod> {
    const pm = await this.pmModel.findOne({ paymentMethodId }).lean();
    if (!pm) throw new NotFoundException(`PaymentMethod ${paymentMethodId} not found`);
    return pm;
  }

  async update(userId: string, paymentMethodId: string, dto: UpdatePaymentMethodDto): Promise<PaymentMethodSafeView> {
    const pm = await this.pmModel.findOne({ paymentMethodId });
    if (!pm) throw new NotFoundException(`PaymentMethod ${paymentMethodId} not found`);
    if (pm.userId !== userId) throw new ForbiddenException('Not your payment method');

    if (dto.label !== undefined) pm.label = dto.label;
    if (dto.details !== undefined && Object.keys(dto.details).length > 0) {
      pm.detailsEncrypted = this.encryptionService.encryptJson(dto.details);
    }
    if (dto.status !== undefined) {
      if (dto.status === PaymentMethodStatus.ACTIVE && !pm.adminApproved) {
        throw new BadRequestException('No puedes activar un método no aprobado por admin');
      }
      pm.status = dto.status;
    }

    await pm.save();
    this.logger.log(`[PM] updated | paymentMethodId=${paymentMethodId} | userId=${userId}`);
    return this.toSafeView(pm.toObject());
  }

  async delete(userId: string, paymentMethodId: string): Promise<void> {
    const pm = await this.pmModel.findOne({ paymentMethodId });
    if (!pm) throw new NotFoundException(`PaymentMethod ${paymentMethodId} not found`);
    if (pm.userId !== userId) throw new ForbiddenException('Not your payment method');
    await pm.deleteOne();
    this.logger.log(`[PM] deleted | paymentMethodId=${paymentMethodId} | userId=${userId}`);
  }

  async adminApprove(paymentMethodId: string, adminId: string, notes?: string): Promise<PaymentMethodSafeView> {
    const pm = await this.pmModel.findOne({ paymentMethodId });
    if (!pm) throw new NotFoundException(`PaymentMethod ${paymentMethodId} not found`);
    pm.adminApproved = true;
    pm.adminNotes = notes || 'Aprobado';
    pm.status = PaymentMethodStatus.ACTIVE;
    await pm.save();
    this.logger.log(`[PM] admin approved | paymentMethodId=${paymentMethodId} | adminId=${adminId}`);
    return this.toSafeView(pm.toObject());
  }

  /** Lista todos los métodos de pago pendientes de aprobación para el panel admin */
  async findPendingApproval(): Promise<PaymentMethodSafeView[]> {
    const docs = await this.pmModel
      .find({ status: PaymentMethodStatus.PENDING_REVIEW })
      .sort({ createdAt: 1 })
      .lean();
    return docs.map((d) => this.toSafeView(d));
  }

  /**
   * Revela los detalles completos desencriptados para el propietario o un admin.
   * Solo llamar desde endpoints protegidos con validación de ownership.
   */
  revealDetails(pm: P2PPaymentMethod, requestingUserId: string, isAdmin = false): Record<string, unknown> | null {
    if (!isAdmin && pm.userId !== requestingUserId) {
      throw new ForbiddenException('No tienes permiso para ver los detalles completos');
    }
    if (!pm.detailsEncrypted) return null;

    if (!this.encryptionService.isEncryptedPayload(pm.detailsEncrypted)) {
      // Legacy: registro guardado antes del cifrado
      this.logger.warn(`[PM] legacy plaintext detailsEncrypted detectado | paymentMethodId=${(pm as any).paymentMethodId}`);
      // P2P-PAYMENTMETHOD-LEGACY-PLAINTEXT-001: no exponer, solo warn
      return { _legacy: true, _warning: 'Datos legacy — requieren migración manual' };
    }

    return this.encryptionService.decryptJson(pm.detailsEncrypted);
  }

  /**
   * Construye una vista segura (safe view) sin datos sensibles completos.
   * Incluye maskedDetails con campos parciales no sensibles.
   */
  private toSafeView(pm: P2PPaymentMethod & { _id?: unknown; createdAt?: Date; updatedAt?: Date }): PaymentMethodSafeView {
    let maskedDetails: Record<string, string> | undefined;

    if (pm.detailsEncrypted) {
      if (this.encryptionService.isEncryptedPayload(pm.detailsEncrypted)) {
        try {
          const plain = this.encryptionService.decryptJson(pm.detailsEncrypted);
          maskedDetails = this.buildMaskedDetails(plain);
        } catch {
          // Si falla el descifrado, no exponer nada
          maskedDetails = { _error: 'No disponible' };
        }
      } else {
        // Legacy plaintext — solo indicar que existe pero no exponer
        maskedDetails = { _legacy: 'Datos pendientes de migración' };
      }
    }

    return {
      paymentMethodId: (pm as any).paymentMethodId,
      userId: pm.userId,
      type: pm.type,
      country: pm.country,
      currency: pm.currency,
      label: pm.label,
      status: pm.status,
      adminApproved: pm.adminApproved,
      adminNotes: pm.adminNotes,
      maskedDetails,
      createdAt: pm.createdAt,
      updatedAt: pm.updatedAt,
    };
  }

  /**
   * Genera un objeto con campos parciales no sensibles.
   * Nunca devuelve números de cuenta completos ni datos bancarios completos.
   */
  private buildMaskedDetails(plain: Record<string, unknown>): Record<string, string> {
    const masked: Record<string, string> = {};

    if (typeof plain.accountHolder === 'string' && plain.accountHolder) {
      const parts = plain.accountHolder.trim().split(' ');
      masked.accountHolder = parts.length > 1
        ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
        : `${plain.accountHolder.substring(0, 3)}***`;
    }

    if (typeof plain.accountNumber === 'string' && plain.accountNumber) {
      const num = plain.accountNumber.replace(/\D/g, '');
      masked.accountNumberLast4 = num.length >= 4 ? num.slice(-4) : '****';
    }

    if (typeof plain.bankName === 'string' && plain.bankName) {
      masked.bankName = plain.bankName;
    }

    if (typeof plain.phone === 'string' && plain.phone) {
      const ph = plain.phone.replace(/\D/g, '');
      masked.phoneLast4 = ph.length >= 4 ? ph.slice(-4) : '****';
    }

    if (typeof plain.alias === 'string' && plain.alias) {
      masked.alias = plain.alias.substring(0, 3) + '***';
    }

    return masked;
  }
}
