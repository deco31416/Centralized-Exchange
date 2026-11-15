export type FeeScope = "GLOBAL" | "NETWORK" | "ASSET" | "PAIR"
export type FeeOperation = "BUY" | "SELL" | "WITHDRAW" | "DEPOSIT" | "SWAP"
export type FeeType = "FIXED" | "PERCENTAGE"

export type FeeSchedule = {
  _id?: string
  id?: string
  scope: FeeScope
  refIds?: string[]
  operation: FeeOperation
  feeType: FeeType
  value: number
  priority: number
  enabled: boolean
  effectiveFrom?: string
  effectiveUntil?: string
  createdAt?: string
  updatedAt?: string
}

export function getFeeScheduleId(schedule: FeeSchedule) {
  return String(schedule._id ?? schedule.id ?? "")
}
