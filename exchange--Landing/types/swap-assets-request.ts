interface SwapAssetsRequest {
  from: string;
  to: string;
  amount: number;
  type: "BUY" | "SELL";
}