export const AUTH_CLIENT = 'AUTH_CLIENT';

export interface AuthUserSummary {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface AuthClientPort {
  validateUser(userId: string): Promise<AuthUserSummary | null>;
  searchRecipient(query: string): Promise<AuthUserSummary | null>;
}