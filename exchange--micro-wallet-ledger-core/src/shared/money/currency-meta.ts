export const CURRENCY_DECIMALS: Record<string, number> = {
  // Fiat
  MXN: 2,
  USD: 2,
  COP: 2,
  PEN: 2,
  SVC: 2,
  ARS: 2,
  CLP: 0,
  EUR: 2,
  VES: 2,
  BRL: 2,
  // Unidad interna BlackCEX
  BLC: 2,
  // Crypto major
  BTC: 8,
  ETH: 8,
  BNB: 8,
  // Stablecoins (6 decimales nativo)
  USDT: 6,
  USDC: 6,
  USDT_TRX: 6,
  USDC_TRX: 6,
  // Tokens propios
  DECOX: 8,
  DECO: 2,
};

export function getCurrencyDecimals(currency: string): number {
  const decimals = CURRENCY_DECIMALS[currency];
  if (typeof decimals !== 'number') {
    throw new Error(`Unsupported currency: ${currency}`);
  }
  return decimals;
}
