import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { P2PCode, P2PCodeDocument } from './p2p-code.schema';

export interface CreateCodeInput {
  fromUserId: string;
  currency: string;
  amountMinorUnits: string;
  ttlMinutes?: number;
  concept?: string;
  transferType?: 'P2P_QR' | 'P2P_CODE' | 'COLLECT_QR' | 'DECOPAY';
}

export interface CreateCodeResult {
  code: string;
  expiresAt: Date;
  qrData: string;
}

export interface ConsumeCodeInput {
  code: string;
  toUserId: string;
}

export type ConsumeCodeResult =
  | {
      valid: true;
      fromUserId: string;
      currency: string;
      amountMinorUnits: string;
      concept?: string;
      codeDocId: string;
    }
  | { valid: false; reason: string };

@Injectable()
export class P2PCodeService {
  private readonly logger = new Logger(P2PCodeService.name);

  constructor(
    @InjectModel(P2PCode.name)
    private readonly model: Model<P2PCodeDocument>,
  ) {}

  // ─── Code Generation ──────────────────────────────────────

  /**
   * Genera un código único de 6 dígitos.
   * Reintentos: máximo 10 intentos para evitar colisiones.
   */
  private async generateUniqueCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await this.model
        .findOne({ code, status: 'PENDING' })
        .exec();

