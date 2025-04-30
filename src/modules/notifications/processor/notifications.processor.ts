import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import { NotificationsService } from '../notifications.service';
import { PushSubscriptionsService } from '../push-subscriptions/push-subscriptions.service';
import { UserConnectionService } from '../services/user-connection.service';
import { WebPushService } from '../services/web-push.service';

@Injectable()
@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);
  
  // Rate limiting cache by user
  private readonly userRateLimits = new Map<string, {
    count: number;
    lastReset: Date;
    pendingIds: string[];
  }>();
  
  // Maximum notifications per minute
  private readonly MAX_NOTIFICATIONS_PER_MINUTE = 10;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly webPushService: WebPushService,
    private readonly pushSubscriptionService: PushSubscriptionsService,
    private readonly userConnectionService: UserConnectionService
  ) {}

  @Process('processNotification')
  async handleProcessNotification(job: Job<{ notificationId: string; userId: string; isUpdate?: boolean }>) {
    const { notificationId, userId, isUpdate } = job.data;
    
    try {
      // Check rate limiting
      if (this.isRateLimited(userId, notificationId)) {
        this.logger.debug(`Rate limited notification ${notificationId} for user ${userId}`);
        return;
      }
      
      const notification = await this.notificationsService.findOneByOrFail({ id: notificationId });
      
      // Check if user is online
      const isUserOnline = this.userConnectionService.isUserOnline(userId);
      
      if (isUserOnline) {
        // Send via WebSocket
        this.notificationsGateway.emitToUser(notification, userId);
        this.logger.debug(`Sent notification ${notificationId} to online user ${userId} via WebSocket`);
      } else {
        // User is offline, send via Web Push
        await this.sendPushNotification(userId, notification);
      }
      return { success: true }
    } catch (error: any) {
      this.logger.error(`Failed to process notification ${notificationId}: ${error.message}`);
      throw error; // Let Bull retry
    }
  }

  @Process('processBatch')
  async handleProcessBatch(job: Job<{ notificationIds: string[]; userId: string }>) {
    const { notificationIds, userId } = job.data;
    
    try {
      // Apply rate limiting
      const allowedIds = this.applyBatchRateLimit(userId, notificationIds);
      if (allowedIds.length === 0) {
        this.logger.debug(`All notifications rate limited for user ${userId}`);
        return;
      }
      
      // Get notifications from database
      const notifications = await this.notificationsService.getNotificationsByIds(allowedIds);
      if (notifications.length === 0) {
        this.logger.warn(`No notifications found for batch`);
        return;
      }
      
      // Check if user is online
      const isUserOnline = this.userConnectionService.isUserOnline(userId);
      
      if (isUserOnline) {
        // Send via WebSocket
        this.notificationsGateway.pingUser(userId);
        this.logger.debug(`Sent batch of ${notifications.length} notifications via WebSocket`);
      } else {
        // User is offline, send as grouped push notification if possible
        if (notifications.length === 1) {
          // Single notification
          await this.sendPushNotification(userId, notifications[0]);
        } else {
          // Group notifications
          await this.sendGroupedPushNotification(userId, notifications);
        }
      }
    } catch (error: any) {
      this.logger.error(`Failed to process batch notifications: ${error.message}`);
      throw error; // Let Bull retry
    }
  }
  
//   @Process('processUserOnline')
//   async handleUserOnline(job: Job<{ userId: string }>) {
//     const { userId } = job.data;
    
//     try {
//       // Reset rate limiting for this user
//       this.resetRateLimit(userId);
      
//       // Get recent unread notifications (limited to reasonable number)
//       const unreadNotifications = await this.notificationsService.getUnreadNotificationsForUser(userId, 15);
      
