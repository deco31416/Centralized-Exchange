export interface NotificationsPort {
  notifyExecution(payload: {
    userId: string;
    operationId: string;
    destinationType: string;
    amount: number;
    currency: string;
    message: string;
  }): Promise<void>;
}