const DECIMALS_BY_CURRENCY: Record<string, number> = {
  BTC: 8,
  ETH: 18,
  USDT: 6,
  USDC: 6,
  COP: 2,
  USD: 2,
  EUR: 2,
  MXN: 2,
  CLP: 0,
  PEN: 2,
  ARS: 2,
  VES: 2,
  AWG: 2,
  BRL: 2,
  DOP: 2,
};

export function amountToMinorUnits(amount: number, currency: string) {
  const decimals = DECIMALS_BY_CURRENCY[currency.toUpperCase()] ?? 2;
  const factor = 10 ** decimals;
  return String(Math.round(amount * factor));
}
