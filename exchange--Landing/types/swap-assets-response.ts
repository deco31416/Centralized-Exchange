interface SwapAssetsResponse {
  from: string;     // Moneda de origen, por ejemplo: "BTC"
  to: string;       // Moneda de destino, por ejemplo: "USD"
  amount: number;   // Monto en la moneda de origen
  type: 'BUY' | 'SELL';  // Tipo de operación (limitado a "BUY" o "SELL")
  result: number;   // Monto estimado en la moneda de destino
}