//       if (unreadNotifications.length > 0) {
//         // Send batch to user
//         this.notificationsGateway.emitBatchToUser(unreadNotifications, userId);
//         this.logger.debug(`Sent ${unreadNotifications.length} unread notifications to user ${userId} who just came online`);
//       }
//     } catch (error: any) {
//       this.logger.error(`Failed to process user online event: ${error.message}`);
//     }
//   }
  
  /**
   * Send a push notification
   */
  private async sendPushNotification(userId: string, notification: any): Promise<void> {
    // Get user's push subscriptions
    const subscriptions = await this.pushSubscriptionService.getUserSubscriptions(userId);
    
    if (!subscriptions || subscriptions.length === 0) {
      this.logger.debug(`No push subscriptions found for user ${userId}`);
      return;
    }
    
    // Format payload for Web Push
    const payload = {
      title: notification.title,
      body: notification.body,
      icon: '/assets/icons/icon-192x192.png', // Customize with your app's icon
      badge: '/assets/icons/badge-72x72.png',  // Customize with your app's badge
      data: {
        notificationId: notification.id,
        url: notification.url || '/',
        type: notification.type,
        createdAt: notification.createdAt
      },
      actions: this.getNotificationActions(notification)
    };
    
    // Send to all user subscriptions
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        
        await this.webPushService.sendPushNotification(subscription, payload);
      } catch (error: any) {
        if (error.code === 'SUBSCRIPTION_EXPIRED') {
          // Remove expired subscription
          await this.pushSubscriptionService.removeExpiredSubscription(sub.endpoint);
        } else {
          this.logger.error(`Failed to send to subscription: ${error.message}`);
        }
      }
    });
    
    await Promise.all(sendPromises);
  }
  
  /**
   * Send grouped push notification
   */
  private async sendGroupedPushNotification(userId: string, notifications: any[]): Promise<void> {
    const subscriptions = await this.pushSubscriptionService.getUserSubscriptions(userId);
    
    if (!subscriptions || subscriptions.length === 0) {
      return;
    }
    
    // Group by type if available
    const typeGroups = new Map<string, any[]>();
    notifications.forEach(notification => {
      const type = notification.type || 'general';
      if (!typeGroups.has(type)) {
        typeGroups.set(type, []);
      }
      typeGroups.get(type)!.push(notification);
    });
    
    // For each type, send a grouped notification
    for (const [type, items] of typeGroups.entries()) {
      if (items.length === 1) {
        // Just one notification of this type, send normally
        await this.sendPushNotification(userId, items[0]);
        continue;
      }
      
      // Create a grouped notification
      const payload = {
        title: `${items.length} new ${type} notifications`,
        body: items.length > 3 
          ? `${items[0].body.substring(0, 30)}... and ${items.length - 1} more` 
          : items.map(n => n.body.substring(0, 30)).join('\n'),
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        data: {
          notificationIds: items.map(n => n.id),
          url: '/notifications',
          type,
          count: items.length
        },
        actions: [
          { action: 'view', title: 'View All' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      };
      
      // Send to all subscriptions
      const sendPromises = subscriptions.map(async (sub) => {
        try {
          const subscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          };
          
          await this.webPushService.sendPushNotification(subscription, payload);
        } catch (error: any) {
          if (error.code === 'SUBSCRIPTION_EXPIRED') {
            await this.pushSubscriptionService.removeExpiredSubscription(sub.endpoint);
          }
        }
      });
      
      await Promise.all(sendPromises);
    }
  }
  
  /**
   * Get appropriate actions based on notification type
   */
  private getNotificationActions(notification: any): { action: string; title: string; icon?: string }[] {
    // Default actions
    const actions = [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ];
    
    // Add custom actions based on notification type
    switch (notification.type) {
      case 'comment':
        actions.push({ action: 'reply', title: 'Reply' });
        break;
      case 'message':
        actions.push({ action: 'reply', title: 'Reply' });
        break;
      case 'task':
        actions.push({ action: 'complete', title: 'Complete' });
        break;
    }
    
    return actions.slice(0, 2); // Most browsers only support 2 actions
  }
  
  /**
   * Check if notification should be rate limited
   */
  private isRateLimited(userId: string, notificationId: string): boolean {
    const now = new Date();
    
    if (!this.userRateLimits.has(userId)) {
      this.userRateLimits.set(userId, {
        count: 1,
        lastReset: now,
        pendingIds: []
      });
      return false;
    }
    
    const userLimit = this.userRateLimits.get(userId)!;
    
    // Reset if it's been over a minute
    if (now.getTime() - userLimit.lastReset.getTime() > 60000) {
      userLimit.count = 1;
      userLimit.lastReset = now;
      userLimit.pendingIds = [];
      return false;
    }
    
    // Check if under limit
    if (userLimit.count < this.MAX_NOTIFICATIONS_PER_MINUTE) {
      userLimit.count++;
      return false;
    }
    
    // Rate limited - store for later
    userLimit.pendingIds.push(notificationId);
    return true;
  }
  
  /**
   * Apply rate limiting to a batch of notifications
   */
  private applyBatchRateLimit(userId: string, notificationIds: string[]): string[] {
    const now = new Date();
    
    if (!this.userRateLimits.has(userId)) {
      this.userRateLimits.set(userId, {
        count: 0,
        lastReset: now,
        pendingIds: []
      });
    }
    
    const userLimit = this.userRateLimits.get(userId)!;
    
    // Reset if it's been over a minute
    if (now.getTime() - userLimit.lastReset.getTime() > 60000) {
      userLimit.count = 0;
      userLimit.lastReset = now;
      userLimit.pendingIds = [];
    }
    
    // How many can we send now?
    const available = this.MAX_NOTIFICATIONS_PER_MINUTE - userLimit.count;
    
    if (available <= 0) {
      // Rate limit all
      userLimit.pendingIds.push(...notificationIds);
      return [];
    }
    
    if (notificationIds.length <= available) {
      // Can send all
      userLimit.count += notificationIds.length;
      return notificationIds;
    }
    
    // Send what we can, queue the rest
    const toSend = notificationIds.slice(0, available);
    const toQueue = notificationIds.slice(available);
    
    userLimit.count += toSend.length;
    userLimit.pendingIds.push(...toQueue);
    
    return toSend;
  }
  
  /**
   * Reset rate limit for a user
   */
  private resetRateLimit(userId: string): void {
    this.userRateLimits.delete(userId);
  }
}