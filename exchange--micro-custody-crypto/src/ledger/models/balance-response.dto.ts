/**
 * Response DTO for account balance queries.
 */
export class BalanceResponseDto {
  accountId: string;
  assetCode: string;
  balanceMinor: number;
  availableMinor: number;
  heldMinor: number;
}
