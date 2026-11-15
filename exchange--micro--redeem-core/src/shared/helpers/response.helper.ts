export class ResponseHelper {
  static success(message: string, data: unknown = null) {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, data: unknown = null) {
    return {
      success: false,
      message,
      data,
    };
  }
}