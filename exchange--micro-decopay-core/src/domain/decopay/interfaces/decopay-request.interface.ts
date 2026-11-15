export interface DECOPAYRequest {
  id: string;
  payerUserId: string;
  collectorUserId: string;
  amount: number;
  currency: string;
  concept?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
  paidAt?: string | null;
}