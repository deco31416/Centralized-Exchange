import {
  Injectable,
  Logger,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface EncryptedPayload {
  algorithm: 'aes-256-gcm';
  iv: string;
  authTag: string;
  ciphertext: string;
  keyVersion: string;
  [key: string]: unknown;
}

/**
 * FieldEncryptionService — AES-256-GCM para datos sensibles en reposo.
 *
 * Usa variable de entorno P2P_FIELD_ENCRYPTION_KEY (hex de 64 chars = 32 bytes,
 * o base64 estándar de 32 bytes).
 *
 * En producción (NODE_ENV=production) el arranque falla si la key no está configurada.
 * En desarrollo se acepta key local controlada desde .env.local.
 *
 * NUNCA se loguea la key ni el contenido cifrado/descifrado.
 */
@Injectable()
export class FieldEncryptionService implements OnModuleInit {
  private readonly logger = new Logger(FieldEncryptionService.name);
  private key: Buffer;
  private readonly KEY_VERSION = 'v1';
  private readonly ALGORITHM = 'aes-256-gcm' as const;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const rawKey = this.configService.get<string>('fieldEncryptionKey');
    const isProduction = this.configService.get<string>('nodeEnv') === 'production';

    if (!rawKey) {
      if (isProduction) {
        // Fallo duro en producción
        throw new InternalServerErrorException(
          '[FieldEncryption] P2P_FIELD_ENCRYPTION_KEY no configurada — arranque bloqueado en producción',
        );
      }
      // Desarrollo: usar key de prueba derivada — warn visible en logs
      this.logger.warn(
        '[FieldEncryption] P2P_FIELD_ENCRYPTION_KEY no configurada — usando key de DESARROLLO. NO USAR EN PRODUCCIÓN.',
      );
      this.key = crypto.scryptSync('p2p-dev-key-not-for-production', 'salt-blackcex-p2p', 32);
      return;
    }

    // Soportar hex (64 chars) o base64 (44 chars para 32 bytes)
    if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
      this.key = Buffer.from(rawKey, 'hex');
    } else {
      const decoded = Buffer.from(rawKey, 'base64');
      if (decoded.length !== 32) {
        throw new InternalServerErrorException(
          '[FieldEncryption] P2P_FIELD_ENCRYPTION_KEY inválida — debe ser hex de 64 chars o base64 de 32 bytes',
        );
      }
      this.key = decoded;
    }

    this.logger.log('[FieldEncryption] Servicio inicializado correctamente (key v1)');
  }

  /**
   * Cifra un payload JSON con AES-256-GCM.
   * @param payload Objeto con datos sensibles. NUNCA debe contener imágenes base64.
   */
  encryptJson(payload: Record<string, unknown>): EncryptedPayload {
    const iv = crypto.randomBytes(12); // 96 bits — estándar GCM
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.key, iv);

    const plaintext = JSON.stringify(payload);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      algorithm: this.ALGORITHM,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      ciphertext: encrypted.toString('base64'),
      keyVersion: this.KEY_VERSION,
    };
  }

  /**
   * Descifra un payload previamente cifrado con encryptJson.
   */
  decryptJson(payload: EncryptedPayload): Record<string, unknown> {
    const iv = Buffer.from(payload.iv, 'base64');
    const authTag = Buffer.from(payload.authTag, 'base64');
    const ciphertext = Buffer.from(payload.ciphertext, 'base64');

    const decipher = crypto.createDecipheriv(this.ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8')) as Record<string, unknown>;
  }

  /**
   * Detecta si un valor almacenado es un EncryptedPayload válido (v1).
   * Útil para backward compatibility con registros legacy (plaintext string).
   */
  isEncryptedPayload(value: unknown): value is EncryptedPayload {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return (
      v.algorithm === 'aes-256-gcm' &&
      typeof v.iv === 'string' &&
      typeof v.authTag === 'string' &&
      typeof v.ciphertext === 'string'
    );
  }
}
