/**
 * Custom Error Classes
 *
 * This module provides custom error classes for better error handling
 * and more descriptive error messages throughout the application.
 */

/**
 * Base application error
 * All custom errors extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
    };
  }
}

/**
 * Validation Error (400)
 * Thrown when user input fails validation
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, true, context);
  }
}

/**
 * Authentication Error (401)
 * Thrown when user is not authenticated
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required", context?: Record<string, any>) {
    super(message, 401, true, context);
  }
}

/**
 * Authorization Error (403)
 * Thrown when user doesn't have permission
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions", context?: Record<string, any>) {
    super(message, 403, true, context);
  }
}

/**
 * Not Found Error (404)
 * Thrown when a resource is not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, any>) {
    super(`${resource} not found`, 404, true, context);
  }
}

/**
 * Conflict Error (409)
 * Thrown when there's a conflict (e.g., duplicate entry)
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 409, true, context);
  }
}

/**
 * Rate Limit Error (429)
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = "Too many requests", retryAfter?: number, context?: Record<string, any>) {
    super(message, 429, true, context);
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Quota Exceeded Error (429)
 * Thrown when user has exceeded their quota
 */
export class QuotaExceededError extends AppError {
  public readonly quotaType: string;
  public readonly limit: number;
  public readonly current: number;
  public readonly resetAt?: Date;

  constructor(
    quotaType: string,
    limit: number,
    current: number,
    resetAt?: Date,
    context?: Record<string, any>
  ) {
    super(`${quotaType} quota exceeded (${current}/${limit})`, 429, true, context);
    this.quotaType = quotaType;
    this.limit = limit;
    this.current = current;
    this.resetAt = resetAt;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      quotaType: this.quotaType,
      limit: this.limit,
      current: this.current,
      resetAt: this.resetAt?.toISOString(),
    };
  }
}

/**
 * External Service Error (502/503)
 * Thrown when an external service (OpenAI, Vercel Blob, etc.) fails
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;
  public readonly originalError?: Error;

  constructor(
    service: string,
    message: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(`${service} error: ${message}`, 502, true, context);
    this.service = service;
    this.originalError = originalError;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      service: this.service,
      originalError: this.originalError?.message,
    };
  }
}

/**
 * Database Error (500)
 * Thrown when database operations fail
 */
export class DatabaseError extends AppError {
  public readonly operation: string;
  public readonly originalError?: Error;

  constructor(
    operation: string,
    message: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(`Database ${operation} failed: ${message}`, 500, true, context);
    this.operation = operation;
    this.originalError = originalError;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
      originalError: this.originalError?.message,
    };
  }
}

/**
 * AI Generation Error (500)
 * Thrown when AI generation fails
 */
export class AIGenerationError extends AppError {
  public readonly generationType: string;
  public readonly originalError?: Error;

  constructor(
    generationType: string,
    message: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(`${generationType} generation failed: ${message}`, 500, true, context);
    this.generationType = generationType;
    this.originalError = originalError;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      generationType: this.generationType,
      originalError: this.originalError?.message,
    };
  }
}

/**
 * File Upload Error (500)
 * Thrown when file upload fails
 */
export class FileUploadError extends AppError {
  public readonly fileName?: string;
  public readonly fileSize?: number;
  public readonly originalError?: Error;

  constructor(
    message: string,
    fileName?: string,
    fileSize?: number,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(`File upload failed: ${message}`, 500, true, context);
    this.fileName = fileName;
    this.fileSize = fileSize;
    this.originalError = originalError;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fileName: this.fileName,
      fileSize: this.fileSize,
      originalError: this.originalError?.message,
    };
  }
}

/**
 * Configuration Error (500)
 * Thrown when application configuration is invalid
 * This is not operational - indicates a programming error
 */
export class ConfigurationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(`Configuration error: ${message}`, 500, false, context);
  }
}

/**
 * Error handler utility
 * Determines if an error is operational or programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for Prisma errors
    if ('code' in error) {
      const prismaError = error as any;
      switch (prismaError.code) {
        case 'P2002':
          return new ConflictError('Unique constraint violation', {
            fields: prismaError.meta?.target,
          });
        case 'P2025':
          return new NotFoundError('Record', { code: prismaError.code });
        case 'P2003':
          return new ValidationError('Foreign key constraint failed', {
            fields: prismaError.meta?.field_name,
          });
        default:
          return new DatabaseError('operation', prismaError.message, error);
      }
    }

    // Generic error
    return new AppError(error.message, 500, false);
  }

  // Unknown error type
  return new AppError('An unknown error occurred', 500, false);
}

/**
 * Error logging utility
 * Logs errors with appropriate severity
 */
export function logError(error: Error | AppError, context?: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...(error instanceof AppError && {
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      context: { ...error.context, ...context },
    }),
  };

  // In production, this should be sent to a logging service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking service
    console.error('[ERROR]', JSON.stringify(errorInfo, null, 2));
  } else {
    // Development: Pretty print
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Error:', error.name);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Message:', error.message);
    if (error instanceof AppError) {
      console.error('Status Code:', error.statusCode);
      console.error('Operational:', error.isOperational);
      if (error.context || context) {
        console.error('Context:', { ...error.context, ...context });
      }
    }
    console.error('Stack:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

/**
 * Create error response for API routes
 */
export function createErrorResponse(error: Error | AppError) {
  const appError = toAppError(error);

  logError(appError);

  return {
    error: appError.name,
    message: appError.message,
    statusCode: appError.statusCode,
    ...(process.env.NODE_ENV === 'development' && {
      stack: appError.stack,
      context: appError.context,
    }),
  };
}
