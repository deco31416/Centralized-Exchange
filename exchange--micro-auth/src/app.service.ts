import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getServiceInfo() {
    return {
      service: 'DECO31416 Admin Auth Microservice',
      version: '2.0.0',
      status: 'operational',
      endpoints: {
        swagger: '/api/docs',
        auth: '/api/v1/auth',
        oauth: '/api/v1/oauth',
        health: '/api/v1/health',
      },
      features: [
        'JWT Authentication (Access + Refresh Tokens)',
        'OTP Email Verification',
        'Session Management with Redis',
        'OAuth Integration (Google/GitHub)',
        'Rate Limiting & Security Headers',
        'CORS Protection',
      ],
      documentation: '/api/docs',
    };
  }
}
