import { LoanStatusEnum } from '../models/loan-status.enum';

export interface LoanInterface {
  id: string;
  applicantId?: string;
  amount: number;
  balance: number;
  currency: string;
  status: LoanStatusEnum;
  interestRate?: number;
  termMonths?: number;
  createdAt?: string;
}