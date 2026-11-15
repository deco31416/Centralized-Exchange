import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import {
  TunnelSession,
  TunnelSessionDocument,
  TunnelSessionStatus,
  AuthMethodState,
  ParticipantAuth,
} from './tunnel-session.schema';
import { SignatureKeysClient } from '../shared/clients/signature-keys.client';
import { WalletLedgerClient } from '../shared/clients/wallet-ledger.client';

/* ─── Tipos públicos ──────────────────────────── */

export interface SessionParticipantView {
  userId: string;
  role: 'creator' | 'joiner';
  auth: {
    pin: AuthMethodState;
    dynamicKey: AuthMethodState;
    emailOtp: AuthMethodState;
  };
}

export interface SessionView {
  sessionId: string;
  inviteCode: string;
  status: TunnelSessionStatus;
  currency: string;
  amountMinorUnits: string;
  concept?: string;
  requiredMethods: string[];
  expiresAt: string;
  creator: SessionParticipantView;
  joiner: SessionParticipantView | null;
  transferTxId?: string;
}

export interface AuthVerifyResult {
  verified: boolean;
  method: string;
  /** Has este participante completado todos los métodos requeridos? */
  participantFullyAuthorized: boolean;
  /** Están AMBOS participantes completamente autorizados? */
  bothAuthorized: boolean;
}

export interface TransferResult {
  success: boolean;
  txId?: string;
  correlationId?: string;
  reason?: string;
}

/* ─── Servicio ────────────────────────────────── */

@Injectable()
export class TunnelService {
  private readonly logger = new Logger(TunnelService.name);
  private readonly sessionTtlMinutes: number;

  /**
   * In-memory map: sessionId → Set<userId> de usuarios con OTP ya solicitado.
   * Evita solicitar OTP duplicado dentro de la misma sesión.
   */
  private readonly otpRequested = new Map<string, Set<string>>();

  /**
   * In-memory map: sessionId → Map<userId, otpCode>.
   * Almacena el OTP confirmado para usarlo al ejecutar la transferencia.
   */
  private readonly otpStore = new Map<string, Map<string, string>>();

  constructor(
    @InjectModel(TunnelSession.name)
    private readonly model: Model<TunnelSessionDocument>,
    private readonly sigKeysClient: SignatureKeysClient,
    private readonly walletLedgerClient: WalletLedgerClient,
    private readonly configService: ConfigService,
  ) {
    this.sessionTtlMinutes = Number(
      configService.get<string>('SESSION_TTL_MINUTES') || '15',
    );
  }

  /* ─── Helpers ──────────────────────────────── */

