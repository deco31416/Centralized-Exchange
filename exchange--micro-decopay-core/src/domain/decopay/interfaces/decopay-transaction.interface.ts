export interface DECOPAYTransaction {
  id: string;
  requestId: string;
  amount: number;
  currency: string;
  status: 'CREATED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  updatedAt?: string;
}