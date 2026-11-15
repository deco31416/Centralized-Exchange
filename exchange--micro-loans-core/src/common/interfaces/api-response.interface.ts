export interface ApiResponseInterface<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}