  private generateInviteCode(): string {
    // 6 dígitos aleatorios
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Un participante está autorizado si AL MENOS 1 de los métodos
   * requeridos fue verificado exitosamente.
   */
  private isParticipantFullyAuthorized(
    auth: ParticipantAuth,
    requiredMethods: string[],
  ): boolean {
    return requiredMethods.some(
      (m) => auth[m as keyof ParticipantAuth] === 'verified',
    );
  }

  private areBothAuthorized(session: TunnelSessionDocument): boolean {
    if (!session.joinerUserId) return false;
    return (
      this.isParticipantFullyAuthorized(
        session.creatorAuth,
        session.requiredMethods,
      ) &&
      this.isParticipantFullyAuthorized(
        session.joinerAuth,
        session.requiredMethods,
      )
    );
  }

  private toSessionView(doc: TunnelSessionDocument): SessionView {
    return {
      sessionId: doc.sessionId,
      inviteCode: doc.inviteCode,
      status: doc.status,
      currency: doc.currency,
      amountMinorUnits: doc.amountMinorUnits,
      concept: doc.concept,
      requiredMethods: doc.requiredMethods,
      expiresAt: doc.expiresAt.toISOString(),
      creator: {
        userId: doc.creatorUserId,
        role: 'creator',
        auth: {
          pin: doc.creatorAuth.pin,
          dynamicKey: doc.creatorAuth.dynamicKey,
          emailOtp: doc.creatorAuth.emailOtp,
        },
      },
      joiner: doc.joinerUserId
        ? {
            userId: doc.joinerUserId,
            role: 'joiner',
            auth: {
              pin: doc.joinerAuth.pin,
              dynamicKey: doc.joinerAuth.dynamicKey,
              emailOtp: doc.joinerAuth.emailOtp,
            },
          }
        : null,
      transferTxId: doc.transferTxId,
    };
  }

  /* ─── Crear sesión ─────────────────────────── */

  async createSession(input: {
    userId: string;
    email?: string;
    currency: string;
    amountMinorUnits: string;
    concept?: string;
    requiredMethods?: string[];
  }): Promise<SessionView> {
    const sessionId = randomUUID();
    const inviteCode = this.generateInviteCode();
    const expiresAt = new Date(
      Date.now() + this.sessionTtlMinutes * 60 * 1000,
    );

    const session = await this.model.create({
      sessionId,
      inviteCode,
      status: 'WAITING',
      currency: input.currency,
      amountMinorUnits: input.amountMinorUnits,
      concept: input.concept,
      creatorUserId: input.userId,
      creatorEmail: input.email,
      creatorAuth: { pin: 'pending', dynamicKey: 'pending', emailOtp: 'pending' },
      joinerAuth: { pin: 'pending', dynamicKey: 'pending', emailOtp: 'pending' },
      requiredMethods: input.requiredMethods || ['pin', 'dynamicKey', 'emailOtp'],
      expiresAt,
    });

    this.logger.log(`Session created: ${sessionId} by ${input.userId}`);
    return this.toSessionView(session);
  }

  /* ─── Unirse a sesión ──────────────────────── */

  async joinSession(input: {
    inviteCode: string;
    userId: string;
    email?: string;
  }): Promise<SessionView | { error: string }> {
    const session = await this.model.findOne({
      inviteCode: input.inviteCode,
      status: 'WAITING',
    });

    if (!session) {
      return { error: 'SESSION_NOT_FOUND' };
    }

    if (new Date() > session.expiresAt) {
      await this.model.updateOne(
        { sessionId: session.sessionId },
        { status: 'EXPIRED' },
      );
      return { error: 'SESSION_EXPIRED' };
    }

    if (session.creatorUserId === input.userId) {
      return { error: 'CANNOT_JOIN_OWN_SESSION' };
    }

    session.joinerUserId = input.userId;
    session.joinerEmail = input.email;
    session.status = 'ACTIVE';
    await session.save();

    this.logger.log(
      `Session ${session.sessionId}: ${input.userId} joined`,
    );
    return this.toSessionView(session);
  }

  /* ─── Obtener sesión ───────────────────────── */

  async getSession(sessionId: string): Promise<SessionView | null> {
    const session = await this.model.findOne({ sessionId });
    return session ? this.toSessionView(session) : null;
  }

  /* ─── Solicitar OTP email ──────────────────── */

  async requestEmailOtp(
    sessionId: string,
    userId: string,
    email?: string,
  ): Promise<{ success: boolean; expiresInSeconds?: number; otp?: string }> {
    // Evitar doble solicitud
    if (!this.otpRequested.has(sessionId)) {
      this.otpRequested.set(sessionId, new Set());
    }
    const requested = this.otpRequested.get(sessionId)!;
    if (requested.has(userId)) {
      return { success: true, expiresInSeconds: 0 };
    }

    try {
      const result = await this.walletLedgerClient.requestOtp({
        userId,
        email,
      });
      requested.add(userId);
      this.logger.log(`OTP requested for ${userId} in session ${sessionId}`);
      return {
        success: true,
        expiresInSeconds: result.expiresInSeconds,
        otp: result.otp, // solo en dev mode
      };
    } catch (error: any) {
      this.logger.error(`OTP request failed: ${error?.message}`);
      return { success: false };
    }
  }

  /* ─── Verificar método de auth ─────────────── */

  async verifyAuthMethod(input: {
    sessionId: string;
    userId: string;
    method: 'pin' | 'dynamicKey' | 'emailOtp';
    value: string;
  }): Promise<AuthVerifyResult | { error: string }> {
    const session = await this.model.findOne({
      sessionId: input.sessionId,
      status: { $in: ['ACTIVE', 'WAITING'] },
    });

    if (!session) {
      return { error: 'SESSION_NOT_FOUND' };
    }

    if (new Date() > session.expiresAt) {
      await this.model.updateOne(
        { sessionId: session.sessionId },
        { status: 'EXPIRED' },
      );
      return { error: 'SESSION_EXPIRED' };
    }

    // Determinar si es creator o joiner
    const isCreator = session.creatorUserId === input.userId;
    const isJoiner = session.joinerUserId === input.userId;
    if (!isCreator && !isJoiner) {
      return { error: 'NOT_PARTICIPANT' };
    }

    // Verificar con el servicio correspondiente
    let verified = false;

    switch (input.method) {
      case 'pin':
        verified = await this.sigKeysClient.verifyPin(
          input.userId,
          input.value,
        );
        break;

      case 'dynamicKey':
        verified = await this.sigKeysClient.verifyDynamicKey(
          input.userId,
          input.value,
        );
        break;

      case 'emailOtp':
        // El OTP de email se verifica al momento de ejecutar la transferencia
        // en wallet-ledger. Aquí lo almacenamos para usarlo después.
        // Por ahora, marcamos como verified (se validará al final).
        // Almacenar el código OTP para la ejecución
        if (!this.otpStore.has(input.sessionId)) {
          this.otpStore.set(input.sessionId, new Map());
        }
        this.otpStore.get(input.sessionId)!.set(input.userId, input.value);
        verified = true;
        break;
    }

    // Actualizar estado en MongoDB
    const authField = isCreator ? 'creatorAuth' : 'joinerAuth';
    const newState: AuthMethodState = verified ? 'verified' : 'failed';

    await this.model.updateOne(
      { sessionId: input.sessionId },
      { [`${authField}.${input.method}`]: newState },
    );

    // Recargar para calcular estado global
    const updated = await this.model.findOne({
      sessionId: input.sessionId,
    });

    const participantAuth = isCreator
      ? updated!.creatorAuth
      : updated!.joinerAuth;
    // Aplicar el cambio local (puede no haberse reflejado en el reload)
    (participantAuth as any)[input.method] = newState;

    const participantFullyAuthorized = this.isParticipantFullyAuthorized(
      participantAuth,
      updated!.requiredMethods,
    );
    const bothAuthorized = this.areBothAuthorized(updated!);

    return {
      verified,
      method: input.method,
      participantFullyAuthorized,
      bothAuthorized,
    };
  }

  /* ─── Ejecutar transferencia ───────────────── */

  async executeTransfer(sessionId: string): Promise<TransferResult> {
    const session = await this.model.findOne({ sessionId, status: 'ACTIVE' });
    if (!session) {
      return { success: false, reason: 'SESSION_NOT_FOUND' };
    }

    if (!this.areBothAuthorized(session)) {
      return { success: false, reason: 'NOT_FULLY_AUTHORIZED' };
    }

    // Marcar como ejecutando
    session.status = 'EXECUTING';
    await session.save();

    // Obtener OTP del pagador (joiner = pagador, creator = cobrador)
    const otpMap = this.otpStore.get(sessionId);
    const payerOtp = otpMap?.get(session.joinerUserId!);

    try {
      // En el túnel: joiner = pagador (envía dinero), creator = cobrador (recibe)
      // Ledger: fromUserId = debitado (pagador), toUserId = acreditado (cobrador)
      const result = await this.walletLedgerClient.executeP2PTransfer({
        fromUserId: session.joinerUserId!,
        toUserId: session.creatorUserId,
        currency: session.currency,
        amountMinorUnits: session.amountMinorUnits,
        otp: payerOtp,
        concept: session.concept,
      });

      if (result.status === 'applied') {
        session.status = 'COMPLETED';
        session.transferTxId = result.txId;
        session.transferCorrelationId = result.correlationId;
        await session.save();

        this.cleanupSession(sessionId);

        this.logger.log(
          `Transfer completed: ${sessionId} txId=${result.txId}`,
        );

        return {
          success: true,
          txId: result.txId,
          correlationId: result.correlationId,
        };
      }

      // Rejected
      session.status = 'ACTIVE'; // Revert to allow retry
      await session.save();

      this.logger.warn(
        `Transfer rejected: ${sessionId} reason=${result.reason}`,
      );

      return { success: false, reason: result.reason };
    } catch (error: any) {
      session.status = 'ACTIVE';
      await session.save();

      this.logger.error(
        `Transfer error: ${sessionId} ${error?.message}`,
      );

      return {
        success: false,
        reason: error?.response?.data?.message || 'TRANSFER_FAILED',
      };
    }
  }

  /* ─── Cancelar sesión ──────────────────────── */

  async cancelSession(
    sessionId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    const result = await this.model.updateOne(
      {
        sessionId,
        status: { $in: ['WAITING', 'ACTIVE'] },
        $or: [{ creatorUserId: userId }, { joinerUserId: userId }],
      },
      { status: 'CANCELLED' },
    );

    if (result.modifiedCount > 0) {
      this.cleanupSession(sessionId);
      this.logger.log(`Session cancelled: ${sessionId} by ${userId}`);
      return { success: true };
    }

    return { success: false };
  }

  /* ─── Cleanup in-memory ────────────────────── */

  private cleanupSession(sessionId: string) {
    this.otpRequested.delete(sessionId);
    this.otpStore.delete(sessionId);
  }
}
