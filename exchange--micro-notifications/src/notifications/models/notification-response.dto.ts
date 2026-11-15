export class NotificationResponseDto {
  job_id: string;
  status: 'enqueued';
  message: string;
}

export class JobStatusResponseDto {
  id: string;
  status: string;
  progress: number;
  attempts: number;
  maxAttempts: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
}

export class QueueStatsResponseDto {
  email: QueueCountsDto;
  sms: QueueCountsDto;
}

export class QueueCountsDto {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}