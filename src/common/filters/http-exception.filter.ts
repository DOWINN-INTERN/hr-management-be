import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import * as crypto from 'crypto';
import { Request, Response } from 'express';

/**
 * HttpExceptionFilter is a global filter that handles all exceptions thrown in the application.
 * It logs the error details, sanitizes sensitive information, and sends a user-friendly response to the client.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly errorCount = new Map<string, number>();
  private readonly SENSITIVE_PATTERNS = [
    /(?:confirm)?password/i,
    /token/i, 
    /credit.?card/i, 
    /secret/i,
    /ssn/i, 
    /social.?security.?number/i, 
    /api.?key/i, 
    /private.?key/i, 
    /pin/i, 
    /passcode/i
  ];


  /**
   * Catches and handles exceptions thrown in the application.
   * @param exception - The exception that was thrown.
   * @param host - The arguments host containing request and response objects.
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = crypto.randomUUID();

    // Determine error details
    const status = this.getHttpStatus(exception);
    const error = this.normalizeError(exception);
    const timestamp = new Date().toISOString();

    // Get client IP with fallbacks
    const clientIp = 
      request.socket.remoteAddress ||
      request.ip ||
      'unknown';

    // Track error frequency
    this.trackErrorFrequency(clientIp, status);

    // Prepare client response
    const clientResponse = {
      statusCode: status,
      timestamp,
      traceId,
      path: request.url,
      detail: error.name,
      message: exception instanceof HttpException 
        ? (exception.getResponse() as any).message || error.message
        : this.getClientMessage(error.message, status),
    };

    response.status(status).json(clientResponse);
  }

  /**
   * Determines the HTTP status code from the exception.
   * @param exception - The exception to evaluate.
   * @returns The HTTP status code.
   */
  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Normalizes the exception to an Error object.
   * @param exception - The exception to normalize.
   * @returns The normalized Error object.
   */
  private normalizeError(exception: unknown): Error {
    if (exception instanceof Error) {
      return exception;
    }
    return new Error(String(exception));
  }

  /**
   * Sanitizes sensitive headers from the request.
   * @param headers - The headers to sanitize.
   * @returns The sanitized headers.
   */
  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-auth-token'];
    sensitiveHeaders.forEach(header => {
      if (header in sanitized) {
        sanitized[header] = '[REDACTED]';
      }
    });
    return sanitized;
  }

  /**
   * Generates a user-friendly message for the client.
   * @param message - The original error message.
   * @param status - The HTTP status code.
   * @returns The user-friendly message.
   */
  private getClientMessage(message: string, status: number): string {
    return this.sanitizeSensitiveData(message);
  }

  /**
   * Sanitizes sensitive data in the error message.
   * @param message - The message to sanitize.
   * @returns The sanitized message.
   */
  private sanitizeSensitiveData(message: string): string {
    let sanitized = message;
    this.SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    return sanitized;
  }

  /**
   * Tracks the frequency of errors from a specific IP address.
   * @param ip - The IP address of the client.
   * @param status - The HTTP status code of the error.
   */
  private trackErrorFrequency(ip: string, status: number): void {
    const key = `${ip}:${status}`;
    const count = (this.errorCount.get(key) || 0) + 1;
    this.errorCount.set(key, count);

    if (count > 10) {
      this.logger.warn({
        type: 'POTENTIAL_ATTACK',
        ip,
        errorCount: count,
        status,
      });
    }
  }

  /**
   * Logs the error details.
   * @param errorContext - The context of the error to log.
   */
  private logError(errorContext: any): void {
    if (errorContext.status >= 500) {
      this.logger.error(errorContext);
    } else {
      this.logger.warn(errorContext);
    }
  }
}