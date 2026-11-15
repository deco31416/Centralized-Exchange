import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Beneficiary, BeneficiaryDocument } from '../schemas/beneficiary.schema';
import { CreateSpeiBeneficiaryDto } from '../../application/dto/create-spei-beneficiary.dto';
import { CreateBankBeneficiaryDto } from '../../application/dto/create-bank-beneficiary.dto';

@Injectable()
export class BeneficiaryService {
  private readonly logger = new Logger(BeneficiaryService.name);

  constructor(
    @InjectModel(Beneficiary.name)
    private readonly model: Model<BeneficiaryDocument>,
  ) {}

  // ─── CLABE checksum validation (algoritmo oficial Banco de México) ────────────
  private validateClabe(clabe: string): boolean {
    if (!/^\d{18}$/.test(clabe)) return false;
    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
    const digits = clabe.split('').map(Number);
    const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
    const control = (10 - (sum % 10)) % 10;
    return control === digits[17];
  }

  // ─── SPEI ─────────────────────────────────────────────────────────────────────
  async getSpeiAccounts(userId: string) {
    const docs = await this.model
      .find({ userId, type: 'SPEI' })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return docs.map((d) => ({
      id: (d._id as Types.ObjectId).toString(),
      alias: d.alias,
      beneficiaryName: d.beneficiaryName,
      clabe: d.clabe,
      bankCode: d.bankCode,
    }));
  }

  async createSpeiBeneficiary(userId: string, dto: CreateSpeiBeneficiaryDto) {
    if (!this.validateClabe(dto.clabe)) {
      throw new BadRequestException(
        'CLABE inválida: el dígito verificador no coincide',
      );
    }

    const existing = await this.model
      .findOne({ userId, type: 'SPEI', clabe: dto.clabe })
      .lean()
      .exec();
    if (existing) {
      throw new BadRequestException(
        'Ya tienes una cuenta SPEI registrada con esta CLABE',
      );
    }

    const doc = await this.model.create({
      userId,
      type: 'SPEI',
      alias: dto.alias,
      beneficiaryName: dto.beneficiaryName,
      clabe: dto.clabe,
      bankCode: dto.bankCode,
    });

    this.logger.log(`SPEI beneficiary created for user=${userId} clabe=${dto.clabe}`);

    return {
      id: (doc._id as Types.ObjectId).toString(),
      alias: doc.alias,
      beneficiaryName: doc.beneficiaryName,
      clabe: doc.clabe,
      bankCode: doc.bankCode,
    };
  }

  // ─── BANK ─────────────────────────────────────────────────────────────────────
  async getBankAccounts(userId: string) {
    const docs = await this.model
      .find({ userId, type: 'BANK' })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return docs.map((d) => ({
      id: (d._id as Types.ObjectId).toString(),
      alias: d.alias,
      beneficiaryName: d.beneficiaryName,
      accountNumber: d.accountNumber,
      bankName: d.bankName,
      bankCode: d.bankCode,
      accountType: d.accountType,
    }));
  }

  async createBankBeneficiary(userId: string, dto: CreateBankBeneficiaryDto) {
    const doc = await this.model.create({
      userId,
      type: 'BANK',
      alias: dto.alias,
      beneficiaryName: dto.beneficiaryName,
      accountNumber: dto.accountNumber,
      bankName: dto.bankName,
      bankCode: dto.bankCode,
      accountType: dto.accountType,
    });

    this.logger.log(`BANK beneficiary created for user=${userId} account=${dto.accountNumber}`);

    return {
      id: (doc._id as Types.ObjectId).toString(),
      alias: doc.alias,
      beneficiaryName: doc.beneficiaryName,
      accountNumber: doc.accountNumber,
      bankName: doc.bankName,
      bankCode: doc.bankCode,
      accountType: doc.accountType,
    };
  }

  // ─── SEARCH ───────────────────────────────────────────────────────────────────
  async searchBankAccounts(userId: string, query: string) {
    const all = await this.getBankAccounts(userId);
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (a) =>
        a.alias.toLowerCase().includes(q) ||
        (a.beneficiaryName ?? '').toLowerCase().includes(q) ||
        (a.accountNumber ?? '').toLowerCase().includes(q),
    );
  }

  // ─── DELETE (shared SPEI / BANK) ──────────────────────────────────────────────
  async deleteBeneficiary(userId: string, id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Beneficiario no encontrado');
    }
    const result = await this.model
      .deleteOne({ _id: new Types.ObjectId(id), userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Beneficiario no encontrado');
    }
    this.logger.log(`Beneficiary ${id} deleted for user=${userId}`);
  }
}
