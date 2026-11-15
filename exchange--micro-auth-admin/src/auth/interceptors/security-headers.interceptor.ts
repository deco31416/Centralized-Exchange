import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';

/**
 * Interceptor to add security headers to all responses
 */
@Injectable()
export class SecurityHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        // Security headers
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader('X-Frame-Options', 'DENY');
        response.setHeader('X-XSS-Protection', '1; mode=block');
        response.setHeader(
          'Referrer-Policy',
          'strict-origin-when-cross-origin',
        );
        response.setHeader(
          'Permissions-Policy',
          'geolocation=(), microphone=(), camera=()',
        );

        // HSTS (only in production with HTTPS)
        if (process.env.NODE_ENV === 'production') {
          response.setHeader(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains',
          );
        }

        // Remove potentially revealing headers
        response.removeHeader('X-Powered-By');
        response.removeHeader('Server');
      }),
    );
  }
}
