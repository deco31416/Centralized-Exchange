import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const correlationId = request.headers['x-correlation-id'] as string || uuidv4();
    const startTime = Date.now();

    // Add correlation ID to request for downstream use
    (request as any).correlationId = correlationId;
    
    // Set correlation ID in response headers
    response.setHeader('x-correlation-id', correlationId);

    this.logger.log('Incoming request', {
      correlationId,
      method: request.method,
      path: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      authenticatedService: (request as any).authenticatedService,
    });

    return next.handle().pipe(
      tap({
        next: (result) => {
          const duration = Date.now() - startTime;
          this.logger.log('Request completed', {
            correlationId,
            method: request.method,
            path: request.url,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            responseSize: result ? JSON.stringify(result).length : 0,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error('Request failed', {
            correlationId,
            method: request.method,
            path: request.url,
            duration: `${duration}ms`,
            error: error.message,
          });
        },
      }),
    );
  }
}