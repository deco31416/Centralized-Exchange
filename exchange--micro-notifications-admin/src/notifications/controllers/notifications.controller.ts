import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
  SetMetadata,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { NotificationsService } from '../services/notifications.service';
import { SendEmailDto } from '../models/send-email.dto';
import { SendSmsDto } from '../models/send-sms.dto';
import {
  NotificationResponseDto,
  JobStatusResponseDto,
  QueueStatsResponseDto,
} from '../models/notification-response.dto';

@Controller('notifications')
@ApiTags('notifications')
@ApiBearerAuth('service-token')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Enqueue an email notification
   */
  @Post('email')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendEmail(
    @Body() sendEmailDto: SendEmailDto,
    @Request() req: any,
  ): Promise<NotificationResponseDto> {
    const requestedBy = req.authenticatedService || 'unknown-service';
    const correlationId = req.correlationId;

    return this.notificationsService.sendEmail(
      sendEmailDto,
      requestedBy,
      correlationId,
    );
  }

  /**
   * Enqueue an SMS notification
   */
  @Post('sms')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendSms(
    @Body() sendSmsDto: SendSmsDto,
    @Request() req: any,
  ): Promise<NotificationResponseDto> {
    const requestedBy = req.authenticatedService || 'unknown-service';
    const correlationId = req.correlationId;

    return this.notificationsService.sendSms(
      sendSmsDto,
      requestedBy,
      correlationId,
    );
  }

  /**
   * Get the status of a specific job
   */
  @Get('jobs/:queue/:jobId/status')
  async getJobStatus(
    @Param('queue') queue: string,
    @Param('jobId') jobId: string,
  ): Promise<JobStatusResponseDto> {
    if (!['email', 'sms'].includes(queue)) {
      throw new NotFoundException('Invalid queue name. Must be email or sms');
    }

    const status = await this.notificationsService.getJobStatus(queue, jobId);
    
    if (!status) {
      throw new NotFoundException(`Job ${jobId} not found in ${queue} queue`);
    }

    return status;
  }

  /**
   * Get queue statistics
   */
  @Get('queues/stats')
  async getQueueStats(): Promise<QueueStatsResponseDto> {
    return this.notificationsService.getQueueStats();
  }

  /**
   * DEBUG: Get queue statistics without auth (REMOVE IN PRODUCTION)
   */
  @Get('queues/stats-debug')
  @SetMetadata('isPublic', true)
  async getQueueStatsDebug(): Promise<QueueStatsResponseDto> {
    return this.notificationsService.getQueueStats();
  }

  /**
   * DEBUG: Get failed jobs (REMOVE IN PRODUCTION)
   */
  @Get('queues/failed-debug')
  @SetMetadata('isPublic', true)
  async getFailedJobsDebug(): Promise<any> {
    return this.notificationsService.getFailedJobs();
  }

  /**
   * Health check endpoint for the notifications module
   */
  @Get('test')
  async testEndpoint(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}