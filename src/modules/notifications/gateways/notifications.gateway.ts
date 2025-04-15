import { AuthenticatedSocket, BaseGateway } from '@/common/gateways/base.gateway';
import { JwtService } from '@/modules/account-management/auth/services/jwt.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocketGateway } from '@nestjs/websockets';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Notification } from '../entities/notification.entity';
import { NotificationsService } from '../notifications.service';

// DTOs for notification events
class ReadNotificationDto {
  @Expose()
  @IsUUID()
  notificationId!: string;
}

class FetchNotificationsDto {
  @Expose()
  @IsOptional()
  @IsString()
  category?: string;
  
  @Expose()
  @Type(() => Number)
  limit: number = 20;
  
  @Expose()
  @Type(() => Number)
  page: number = 1;
}

@WebSocketGateway({ namespace: 'notifications' })
@Injectable()
export class NotificationsGateway extends BaseGateway {
  // Fulfill abstract properties from BaseGateway
  protected namespace = 'notifications';
  
  // Define event handlers map
  protected eventHandlers = new Map<string, (client: AuthenticatedSocket, payload: any) => void>([
    ['read', this.handleReadNotification.bind(this)],
    ['fetch', this.handleFetchNotifications.bind(this)],
    ['mark_all_read', this.handleMarkAllRead.bind(this)],
  ]);
  
  constructor(
    jwtService: JwtService,
    usersService: UsersService,
    configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {
    super(jwtService, usersService, configService);
  }
  
  // Override afterConnect to automatically join user-specific notification room
  protected afterConnect(client: AuthenticatedSocket): void {
    if (client.user) {
      const userRoom = `user:${client.user.email}:notifications`;
      this.joinRoom(client, userRoom);
      
      this.logger.log(`${client.user.email} subscribed to notifications`);
    }
  }
  
  // Event handlers
  // private async handleSendNotification(client: AuthenticatedSocket, payload: any): Promise<void> {
  //   if (!client.user) return;
    
  //   try {
  //     // Validate input
  //     const dto = this.validatePayload(payload, NotificationDto);
      
  //     // Create notification object
  //     const notification: Notification = {
  //       id: uuidv4(), // You'll need to import uuidv4 from 'uuid'
  //       userId: dto.recipientId,
  //       title: dto.title,
  //       message: dto.message,
  //       category: dto.category || 'user',
  //       read: false,
  //       createdAt: new Date(),
  //       updatedAt: new Date()
  //     };
      
  //     // Optional: Save to database if you want persistence
  //     await this.notificationsService.create(notification);
      
  //     // Send the notification
  //     await this.sendNotification(notification);
      
  //     // Confirm to sender
  //     client.emit('notification_sent', { 
  //       success: true,
  //       notificationId: notification.id
  //     });
      
  //   } catch (error) {
  //     this.handleError('Sending notification', error, client);
  //     client.emit('notification_sent', { 
  //       success: false,
  //       error: error instanceof Error ? error.message : 'Unknown error'
  //     });
  //   }
  // }
  
  private async handleReadNotification(client: AuthenticatedSocket, payload: any): Promise<void> {
    if (!client.user) return;
    
    try {
      const dto = this.validatePayload(payload, ReadNotificationDto);
      
      // Mark notification as read
      await this.notificationsService.markAsRead(dto.notificationId, client.user.sub);
      
      // Get updated unread count
      const count = await this.notificationsService.countUnreadByUser(client.user.sub);
      
      // Confirm to client
      client.emit('notification_read', { 
        id: dto.notificationId,
        unreadCount: count
      });
      
    } catch (error) {
      this.handleError('Reading notification', error, client);
    }
  }
  
  private async handleFetchNotifications(client: AuthenticatedSocket, payload: any): Promise<void> {
    if (!client.user) return;
    
    try {
      const dto = this.validatePayload(payload, FetchNotificationsDto);
      
    } catch (error) {
      this.handleError('Fetching notifications', error, client);
    }
  }
  
  private async handleMarkAllRead(client: AuthenticatedSocket): Promise<void> {
    if (!client.user) return;
    
    try {
      // Mark all notifications as read
      await this.notificationsService.markAllAsRead(client.user.sub);
      
      // Return updated unread count (should be 0 if all marked as read)
      const count = await this.notificationsService.countUnreadByUser(client.user.sub);
      client.emit('all_read', { unreadCount: count });
      
    } catch (error) {
      this.handleError('Marking all notifications as read', error, client);
    }
  }
  
  // Public method to send notification to a specific user
  public async sendNotification(notification: Notification): Promise<boolean> {
    if (!notification.userId) {
      this.logger.warn('Attempted to send notification without userId');
      return false;
    }
    
    // Try to emit to user's personal notification room
    const userRoom = `user:${notification.userId}:notifications`;
    this.emitToRoom(userRoom, 'notification', notification);
    
    return true;
  }
  
  public async broadcastNotification(
    notification: Omit<Notification, 'userId'>, 
    userIds: string[]
  ): Promise<void> {
    for (const userId of userIds) {
        const userRoom = `user:${userId}:notifications`;
        const userNotification = { ...notification, userId };
        this.emitToRoom(userRoom, 'notification', userNotification);
    }
  }
}