import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Signature, SignatureDocument } from './schemas/signature.schema';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { ChangeSignatureDto } from './dto/change-signature.dto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos

@Injectable()
export class SignatureService {
  private readonly logger = new Logger(SignatureService.name);
  private readonly pinLength: number;

  constructor(
    @InjectModel(Signature.name) private signatureModel: Model<SignatureDocument>,
    private readonly config: ConfigService,
  ) {
    this.pinLength = Number(this.config.get<number>('SIGNATURE_PIN_LENGTH') || 6);
  }

  /** Obtener estado de firma para un usuario */
  async getStatus(userId: string) {
    const sig = await this.signatureModel.findOne({ userId });
    if (!sig) {
      return { hasSignature: false, isActive: false, isLocked: false, pinLength: this.pinLength };
    }
    const isLocked = sig.lockedUntil ? new Date() < sig.lockedUntil : false;
    return {
      hasSignature: true,
      isActive: sig.isActive,
      isLocked,
      pinLength: sig.pinLength,
      lastChangedAt: sig.lastChangedAt,
      failedAttempts: sig.failedAttempts,
    };
  }

  /** Crear firma (PIN) por primera vez */
  async create(userId: string, dto: CreateSignatureDto) {
    const existing = await this.signatureModel.findOne({ userId });
    if (existing) {
      throw new BadRequestException('Ya tienes una firma creada. Usa el endpoint de cambio.');
    }

    if (dto.pin !== dto.pinConfirm) {
      throw new BadRequestException('El PIN y la confirmación no coinciden');
    }

    if (dto.pin.length !== this.pinLength) {
      throw new BadRequestException(`El PIN debe tener exactamente ${this.pinLength} dígitos`);
    }

    const pinHash = await this.hashPin(dto.pin);
    await this.signatureModel.create({
      userId,
      pinHash,
      pinLength: this.pinLength,
      lastChangedAt: new Date(),
    });

    this.logger.log(`Firma creada para usuario ${userId}`);
    return { success: true, message: 'Firma creada exitosamente' };
  }

  /** Verificar PIN (para autorizar operaciones) */
  async verify(userId: string, dto: VerifySignatureDto) {
    const sig = await this.signatureModel.findOne({ userId });
    if (!sig) {
      throw new BadRequestException('No tienes firma configurada');
    }

    // Check lock
    if (sig.lockedUntil && new Date() < sig.lockedUntil) {
      const remaining = Math.ceil((sig.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Firma bloqueada. Intenta de nuevo en ${remaining} minutos`);
    }

    const isValid = await this.verifyPin(sig.pinHash, dto.pin);
    if (!isValid) {
      sig.failedAttempts += 1;
      if (sig.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        sig.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        this.logger.warn(`Firma bloqueada para usuario ${userId} tras ${MAX_FAILED_ATTEMPTS} intentos`);
      }
      await sig.save();
      throw new UnauthorizedException('PIN incorrecto');
    }

    // Migrar hash legacy a argon2 de forma transparente
    if (this.isLegacyHash(sig.pinHash)) {
      sig.pinHash = await this.hashPin(dto.pin);
      this.logger.log(`PIN migrado a argon2 para usuario ${userId}`);
    }

    // Reset on success
    sig.failedAttempts = 0;
    sig.lockedUntil = null;
    await sig.save();

    return { valid: true };
  }

  /** Cambiar PIN */
  async change(userId: string, dto: ChangeSignatureDto) {
    const sig = await this.signatureModel.findOne({ userId });
    if (!sig) {
      throw new BadRequestException('No tienes firma configurada');
    }

    // Verificar bloqueo
    if (sig.lockedUntil && new Date() < sig.lockedUntil) {
      const remaining = Math.ceil((sig.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Firma bloqueada. Intenta de nuevo en ${remaining} minutos`);
    }

    // Verificar PIN actual
    const isCurrentValid = await this.verifyPin(sig.pinHash, dto.currentPin);
    if (!isCurrentValid) {
      sig.failedAttempts += 1;
      if (sig.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        sig.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        this.logger.warn(`Firma bloqueada para usuario ${userId} tras ${MAX_FAILED_ATTEMPTS} intentos en change`);
      }
      await sig.save();
      throw new UnauthorizedException('PIN actual incorrecto');
    }

    if (dto.newPin !== dto.newPinConfirm) {
      throw new BadRequestException('El nuevo PIN y la confirmación no coinciden');
    }

    if (dto.newPin.length !== sig.pinLength) {
      throw new BadRequestException(`El PIN debe tener exactamente ${sig.pinLength} dígitos`);
    }

    sig.pinHash = await this.hashPin(dto.newPin);
    sig.lastChangedAt = new Date();
    sig.failedAttempts = 0;
    sig.lockedUntil = null;
    await sig.save();

    this.logger.log(`Firma cambiada para usuario ${userId}`);
    return { success: true, message: 'Firma cambiada exitosamente' };
  }

  /** Hash del PIN con Argon2id (OWASP recomendado) */
  private async hashPin(pin: string): Promise<string> {
    return argon2.hash(pin, {
      type: argon2.argon2id,
      memoryCost: 65536,  // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  /** Detectar si un hash es legacy (HMAC-SHA256 hex de 64 chars) */
  private isLegacyHash(hash: string): boolean {
    return !hash.startsWith('$argon2');
  }

  /** Verificar PIN contra hash argon2 o legacy HMAC-SHA256 */
  private async verifyPin(storedHash: string, pin: string): Promise<boolean> {
    if (this.isLegacyHash(storedHash)) {
      // Hash legacy: HMAC-SHA256 con INTERNAL_AUTH_TOKEN como secret
      const legacySecret = this.config.get<string>('INTERNAL_AUTH_TOKEN') || '';
      const legacyHash = crypto.createHmac('sha256', legacySecret).update(pin).digest('hex');
      return legacyHash === storedHash;
    }
    return argon2.verify(storedHash, pin);
  }
}
