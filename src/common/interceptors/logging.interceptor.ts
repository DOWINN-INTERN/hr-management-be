import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import * as crypto from 'crypto';

/**
 * LoggingInterceptor is a NestJS interceptor that logs HTTP requests and responses.
 * It also sanitizes sensitive data and adds a correlation ID to each request and response.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly SENSITIVE_FIELDS = ['password', 'token', 'authorization', 'creditCard'];
  private readonly ALLOWED_HEADERS = ['user-agent', 'content-type', 'accept', 'origin'];

  /**
   * Intercepts HTTP requests and responses to log relevant information.
   * @param context - The execution context of the request.
   * @param next - The next handler in the request pipeline.
   * @returns An observable of the response.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const correlationId = request.headers['x-correlation-id'] || crypto.randomUUID();
    const startTime = Date.now();

    // Set correlation ID in response headers
    response.setHeader('x-correlation-id', correlationId);

    // Log request
    this.logger.log({
      type: 'REQUEST',
      correlationId,
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.originalUrl,
      query: this.sanitizeData(request.query),
      body: this.sanitizeData(request.body),
      headers: this.filterHeaders(request.headers),
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return next.handle().pipe(
      tap((responseBody) => {
        this.logResponse(correlationId, startTime, response.statusCode, responseBody);
      }),
      catchError((error) => {
        this.logError(correlationId, startTime, error);
        throw error;
      }),
    );
  }

  /**
   * Sanitizes sensitive data in the request body or query parameters.
   * @param data - The data to sanitize.
   * @returns The sanitized data.
   */
  private sanitizeData(data: any): any {
    if (!data) return data;
    const sanitized = { ...data };
    
    const sanitizeObject = (obj: any) => {
      for (const key in obj) {
        if (this.SENSITIVE_FIELDS.includes(key.toLowerCase())) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key]);
        }
      }
    };

    sanitizeObject(sanitized);
    return sanitized;
  }

  /**
   * Filters headers to include only allowed headers.
   * @param headers - The headers to filter.
   * @returns The filtered headers.
   */
  private filterHeaders(headers: any): any {
    return Object.keys(headers)
      .filter(key => this.ALLOWED_HEADERS.includes(key.toLowerCase()))
      .reduce((obj: { [key: string]: any }, key) => {
        obj[key] = headers[key];
        return obj;
      }, {});
  }

  /**
   * Logs the response details.
   * @param correlationId - The correlation ID of the request.
   * @param startTime - The start time of the request.
   * @param statusCode - The HTTP status code of the response.
   * @param body - The response body.
   */
  private logResponse(correlationId: string, startTime: number, statusCode: number, body: any): void {
    this.logger.log({
      type: 'RESPONSE',
      correlationId,
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - startTime}ms`,
      statusCode,
      responseSize: JSON.stringify(body).length,
      success: statusCode < 400,
    });
  }

  /**
   * Logs the error details.
   * @param correlationId - The correlation ID of the request.
   * @param startTime - The start time of the request.
   * @param error - The error object.
   */
  private logError(correlationId: string, startTime: number, error: any): void {
    this.logger.error({
      type: 'ERROR',
      correlationId,
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - startTime}ms`,
      statusCode: error.status || 500,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}