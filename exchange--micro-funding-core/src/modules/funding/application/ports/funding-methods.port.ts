import type { FundingMethodEntity } from '../../domain/entities/funding-method.entity';

export interface FundingMethodsPort {
  getAvailableMethods(filters?: {
    fiatCode?: string;
    countryCode?: string;
  }): Promise<FundingMethodEntity[]>;
  listAllMethods(): Promise<FundingMethodEntity[]>;
  getMethodByCode(code: string): Promise<FundingMethodEntity | null>;
  createMethod(method: FundingMethodEntity): Promise<FundingMethodEntity>;
  updateMethod(code: string, changes: Partial<FundingMethodEntity>): Promise<FundingMethodEntity | null>;
}