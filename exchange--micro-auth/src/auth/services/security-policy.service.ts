import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SecurityPolicy,
  SECURITY_METHODS,
  SERVICE_TYPES,
  type ServiceType,
} from '../../database/schemas/security-policy.schema';

@Injectable()
export class SecurityPolicyService {
  private readonly logger = new Logger(SecurityPolicyService.name);

  constructor(
    @InjectModel(SecurityPolicy.name)
    private readonly policyModel: Model<SecurityPolicy>,
  ) {}

  /* ── Seed defaults si no existen ───────────────────── */
  async seedDefaults(): Promise<void> {
    for (const svc of SERVICE_TYPES) {
      const exists = await this.policyModel.findOne({ serviceType: svc }).lean();
      if (!exists) {
        await this.policyModel.create({
          serviceType: svc,
          allowedMethods: [...SECURITY_METHODS],
          minRequired: 1,
          isActive: true,
        });
        this.logger.log(`Seeded default policy for ${svc}`);
      }
    }
  }

  /* ── Get por servicio ──────────────────────────────── */
  async getByService(serviceType: string): Promise<SecurityPolicy | null> {
    return this.policyModel.findOne({ serviceType });
  }

  /* ── Get todas ─────────────────────────────────────── */
  async getAll(): Promise<SecurityPolicy[]> {
    return this.policyModel.find();
  }

  /* ── Upsert (admin) ────────────────────────────────── */
  async upsert(
    serviceType: ServiceType,
    data: {
      allowedMethods?: string[];
      minRequired?: number;
      isActive?: boolean;
      lastModifiedBy?: string;
    },
  ): Promise<SecurityPolicy> {
    const result = await this.policyModel.findOneAndUpdate(
      { serviceType },
      { $set: { ...data, serviceType } },
      { upsert: true, new: true },
    );
    this.logger.log(
      `Policy updated: ${serviceType} → min=${data.minRequired ?? 'unchanged'}, methods=${data.allowedMethods?.join(',') ?? 'unchanged'}`,
    );
    return result!;
  }
}
