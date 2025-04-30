import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class UserConnectionService {
  // Track online users
  private onlineUsers = new Set<string>();

  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue
  ) {}
  
  /**
   * Mark a user as online
   */
  async userConnected(userId: string): Promise<void> {
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.add(userId);
      
      // Queue job to send unread notifications
      await this.notificationsQueue.add('handleUserOnline', {
        userId
      }, { 
        delay: 1000 // small delay to ensure connection is stable
      });
    }
  }
  
  /**
   * Mark a user as offline
   */
  userDisconnected(userId: string): void {
    this.onlineUsers.delete(userId);
  }
  
  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}