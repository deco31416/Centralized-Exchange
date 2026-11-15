import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { DynamicKey, DynamicKeyDocument } from './schemas/dynamic-key.schema';
import { VerifyDynamicKeyDto } from './dto/verify-dynamic-key.dto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos

@Injectable()
export class DynamicKeyService {
  private readonly logger = new Logger(DynamicKeyService.name);
  private readonly keyLength: number;
  private readonly periodSeconds: number;
  private readonly encryptionKey: Buffer;

  constructor(
    @InjectModel(DynamicKey.name) private dynamicKeyModel: Model<DynamicKeyDocument>,
    private readonly config: ConfigService,
  ) {
    this.keyLength = Number(this.config.get<number>('DYNAMIC_KEY_LENGTH') || 6);
    this.periodSeconds = Number(this.config.get<number>('DYNAMIC_KEY_PERIOD_SECONDS') || 60);

    // Derivar clave AES-256 del INTERNAL_AUTH_TOKEN
    const token = this.config.get<string>('INTERNAL_AUTH_TOKEN') || '';
    this.encryptionKey = crypto.createHash('sha256').update(token).digest();
  }

  /** Estado de la clave dinámica del usuario */
  async getStatus(userId: string) {
    const dk = await this.dynamicKeyModel.findOne({ userId });
    if (!dk) {
      return {
        isEnabled: false,
        keyLength: this.keyLength,
        periodSeconds: this.periodSeconds,
      };
    }
    const isLocked = dk.lockedUntil ? new Date() < dk.lockedUntil : false;
    return {
      isEnabled: dk.isEnabled,
      isLocked,
      keyLength: dk.keyLength,
      periodSeconds: dk.periodSeconds,
      activatedAt: dk.activatedAt,
    };
  }

  /** Activar clave dinámica para un usuario */
  async enable(userId: string) {
    let dk = await this.dynamicKeyModel.findOne({ userId });
    if (dk && dk.isEnabled) {
      throw new BadRequestException('La clave dinámica ya está activa');
    }

    const rawSecret = this.generateSecret();
    const { encrypted, iv, authTag } = this.encryptSecret(rawSecret);

    if (dk) {
      dk.secret = encrypted;
      dk.iv = iv;
      dk.authTag = authTag;
      dk.isEnabled = true;
      dk.keyLength = this.keyLength;
      dk.periodSeconds = this.periodSeconds;
      dk.activatedAt = new Date();
      dk.failedAttempts = 0;
      dk.lockedUntil = null;
      await dk.save();
    } else {
      dk = await this.dynamicKeyModel.create({
        userId,
        secret: encrypted,
        iv,
        authTag,
        keyLength: this.keyLength,
        periodSeconds: this.periodSeconds,
        isEnabled: true,
        activatedAt: new Date(),
      });
    }

    this.logger.log(`Clave dinámica activada para usuario ${userId}`);
    return { success: true, message: 'Clave dinámica activada' };
  }

  /** Desactivar clave dinámica */
  async disable(userId: string) {
    const dk = await this.dynamicKeyModel.findOne({ userId });
    if (!dk || !dk.isEnabled) {
      throw new BadRequestException('La clave dinámica no está activa');
    }
    dk.isEnabled = false;
    await dk.save();
    return { success: true, message: 'Clave dinámica desactivada' };
  }

  /** Obtener clave dinámica actual (TOTP-like) para mostrar al usuario */
  async getCurrent(userId: string) {
    const dk = await this.dynamicKeyModel.findOne({ userId });
    if (!dk || !dk.isEnabled) {
      throw new BadRequestException('No tienes clave dinámica activa');
    }

    // Documento legacy sin cifrado AES-256-GCM → regenerar secret
    if (!dk.iv || !dk.authTag) {
      this.logger.warn(`Documento legacy detectado para usuario ${userId}, regenerando secret cifrado`);
      const rawSecret = this.generateSecret();
      const { encrypted, iv, authTag } = this.encryptSecret(rawSecret);
      dk.secret = encrypted;
      dk.iv = iv;
      dk.authTag = authTag;
      await dk.save();
    }

    const rawSecret = this.decryptSecret(dk.secret, dk.iv, dk.authTag);
    const { code, remainingSeconds } = this.generateTOTP(rawSecret, dk.keyLength, dk.periodSeconds);
    return { code, remainingSeconds, periodSeconds: dk.periodSeconds };
  }

