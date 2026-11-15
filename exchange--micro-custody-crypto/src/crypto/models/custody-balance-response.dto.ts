/**
 * DTO for custody wallet balance response
 */
export class CustodyBalanceResponseDto {
  assetCode: string;
  blockchain: string;
  mainAddress: string;
  balance: number;
  balanceMinor: number;
  maxWithdrawalPerTx: number;
  maxWithdrawalPerHour: number;
  maxWithdrawalPerDay: number;
  currentHourWithdrawals: number;
  currentDayWithdrawals: number;
  minOperationalBalance: number;
  isActive: boolean;
  isLocked: boolean;
  lastBalanceCheck: Date;
}
