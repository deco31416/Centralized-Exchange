import { DepositStatus } from './deposit.schema';

/**
 * DTO for deposit response
 */
export class DepositResponseDto {
  depositId: string;
  status: DepositStatus;
  userId: string;
  blockchain: string;
  assetCode: string;
  amount: number;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  confirmations: number;
  requiredConfirmations: number;
  detectedAt: Date;
  confirmedAt?: Date;
  creditedAt?: Date;
}
