import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type KycRiskLevel = 'green' | 'orange' | 'red';
type KycRiskStatus = 'active' | 'monitoring' | 'restricted' | 'blocked' | string;

export type KycRiskProfileDecision = {
  status: 'PASS' | 'REVIEW' | 'FAIL' | 'SKIP';
  message: string;
  profile?: {
    userId: string;
    kycLevel?: string;
    riskScore?: number;
    riskLevel?: KycRiskLevel | string;
    status?: KycRiskStatus;
    reason?: string;
    updatedAt?: string;
  };
};

@Injectable()
export class KycRiskClientService {
  private readonly logger = new Logger(KycRiskClientService.name);

  constructor(private readonly configService: ConfigService) {}

  async getProfileDecision(userId?: string): Promise<KycRiskProfileDecision> {
    const normalizedUserId = userId?.trim();
    if (!normalizedUserId) {
      return {
        status: 'SKIP',
        message: 'Usuario no informado; KYC/Risk no consultado.',
      };
    }

    const baseUrl = this.configService
      .get<string>('KYC_RISK_SERVICE_URL', 'http://localhost:9028/api/v1')
      .replace(/\/+$/, '');
    const timeoutMs = this.configService.get<number>('KYC_RISK_TIMEOUT_MS', 3000);
    const token = this.configService.get<string>('INTERNAL_AUTH_TOKEN');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(
        `${baseUrl}/kyc-risk/risk-profiles/${encodeURIComponent(normalizedUserId)}`,
        {
          headers: token ? { 'x-internal-auth': token } : undefined,
          signal: controller.signal,
        },
      );
      clearTimeout(timeout);

      if (response.status === 404) {
        return {
          status: 'REVIEW',
          message: `Perfil KYC/Risk no encontrado para ${normalizedUserId}.`,
        };
      }

      if (!response.ok) {
        return this.unavailable(`KYC/Risk respondió HTTP ${response.status}.`);
      }

      const profile = (await response.json()) as KycRiskProfileDecision['profile'];
      if (!profile) {
        return this.unavailable('KYC/Risk devolvió respuesta vacía.');
      }

      return this.classify(profile);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      return this.unavailable(`No se pudo consultar KYC/Risk: ${message}`);
    }
  }

  private classify(
    profile: NonNullable<KycRiskProfileDecision['profile']>,
  ): KycRiskProfileDecision {
    const riskLevel = profile.riskLevel?.toLowerCase();
    const status = profile.status?.toLowerCase();
    const score = Number(profile.riskScore);

    if (riskLevel === 'red' || status === 'blocked' || status === 'restricted') {
      return {
        status: 'FAIL',
        message: `Perfil KYC/Risk rojo o restringido para ${profile.userId}.`,
        profile,
      };
    }

    if (riskLevel === 'orange' || status === 'monitoring' || score >= 65) {
      return {
        status: 'REVIEW',
        message: `Perfil KYC/Risk requiere revisión para ${profile.userId}.`,
        profile,
      };
    }

    return {
      status: 'PASS',
      message: `Perfil KYC/Risk operativo para ${profile.userId}.`,
      profile,
    };
  }

  private unavailable(message: string): KycRiskProfileDecision {
    this.logger.warn(message);

    const failMode = this.configService.get<string>('KYC_RISK_FAIL_MODE', 'review');
    if (failMode === 'open') {
      return {
        status: 'SKIP',
        message: `${message} Fail-open activo solo para desarrollo.`,
      };
    }

    return {
      status: 'REVIEW',
      message: `${message} Requiere revisión antes de ejecutar.`,
    };
  }
}
