/**
 * Asset Code Mapping Utilities
 * 
 * Maps blockchain-specific token codes (used for deposit detection)
 * to unified ledger asset codes (used for accounting).
 * 
 * Example:
 * - USDT_BSC → USDT
 * - USDT_ETH → USDT
 * - USDT_TRX → USDT
 * - USDC_BSC → USDC
 * - USDC_ETH → USDC
 * - USDC_TRX → USDC
 * - USDC_XLM → USDC
 */

/**
 * Mapping from blockchain-specific asset codes to unified ledger codes
 */
export const ASSET_CODE_MAPPING: Record<string, string> = {
  // Native coins (no mapping needed - already unified)
  'BTC': 'BTC',
  'ETH': 'ETH',
  'BNB': 'BNB',
  'BSS': 'BSS',
  'TRX': 'TRX',
  'XLM': 'XLM',
  
  // USDT - unified across all chains
  'USDT_BSC': 'USDT',
  'USDT_ETH': 'USDT',
  'USDT_TRX': 'USDT',
  
  // USDC - unified across all chains
  'USDC_BSC': 'USDC',
  'USDC_ETH': 'USDC',
  'USDC_TRX': 'USDC',
  'USDC_XLM': 'USDC',
  
  // BUSD - unified across all chains
  'BUSD_BSC': 'BUSD',
  
  // Fiat
  'USD': 'USD',
};

/**
 * Maps a blockchain-specific asset code to its unified ledger asset code
 * 
 * @param blockchainAssetCode - The asset code from token configuration (e.g., 'USDT_BSC')
 * @returns The unified asset code for ledger accounting (e.g., 'USDT')
 * 
 * @example
 * mapToLedgerAssetCode('USDT_BSC') // Returns 'USDT'
 * mapToLedgerAssetCode('USDT_TRX') // Returns 'USDT'
 * mapToLedgerAssetCode('USDC_ETH') // Returns 'USDC'
 * mapToLedgerAssetCode('BTC') // Returns 'BTC'
 */
export function mapToLedgerAssetCode(blockchainAssetCode: string): string {
  return ASSET_CODE_MAPPING[blockchainAssetCode] || blockchainAssetCode;
}

/**
 * Extracts the base symbol from a blockchain-specific asset code
 * 
 * @param blockchainAssetCode - The asset code (e.g., 'USDT_BSC', 'USDC_ETH')
 * @returns The base symbol (e.g., 'USDT', 'USDC')
 * 
 * @example
 * getBaseSymbol('USDT_BSC') // Returns 'USDT'
 * getBaseSymbol('USDC_ETH') // Returns 'USDC'
 * getBaseSymbol('BTC') // Returns 'BTC'
 */
export function getBaseSymbol(blockchainAssetCode: string): string {
  // If it has an underscore, take the part before it
  const parts = blockchainAssetCode.split('_');
  return parts[0];
}

/**
 * Extracts the blockchain identifier from a blockchain-specific asset code
 * 
 * @param blockchainAssetCode - The asset code (e.g., 'USDT_BSC', 'USDC_ETH')
 * @returns The blockchain identifier or null if not present (e.g., 'BSC', 'ETH', null)
 * 
 * @example
 * getBlockchainFromAssetCode('USDT_BSC') // Returns 'BSC'
 * getBlockchainFromAssetCode('USDC_ETH') // Returns 'ETH'
 * getBlockchainFromAssetCode('BTC') // Returns null
 */
export function getBlockchainFromAssetCode(blockchainAssetCode: string): string | null {
  const parts = blockchainAssetCode.split('_');
  return parts.length > 1 ? parts[1] : null;
}

/**
 * Checks if an asset code is blockchain-specific
 * 
 * @param assetCode - The asset code to check
 * @returns True if the asset code is blockchain-specific (contains underscore)
 * 
 * @example
 * isBlockchainSpecific('USDT_BSC') // Returns true
 * isBlockchainSpecific('BTC') // Returns false
 */
export function isBlockchainSpecific(assetCode: string): boolean {
  return assetCode.includes('_');
}

/**
 * Gets all blockchain-specific variants for a unified asset code
 * 
 * @param unifiedAssetCode - The unified asset code (e.g., 'USDT')
 * @returns Array of blockchain-specific codes (e.g., ['USDT_BSC', 'USDT_ETH', 'USDT_TRX'])
 * 
 * @example
 * getBlockchainVariants('USDT') // Returns ['USDT_BSC', 'USDT_ETH', 'USDT_TRX']
 * getBlockchainVariants('USDC') // Returns ['USDC_BSC', 'USDC_ETH', 'USDC_TRX', 'USDC_XLM']
 * getBlockchainVariants('BTC') // Returns ['BTC']
 */
export function getBlockchainVariants(unifiedAssetCode: string): string[] {
  const variants: string[] = [];
  
  for (const [blockchainCode, unifiedCode] of Object.entries(ASSET_CODE_MAPPING)) {
    if (unifiedCode === unifiedAssetCode) {
      variants.push(blockchainCode);
    }
  }
  
  // If no variants found, return the original code
  return variants.length > 0 ? variants : [unifiedAssetCode];
}
