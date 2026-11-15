import { getCurrencyDecimals } from './currency-meta';

export type MinorUnitsString = string; // base-10 integer string

function assertIntegerString(value: string): void {
  if (!/^-?\d+$/.test(value)) {
    throw new Error('Invalid integer string');
  }
}

export function parseAmountToMinorUnits(amount: string, currency: string): bigint {
  const trimmed = String(amount).trim();
  if (trimmed.length === 0) throw new Error('Amount required');

  const decimals = getCurrencyDecimals(currency);

  // Accept forms: "123", "123.45". Reject scientific.
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(trimmed);
  if (!match) throw new Error('Invalid amount format');

  const sign = match[1] === '-' ? -1n : 1n;
  const integerPart = match[2];
  const fractionalPart = match[3] ?? '';

  if (fractionalPart.length > decimals) {
    throw new Error(`Too many decimals for ${currency}`);
  }

  const paddedFrac = fractionalPart.padEnd(decimals, '0');
  const minorStr = `${integerPart}${paddedFrac}`.replace(/^0+(?=\d)/, '');
  assertIntegerString(minorStr);

  const minor = BigInt(minorStr);
  return minor * sign;
}

export function minorUnitsToString(minorUnits: bigint): MinorUnitsString {
  return minorUnits.toString(10);
}

export function addMinor(a: MinorUnitsString, b: MinorUnitsString): MinorUnitsString {
  assertIntegerString(a);
  assertIntegerString(b);
  return (BigInt(a) + BigInt(b)).toString(10);
}

export function subMinor(a: MinorUnitsString, b: MinorUnitsString): MinorUnitsString {
  assertIntegerString(a);
  assertIntegerString(b);
  return (BigInt(a) - BigInt(b)).toString(10);
}

export function isNegativeMinor(a: MinorUnitsString): boolean {
  assertIntegerString(a);
  return BigInt(a) < 0n;
}

/**
 * Format minor units to human-readable string
 * @example formatMinorUnits('100000000', 8) => '1.00000000'
 * @example formatMinorUnits('123456', 2) => '1234.56'
 */
export function formatMinorUnits(minorUnits: MinorUnitsString, decimals: number): string {
  assertIntegerString(minorUnits);
  const value = BigInt(minorUnits);
  const isNegative = value < 0n;
  const absValue = isNegative ? -value : value;
  
  const str = absValue.toString().padStart(decimals + 1, '0');
  const integerPart = str.slice(0, -decimals) || '0';
  const fractionalPart = str.slice(-decimals);
  
  const sign = isNegative ? '-' : '';
  return `${sign}${integerPart}.${fractionalPart}`;
}

// Re-export from currency-meta
export { CURRENCY_DECIMALS } from './currency-meta';

