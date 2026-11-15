export interface SwapAssetsRequest {
  from: string;
  to: string;
  amount: number;
  type: "BUY" | "SELL";
}

export interface SwapAssetsResponse {
  from: string;
  to: string;
  amount: number;
  type: "BUY" | "SELL";
  result: number;
}
