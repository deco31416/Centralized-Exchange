export interface RedeemPreviewInterface {
  previewId: string;
  status: string;
  userId: string;
  sourceAsset: string;
  targetAsset: string;
  sourceAmount: number;
  targetAmount: number;
  fee: number;
  rate: number;
  expiresAt: string;
}