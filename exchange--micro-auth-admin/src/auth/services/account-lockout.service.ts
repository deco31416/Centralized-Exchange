import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccountLockoutService {
  // Configuración de lockout (nivel enterprise para exchange)
  private readonly MAX_ATTEMPTS: number;
  private readonly LOCKOUT_DURATION_MS: number;
  private readonly ATTEMPT_WINDOW_MS: number;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {
    // 🔒 Configuración estricta para exchange
    this.MAX_ATTEMPTS = this.configService.get<number>('MAX_LOGIN_ATTEMPTS', 5);
    this.LOCKOUT_DURATION_MS = this.configService.get<number>('LOCKOUT_DURATION_MINUTES', 30) * 60 * 1000;
    this.ATTEMPT_WINDOW_MS = this.configService.get<number>('ATTEMPT_WINDOW_MINUTES', 15) * 60 * 1000;
  }

  /**
   * Registrar intento fallido de login
   * @returns true si la cuenta fue bloqueada, false si aún tiene intentos
   */
  async recordFailedAttempt(userId: string, ip: string): Promise<{ locked: boolean; remainingAttempts: number }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    
    // Reset contador si pasó la ventana de tiempo
    if (user.last_failed_login_at) {
      const timeSinceLastAttempt = now.getTime() - user.last_failed_login_at.getTime();
      if (timeSinceLastAttempt > this.ATTEMPT_WINDOW_MS) {
        user.failed_login_attempts = 0;
      }
    }

    // Incrementar intentos fallidos
    user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
    user.last_failed_login_at = now;
    user.last_failed_login_ip = ip;

    // Bloquear si excedió el máximo
    if (user.failed_login_attempts >= this.MAX_ATTEMPTS) {
      user.locked_until = new Date(now.getTime() + this.LOCKOUT_DURATION_MS);
      await user.save();
      
      return {
        locked: true,
        remainingAttempts: 0,
      };
    }

    await user.save();
    
    return {
      locked: false,
      remainingAttempts: this.MAX_ATTEMPTS - user.failed_login_attempts,
    };
  }

  /**
   * Verificar si la cuenta está bloqueada
   */
  async isAccountLocked(userId: string): Promise<{ locked: boolean; unlockAt?: Date }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return { locked: false };
    }

    if (!user.locked_until) {
      return { locked: false };
    }

    const now = new Date();
    
    // Si ya pasó el tiempo de bloqueo, desbloquear automáticamente
    if (now >= user.locked_until) {
      user.locked_until = undefined;
      user.failed_login_attempts = 0;
      await user.save();
      return { locked: false };
    }

    return {
      locked: true,
      unlockAt: user.locked_until,
    };
  }

  /**
   * Resetear intentos fallidos (tras login exitoso)
   */
  async resetFailedAttempts(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: {
        failed_login_attempts: 0,
        last_failed_login_at: null,
        locked_until: null,
      },
    });
  }

  /**
   * Desbloquear cuenta manualmente (admin action)
   */
  async unlockAccount(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: {
        locked_until: null,
        failed_login_attempts: 0,
      },
    });
  }

  /**
   * Obtener información de lockout de usuario
   */
  async getLockoutInfo(userId: string): Promise<{
    failedAttempts: number;
    lockedUntil?: Date;
    lastFailedAttempt?: Date;
    lastFailedIp?: string;
  }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return { failedAttempts: 0 };
    }

    return {
      failedAttempts: user.failed_login_attempts || 0,
      lockedUntil: user.locked_until,
      lastFailedAttempt: user.last_failed_login_at,
      lastFailedIp: user.last_failed_login_ip,
    };
  }
}