  /** Verificar un código de clave dinámica (con ventana ±1 y lockout) */
  async verify(userId: string, dto: VerifyDynamicKeyDto) {
    const dk = await this.dynamicKeyModel.findOne({ userId });
    if (!dk || !dk.isEnabled) {
      throw new BadRequestException('No tienes clave dinámica activa');
    }

    // Verificar bloqueo
    if (dk.lockedUntil && new Date() < dk.lockedUntil) {
      const remaining = Math.ceil((dk.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Clave dinámica bloqueada. Intenta en ${remaining} minutos`);
    }

    // Documento legacy sin cifrado AES-256-GCM → regenerar secret
    if (!dk.iv || !dk.authTag) {
      this.logger.warn(`Documento legacy detectado para usuario ${userId}, regenerando secret cifrado`);
      const newSecret = this.generateSecret();
      const { encrypted, iv, authTag } = this.encryptSecret(newSecret);
      dk.secret = encrypted;
      dk.iv = iv;
      dk.authTag = authTag;
      await dk.save();
    }

    const rawSecret = this.decryptSecret(dk.secret, dk.iv, dk.authTag);
    const now = Math.floor(Date.now() / 1000);
    const counter = Math.floor(now / dk.periodSeconds);

    // Verificar ventana actual y ±1 por tolerancia
    for (const offset of [0, -1, 1]) {
      const expected = this.computeCode(rawSecret, counter + offset, dk.keyLength);
      if (expected === dto.code) {
        // Reset intentos fallidos
        if (dk.failedAttempts > 0) {
          dk.failedAttempts = 0;
          dk.lockedUntil = null;
          await dk.save();
        }
        return { valid: true };
      }
    }

    // Fallo — incrementar intentos
    dk.failedAttempts += 1;
    if (dk.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      dk.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      this.logger.warn(`Clave dinámica bloqueada para usuario ${userId} tras ${MAX_FAILED_ATTEMPTS} intentos`);
    }
    await dk.save();

    return { valid: false, message: 'Código de clave dinámica incorrecto' };
  }

  // ─── Cifrado AES-256-GCM ───

  /** Cifrar secret con AES-256-GCM */
  private encryptSecret(plaintext: string): { encrypted: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return { encrypted, iv: iv.toString('hex'), authTag };
  }

  /** Descifrar secret */
  private decryptSecret(encrypted: string, ivHex: string, authTagHex: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // ─── TOTP ───

  /** Genera un TOTP code dada la configuración */
  private generateTOTP(secret: string, length: number, period: number) {
    const now = Math.floor(Date.now() / 1000);
    const counter = Math.floor(now / period);
    const code = this.computeCode(secret, counter, length);
    const elapsed = now % period;
    const remainingSeconds = period - elapsed;
    return { code, remainingSeconds };
  }

  /** Computa un código TOTP-like con HMAC-SHA256 */
  private computeCode(secret: string, counter: number, length: number): string {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(counter));
    const hmac = crypto.createHmac('sha256', Buffer.from(secret, 'hex'));
    hmac.update(buffer);
    const hash = hmac.digest();

    // Dynamic truncation (RFC 4226 style)
    const offset = hash[hash.length - 1] & 0x0f;
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    const mod = Math.pow(10, length);
    return (binary % mod).toString().padStart(length, '0');
  }

  /** Genera un secret random hex de 32 bytes */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
