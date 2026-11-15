/**
 * Standard decimal precision for ledger accounting
 * 
 * This defines the canonical decimal precision for each unified asset code
 * in the ledger, regardless of which blockchain the asset came from.
 * 
 * When deposits are processed, amounts are converted from blockchain-specific
 * decimals to these standard ledger decimals.
 */

export const LEDGER_ASSET_DECIMALS: Record<string, number> = {
  // Fiat currencies (2 decimals)
  'USD': 2,
  'BSS': 2, // Venezuelan Bolivar
  
  // Native cryptocurrencies (8 decimals - Bitcoin standard)
  'BTC': 8,
  'ETH': 8,
  'BNB': 8,
  'XLM': 7, // Stellar uses 7 decimals (stroops)
  'TRX': 6, // Tron uses 6 decimals (SUN)
  
  // Stablecoins (8 decimals for consistency)
  // Note: Even though USDC uses 6 decimals on Ethereum and 7 on Stellar,
  // we standardize to 8 decimals in the ledger for consistency with other crypto
  'USDT': 8,
  'USDC': 8,
  'BUSD': 8,
};

/**
 * Get the standard decimal precision for a ledger asset
 * 
 * @param assetCode - The unified ledger asset code (e.g., 'USDC', 'BTC')
 * @returns The number of decimal places for this asset
 * 
 * @example
 * getLedgerDecimals('USDC') // Returns 8
 * getLedgerDecimals('BTC') // Returns 8
 * getLedgerDecimals('USD') // Returns 2
 */
export function getLedgerDecimals(assetCode: string): number {
  return LEDGER_ASSET_DECIMALS[assetCode] ?? 8; // Default to 8 for unknown crypto assets
}

/**
 * Convert an amount from blockchain-specific decimals to ledger decimals
 * 
 * @param amount - The amount in major units (e.g., 6.5 USDC)
 * @param fromDecimals - Source blockchain decimals (e.g., 7 for Stellar)
 * @param toDecimals - Target ledger decimals (e.g., 8 for standardized USDC)
 * @returns The amount in ledger minor units
 * 
 * @example
 * // Stellar USDC (7 decimals) to ledger USDC (8 decimals)
 * convertToLedgerMinorUnits(6, 7, 8) // Returns 600000000
 */
export function convertToLedgerMinorUnits(
  amount: number,
  fromDecimals: number,
  toDecimals: number
): number {
  // Convert to minor units with source decimals
  const sourceMinor = Math.round(amount * Math.pow(10, fromDecimals));
  
  // Convert to target decimals
  if (fromDecimals === toDecimals) {
    return sourceMinor;
  } else if (fromDecimals < toDecimals) {
    // Increase precision (e.g., 7 decimals to 8 decimals)
    const multiplier = Math.pow(10, toDecimals - fromDecimals);
    return sourceMinor * multiplier;
  } else {
    // Decrease precision (e.g., 18 decimals to 8 decimals)
    const divisor = Math.pow(10, fromDecimals - toDecimals);
    return Math.round(sourceMinor / divisor);
  }
}

/**
 * Convert ledger minor units to major units for display
 * 
 * @param minorUnits - The amount in ledger minor units
 * @param assetCode - The unified ledger asset code
 * @returns The amount in major units
 * 
 * @example
 * ledgerMinorToMajor(600000000, 'USDC') // Returns 6
 * ledgerMinorToMajor(100000000, 'BTC') // Returns 1
 */
export function ledgerMinorToMajor(minorUnits: number, assetCode: string): number {
  const decimals = getLedgerDecimals(assetCode);
  return minorUnits / Math.pow(10, decimals);
}

/**
 * Convert major units to ledger minor units
 * 
 * @param majorUnits - The amount in major units
 * @param assetCode - The unified ledger asset code
 * @returns The amount in ledger minor units
 * 
 * @example
 * ledgerMajorToMinor(6, 'USDC') // Returns 600000000
 * ledgerMajorToMinor(1, 'BTC') // Returns 100000000
 */
export function ledgerMajorToMinor(majorUnits: number, assetCode: string): number {
  const decimals = getLedgerDecimals(assetCode);
  return Math.round(majorUnits * Math.pow(10, decimals));
}
