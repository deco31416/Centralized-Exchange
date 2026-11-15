import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      success: true,
      service: 'Exchange--micro-loans-core',
      message: 'Microservice is running',
      timestamp: new Date().toISOString(),
    };
  }
}