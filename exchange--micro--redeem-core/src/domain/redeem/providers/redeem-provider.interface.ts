export interface RedeemProviderInterface {
  getQuote(payload: {
    userId: string;
    sourceAsset: string;
    targetAsset: string;
    sourceAmount: number;
  }): Promise<unknown>;
}