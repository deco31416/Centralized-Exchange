export interface SavedCardEntity {
  cardId: string;
  userId: string;
  brand: string;
  last4: string;
  holderName: string;
  expMonth: number;
  expYear: number;
  tokenized: boolean;
  alias?: string;
}