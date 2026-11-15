export interface AuthPort {
  validateUser(userId: string): Promise<{ valid: boolean; userId: string }>;
}