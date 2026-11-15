import { WithdrawalStatus } from './withdrawal.schema';

/**
 * DTO for withdrawal response
 */
export class WithdrawalResponseDto {
  withdrawalId: string;
  status: WithdrawalStatus;
  userId: string;
  assetCode: string;
  amount: number;
  destinationAddress: string;
  txHash?: string;
  gasFee?: number;
  gasFeeAsset?: string;
  confirmations: number;
  requestedAt: Date;
  broadcastedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
}
