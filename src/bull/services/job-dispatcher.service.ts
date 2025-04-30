import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QueueFactoryService } from './queue-factory.service';

@Injectable()
export class JobDispatcherService {
  private readonly logger = new Logger(JobDispatcherService.name);

  constructor(private queueFactory: QueueFactoryService) {}

  @OnEvent('notification.created')
  async handleNotificationCreated(payload: any) {
    try {
      await this.queueFactory.addJob(
        'notifications', 
        'processNotification', 
        {
          notificationId: payload.id,
          userId: payload.userId
        },
        { attempts: 3 }
      );
      this.logger.log(`Queued notification job for ${payload.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to queue notification: ${errorMessage}`);
    }
  }

  // Add more event handlers for other job types
}