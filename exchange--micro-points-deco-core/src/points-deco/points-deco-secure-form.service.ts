import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PointOrderActionInput } from './points-deco.interfaces';
import { pointOrderActorId } from './points-deco-order-audit';
import {
  PointSecureFormEntity,
  PointSecureFormStatus,
  PointSecureFormType,
} from './schemas/point-secure-form.schema';

type SecureFormInput = {
  type?: PointSecureFormType;
  orderId?: string;
  pointId?: string;
  userId?: string;
  submittedBy?: string;
  submittedByRole?: string;
  consentAccepted?: boolean;
  fields?: Record<string, unknown>;
  evidenceRefs?: string[];
  expiresAt?: string;
};

type SecureFieldValue = string | number | boolean | SecureFieldValue[];

@Injectable()
export class PointsDecoSecureFormService {
  constructor(
    @InjectModel(PointSecureFormEntity.name)
    private readonly formModel: Model<PointSecureFormEntity>,
  ) {}

  async listForms(query: Record<string, string | undefined> = {}) {
    const filter: Record<string, string> = {};
    if (query.type) filter.type = query.type.trim();
    if (query.status) filter.status = query.status.trim();
    if (query.orderId) filter.orderId = query.orderId.trim();
    if (query.pointId) filter.pointId = query.pointId.trim();
    if (query.userId) filter.userId = query.userId.trim();
    const requestedLimit = Number(query.limit ?? 50);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 50;

    try {
      const items = await this.formModel
        .find(filter)
        .sort({ createdAt: -1, createdAtIso: -1 })
        .limit(limit)
        .lean();

      return {
        items,
        count: items.length,
        source: 'mongo-persistent',
        updatedAt: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco secure forms.',
      );
    }
  }

  async createForm(input: SecureFormInput) {
    const type = input.type;
    if (!type) throw new BadRequestException('Form type is required.');
    if (!input.consentAccepted) {
      throw new BadRequestException('Consent is required for secure forms.');
    }

    const fields = this.sanitizeFields(input.fields ?? {});
    const evidenceRefs = this.sanitizeEvidenceRefs(input.evidenceRefs ?? []);
    if (Object.keys(fields).length === 0 && evidenceRefs.length === 0) {
      throw new BadRequestException('Secure form requires fields or evidence references.');
    }

    const now = new Date().toISOString();
    const form: PointSecureFormEntity = {
      id: `pd-secure-form-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      status: 'submitted',
      orderId: input.orderId,
      pointId: input.pointId,
      userId: input.userId,
      submittedBy: input.submittedBy?.trim() || 'unknown',
      submittedByRole: input.submittedByRole?.trim() || 'user',
      consentAccepted: true,
      fields,
      evidenceRefs,
      expiresAt: input.expiresAt,
      auditTrail: [
        {
          event: 'secure_form_submitted',
          actorId: input.submittedBy?.trim() || 'unknown',
          actorRole: input.submittedByRole?.trim() || 'user',
          at: now,
        },
      ],
      createdAtIso: now,
    };

    try {
      const created = await this.formModel.create(form);
      return {
        form: created.toObject(),
        nextRequiredAction: 'REVIEW_SECURE_FORM_IN_ADMIN_PANEL',
        source: 'mongo-persistent',
      };
    } catch {
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco secure forms.',
      );
    }
  }

  async reviewForm(
    id: string,
    input: PointOrderActionInput & { status?: PointSecureFormStatus } = {},
  ) {
    const form = await this.requireForm(id);
    const status = input.status ?? 'reviewing';
    if (!['reviewing', 'approved', 'rejected', 'expired'].includes(status)) {
      throw new BadRequestException('Invalid secure form review status.');
    }

    const now = new Date().toISOString();
    const actorId = pointOrderActorId(input);
    const nextAudit = [
      ...(form.auditTrail ?? []),
      {
        event: 'secure_form_reviewed',
        status,
        actorId,
        actorRole: input.actorRole || 'admin',
        note: input.note?.trim() || input.reason?.trim(),
        at: now,
      },
    ];

    try {
      const updated = await this.formModel
        .findOneAndUpdate(
          { id },
          {
            $set: {
              status,
              reviewedBy: actorId,
              reviewedByRole: input.actorRole || 'admin',
              reviewedAt: now,
              reviewNote: input.note?.trim() || input.reason?.trim(),
              auditTrail: nextAudit,
            },
          },
          { new: true },
        )
        .lean();

      if (!updated) throw new NotFoundException(`Secure form not found: ${id}`);

      return {
        form: updated,
        nextRequiredAction:
          status === 'approved' ? 'CONTINUE_OPERATION_REVIEW' : 'KEEP_OPERATION_IN_REVIEW',
        source: 'mongo-persistent',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco secure forms.',
      );
    }
  }

  private async requireForm(id: string) {
    try {
      const form = await this.formModel.findOne({ id }).lean();
      if (!form) throw new NotFoundException(`Secure form not found: ${id}`);
      return form as PointSecureFormEntity;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException(
        'Persistent MongoDB is required for Puntos Deco secure forms.',
      );
    }
  }

  private sanitizeFields(fields: Record<string, unknown>) {
    const entries: Array<[string, unknown]> = Object.entries(fields)
      .slice(0, 20)
      .map(([key, value]) => [
        key.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 64),
        this.safeValue(value),
      ]);

    return Object.fromEntries(
      entries.filter(
        ([key, value]) =>
          Boolean(key) && value !== '' && value !== null && typeof value !== 'undefined',
      ),
    );
  }

  private safeValue(value: unknown): SecureFieldValue {
    if (typeof value === 'string') return value.trim().slice(0, 500);
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) {
      return value.slice(0, 10).map((item) => this.safeValue(item));
    }
    return String(value ?? '').slice(0, 500);
  }

  private sanitizeEvidenceRefs(evidenceRefs: string[]) {
    return Array.from(
      new Set(
        evidenceRefs
          .filter((ref) => typeof ref === 'string')
          .map((ref) => ref.trim())
          .filter(Boolean)
          .slice(0, 20),
      ),
    );
  }
}
