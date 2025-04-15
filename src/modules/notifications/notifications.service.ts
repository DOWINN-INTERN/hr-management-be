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
  
  async createBulkNotifications(dto: NotificationDto): Promise<Notification[]> {
    throw new NotImplementedException('Method not implemented');
  }

//   private getDefaultNotificationPreferences(): NotificationPreferenceDto {
//     return {
//       enabled: true,
//       emailEnabled: true,
//       pushEnabled: true,
//       categories: {},
//     };
//   }
}