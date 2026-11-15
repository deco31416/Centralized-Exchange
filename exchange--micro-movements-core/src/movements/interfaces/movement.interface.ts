import { MovementTypeEnum } from '../enums/movement-type.enum';

export interface Movement {
  id: string;
  sourceId: string;
  userId: string;
  type: MovementTypeEnum;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  direction: 'credit' | 'debit';
  createdAt: string;
  metadata?: Record<string, any>;
}