import { RedeemStatus } from '../types/redeem-status.type';

export interface RedeemConfirmationInterface {
  redeemId: string;
  status: RedeemStatus;
  createdAt: string;
  quoteId: string;
  sourceAsset: string;
  targetAsset: string;
}