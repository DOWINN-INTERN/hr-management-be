import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { NotificationDto } from './dtos/notification.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService extends BaseService<Notification> {
  private readonly notificationLogger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    protected readonly usersService: UsersService,
  ) {
    super(notificationRepo, usersService);
  }

  async countUnreadByUser(userId: string): Promise<number> {
    throw new NotImplementedException('Method not implemented');
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.update(notificationId, {
      read: true,
      readAt: new Date()
    } as DeepPartial<Notification>, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    throw new NotImplementedException('Method not implemented');
  }
  
  async createBulkNotifications(dto: NotificationDto, createdBy: string): Promise<Notification[]> {
    const notifications = dto.recipients.map(recipient => {
      // Log a warning if recipient.id is missing
      if (!recipient.id) {
        this.notificationLogger.warn(`Recipient id is missing for recipient: ${JSON.stringify(recipient)}`);
      }
      return this.notificationRepo.create({
        ...dto,
        targetId: recipient.id, // this should not be null if recipient.id is provided
        read: false,
        createdBy,
      });
    });
    return this.notificationRepo.save(notifications);
  }
}