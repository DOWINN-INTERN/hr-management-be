import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class UserConnectionService {
  private readonly logger = new Logger(UserConnectionService.name);
  // Track online users with connection timestamps
  private onlineUsers = new Map<string, Date>();

  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue
  ) {}
  
  /**
   * Mark a user as online
   */
  async userConnected(userId: string): Promise<void> {
    const wasOffline = !this.onlineUsers.has(userId);
    this.onlineUsers.set(userId, new Date());
    
    if (wasOffline) {
      this.logger.log(`User ${userId} came online`);
      
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
    if (this.onlineUsers.has(userId)) {
      this.onlineUsers.delete(userId);
      this.logger.log(`User ${userId} went offline`);
    }
  }
  
  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys());
  }

  /**
   * Get user's last seen time (when they came online)
   */
  getUserLastSeen(userId: string): Date | null {
    return this.onlineUsers.get(userId) || null;
  }

  /**
   * Get online user count
   */
  getOnlineUserCount(): number {
    return this.onlineUsers.size;
  }
}