      if (!existing) return code;
      attempts++;
    }

    throw new Error(
      `Failed to generate unique code after ${maxAttempts} attempts`,
    );
  }

  // ─── Create Code ──────────────────────────────────────────

  /**
   * Crea un código P2P para cobro QR.
   *
   * Flujo:
   * 1. Genera código único de 6 dígitos
   * 2. Calcula expiresAt basado en ttlMinutes
   * 3. Construye qrData como JSON stringificado
   * 4. Persiste en MongoDB con status: PENDING
   */
  async createCode(input: CreateCodeInput): Promise<CreateCodeResult> {
    const code = await this.generateUniqueCode();
    const ttl = input.ttlMinutes || 10;
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    const qrData = JSON.stringify({
      type: input.transferType || 'P2P_QR',
      code,
      fromUserId: input.fromUserId,
      currency: input.currency,
      amount: input.amountMinorUnits,
      concept: input.concept,
      expiresAt: expiresAt.toISOString(),
    });

    await this.model.create({
      code,
      fromUserId: input.fromUserId,
      currency: input.currency,
      amountMinorUnits: input.amountMinorUnits,
      status: 'PENDING',
      expiresAt,
      qrData,
      concept: input.concept,
      transferType: input.transferType || 'P2P_QR',
    });

    this.logger.log(
      `Created P2P code ${code} for ${input.fromUserId} — ${input.currency} ${input.amountMinorUnits} (TTL: ${ttl}min)`,
    );

    return { code, expiresAt, qrData };
  }

  // ─── Consume Code ─────────────────────────────────────────

  /**
   * Valida y consume un código P2P.
   *
   * Validaciones:
   * 1. Código existe con status PENDING
   * 2. No ha expirado
   * 3. El pagador no es el mismo que el cobrador
   *
   * Si pasa → marca USED, retorna datos para ejecutar la transferencia.
   */
  async consumeCode(input: ConsumeCodeInput): Promise<ConsumeCodeResult> {
    const { code, toUserId } = input;
    const doc = await this.model.findOne({ code, status: 'PENDING' }).exec();

    if (!doc) {
      this.logger.warn(`Code ${code} not found or not PENDING`);
      return { valid: false, reason: 'INVALID_CODE' };
    }

    if (doc.expiresAt < new Date()) {
      await this.model.updateOne({ _id: doc._id }, { status: 'EXPIRED' }).exec();
      this.logger.warn(`Code ${code} expired`);
      return { valid: false, reason: 'EXPIRED' };
    }

    if (doc.fromUserId === toUserId) {
      this.logger.warn(`Code ${code} — self-pay attempt by ${toUserId}`);
      return { valid: false, reason: 'CANNOT_SEND_TO_SELF' };
    }

    // Mark as USED
    await this.model
      .updateOne(
        { _id: doc._id },
        { status: 'USED', usedBy: toUserId, usedAt: new Date() },
      )
      .exec();

    this.logger.log(
      `Code ${code} consumed by ${toUserId} — ${doc.currency} ${doc.amountMinorUnits}`,
    );

    return {
      valid: true,
      fromUserId: doc.fromUserId,
      currency: doc.currency,
      amountMinorUnits: doc.amountMinorUnits,
      concept: doc.concept,
      codeDocId: doc._id.toString(),
    };
  }

  // ─── Resolve Code (peek without consuming) ────────────────

  /**
   * Busca un código PENDING y devuelve sus datos sin consumirlo.
   * Útil para cuando el scanner lee un barcode (solo 6 dígitos)
   * y necesita obtener los datos completos del pago.
   */
  async resolveCode(
    code: string,
  ): Promise<
    | {
        valid: true;
        fromUserId: string;
        currency: string;
        amountMinorUnits: string;
        concept?: string;
        expiresAt: Date;
        transferType?: string;
      }
    | { valid: false; reason: string }
  > {
    const doc = await this.model.findOne({ code, status: 'PENDING' }).exec();

    if (!doc) {
      return { valid: false, reason: 'INVALID_CODE' };
    }

    if (doc.expiresAt < new Date()) {
      await this.model.updateOne({ _id: doc._id }, { status: 'EXPIRED' }).exec();
      return { valid: false, reason: 'EXPIRED' };
    }

    return {
      valid: true,
      fromUserId: doc.fromUserId,
      currency: doc.currency,
      amountMinorUnits: doc.amountMinorUnits,
      concept: doc.concept,
      expiresAt: doc.expiresAt,
      transferType: doc.transferType,
    };
  }

  // ─── Update Ledger Reference ──────────────────────────────

  /**
   * Actualiza el documento con el ID de la transacción del ledger.
   * Se llama después de que wallet-ledger-core confirma la transferencia.
   */
  async setLedgerTxId(codeDocId: string, ledgerTxId: string): Promise<void> {
    await this.model
      .updateOne({ _id: codeDocId }, { ledgerTxId })
      .exec();
  }

  // ─── Cancel Code ──────────────────────────────────────────

  /**
   * Cancela un código P2P (solo el emisor puede cancelar).
   */
  async cancelCode(
    code: string,
    userId: string,
  ): Promise<{ cancelled: boolean; reason?: string }> {
    const doc = await this.model.findOne({ code, status: 'PENDING' }).exec();

    if (!doc) {
      return { cancelled: false, reason: 'INVALID_CODE' };
    }

    if (doc.fromUserId !== userId) {
      return { cancelled: false, reason: 'NOT_OWNER' };
    }

    await this.model
      .updateOne({ _id: doc._id }, { status: 'CANCELLED' })
      .exec();

    this.logger.log(`Code ${code} cancelled by ${userId}`);
    return { cancelled: true };
  }

  // ─── Query ────────────────────────────────────────────────

  /**
   * Obtiene los códigos activos (PENDING) de un usuario.
   */
  async getActiveCodes(userId: string) {
    return this.model
      .find({ fromUserId: userId, status: 'PENDING' })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();
  }

  // ─── Batch Code Generation ────────────────────────────────

  /**
   * Genera múltiples códigos P2P en lote (para dividir pagos).
   * Cada código se crea con el monto especificado (ya dividido por el caller).
   */
  async createBatch(
    inputs: Array<{
      fromUserId: string;
      currency: string;
      amountMinorUnits: string;
      ttlMinutes?: number;
      concept?: string;
      transferType?: 'P2P_QR' | 'P2P_CODE' | 'COLLECT_QR' | 'DECOPAY';
    }>,
  ): Promise<CreateCodeResult[]> {
    const results: CreateCodeResult[] = [];
    for (const input of inputs) {
      const result = await this.createCode(input);
      results.push(result);
    }
    return results;
  }
}
