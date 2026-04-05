export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, code?: string) {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = "Authentication required", code?: string) {
    return new AppError(message, 401, code);
  }

  static forbidden(message = "Access denied", code?: string) {
    return new AppError(message, 403, code);
  }

  static notFound(resource = "Resource", code?: string) {
    return new AppError(`${resource} not found`, 404, code);
  }

  static conflict(message: string, code?: string) {
    return new AppError(message, 409, code);
  }

  static unprocessable(message: string, code?: string) {
    return new AppError(message, 422, code);
  }

  static tooManyRequests(message = "Too many requests", code?: string) {
    return new AppError(message, 429, code);
  }

  static internal(message = "Internal server error", code?: string) {
    return new AppError(message, 500, code);
  }
}
