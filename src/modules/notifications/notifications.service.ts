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
import { UserConnectionService } from './services/user-connection.service';

@Injectable()
export class NotificationsService extends BaseService<Notification> {
  private readonly notificationLogger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    protected readonly usersService: UsersService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly userConnectionService: UserConnectionService,
    @InjectQueue('notifications') private notificationsQueue: Queue
  ) {
    super(notificationRepo, usersService);
  }

  override async create(createDto: DeepPartial<Notification>, createdBy?: string): Promise<Notification> {
    const notification = await super.create(createDto, createdBy);

    if (this.userConnectionService.isUserOnline(notification.user.id)) {
      this.notificationsGateway.emitToUser(notification, notification.user.id);
    }

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
      if (this.userConnectionService.isUserOnline(notification.user.id)) {
        this.notificationsGateway.emitToUser(notification, notification.user.id);
      }
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
      if (!recipient.id) {
        this.notificationLogger.warn(`Recipient id is missing for recipient: ${JSON.stringify(recipient)}`);
      }
      return this.notificationRepo.create({
        ...dto,
        user: { id: recipient.id },
        read: false,
        createdBy,
      });
    });
    
    const savedNotifications = await this.notificationRepo.save(notifications);
    
    // Separate online and offline users for different processing
    const onlineNotifications: string[] = [];
    const offlineNotifications: string[] = [];
    const notificationsByUser = new Map<string, string[]>();
    
    savedNotifications.forEach(notification => {
      const userId = notification.user.id;
      
      if (!notificationsByUser.has(userId)) {
        notificationsByUser.set(userId, []);
      }
      notificationsByUser.get(userId)!.push(notification.id);
      
      // Check if user is online and emit immediately
      if (this.userConnectionService.isUserOnline(userId)) {
        this.notificationsGateway.emitToUser(notification, userId);
        onlineNotifications.push(notification.id);
      } else {
        offlineNotifications.push(notification.id);
      }
    });
    
    // Queue batch processing jobs
    for (const [userId, notificationIds] of notificationsByUser.entries()) {
      await this.notificationsQueue.add('processBatch', {
        notificationIds,
        userId,
        isUserOnline: this.userConnectionService.isUserOnline(userId)
      });
    }
    
    this.notificationLogger.log(`Processed ${onlineNotifications.length} online users, ${offlineNotifications.length} offline users`);
    
    return savedNotifications;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const count = await this.notificationRepo.count({
      where: { user: { id: userId }, read: false }
    });
    return count;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const result = await this.notificationRepo.update(
      { user: { id: userId }, read: false },
      { read: true, readAt: new Date() }
    );

    if (result.affected) {
      // Emit event to update client
      this.notificationsGateway.pingUser(userId);
      return true;
    }
    return false;
  }

  async clearAll(userId: string): Promise<boolean> {
    const result = await this.notificationRepo.softDelete({ user: { id: userId } });
    
    if (result.affected) {
      // Emit event to update client
      this.notificationsGateway.pingUser(userId);
      return true;
    }
    return false;
  }
}