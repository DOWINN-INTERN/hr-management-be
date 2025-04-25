import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
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
    private readonly notificationsGateway: NotificationsGateway
  ) {
    super(notificationRepo, usersService);
  }

  override async create(createDto: DeepPartial<Notification>, createdBy?: string): Promise<Notification> {
    const notification = await super.create(createDto, createdBy);
    this.notificationsGateway.emitToUser(notification, notification.user.id);
    return notification;
  }

  override async update(id: string, updateDto: DeepPartial<Notification>, updatedBy?: string): Promise<Notification> {
    const notification = await super.update(id, updateDto, updatedBy);
    this.notificationsGateway.emitToUser(notification, notification.user.id);
    return notification;
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
    return this.notificationRepo.save(notifications);
  }
}