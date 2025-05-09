import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { DeepPartial, In, Repository } from 'typeorm';
import { NotificationDto } from './dtos/notification.dto';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './gateways/notifications.gateway';

@Injectable()
export class NotificationsService extends BaseService<Notification> {
  private readonly notificationLogger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    protected readonly usersService: UsersService,
    private readonly notificationsGateway: NotificationsGateway,
    @InjectQueue('notifications') private notificationsQueue: Queue
  ) {
    super(notificationRepo, usersService);
  }

  override async create(createDto: DeepPartial<Notification>, createdBy?: string): Promise<Notification> {
    const notification = await super.create(createDto, createdBy);

    this.notificationsGateway.emitToUser(notification, notification.user.id);

    // Queue for processing instead of immediate sending
    await this.notificationsQueue.add('processNotification', {
      notificationId: notification.id,
      userId: notification.user.id,
    });
    return notification;
  }

  override async update(id: string, updateDto: DeepPartial<Notification>, updatedBy?: string): Promise<Notification> {
    const notification = await super.update(id, updateDto, updatedBy);
    // Queue for processing if not just updating read status
    if (!updateDto.read) {
      await this.notificationsQueue.add('processNotification', {
        notificationId: notification.id,
        userId: notification.user.id,
        isUpdate: true
      });
    } else {
      // Just emit read status update via WebSocket
      this.notificationsGateway.emitToUser(notification, notification.user.id);
    }
    return notification;
  }

  async getNotificationsByIds(ids: string[]): Promise<Notification[]> {
    const notifications = await this.notificationRepo.findBy({ id: In(ids)});
    if (notifications.length !== ids.length) {
      const missingIds = ids.filter(id => !notifications.some(notification => notification.id === id));
      this.notificationLogger.warn(`Missing notifications for IDs: ${missingIds.join(', ')}`);
    }
    return notifications;
  }
  
  async createBulkNotifications(dto: NotificationDto, createdBy: string): Promise<Notification[]> {
    const notifications = dto.recipients.map(recipient => {
      // Log a warning if recipient.id is missing
      if (!recipient.id) {
        this.notificationLogger.warn(`Recipient id is missing for recipient: ${JSON.stringify(recipient)}`);
      }
      return this.notificationRepo.create({
        ...dto,
        user: { id: recipient.id }, // this should not be null if recipient.id is provided
        read: false,
        createdBy,
      });
    });
    // Save all to database
    const savedNotifications = await this.notificationRepo.save(notifications);
    
    // Group by user
    const notificationsByUser = new Map<string, string[]>();
    
    savedNotifications.forEach(notification => {
      const userId = notification.user.id;
      if (!notificationsByUser.has(userId)) {
        notificationsByUser.set(userId, []);
      }
      notificationsByUser.get(userId)!.push(notification.id);
    });
    
    // Queue batch processing jobs
    for (const [userId, notificationIds] of notificationsByUser.entries()) {
      await this.notificationsQueue.add('processBatch', {
        notificationIds,
        userId
      });
    }
    
    return savedNotifications;
  }
}