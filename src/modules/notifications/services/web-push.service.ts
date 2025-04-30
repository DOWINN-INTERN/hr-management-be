import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webPush from 'web-push';

@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);
  private initialized = false;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  private initialize(): void {
    try {
      const publicKey = this.configService.get<string>('WEB_PUSH_PUBLIC_KEY');
      const privateKey = this.configService.get<string>('WEB_PUSH_PRIVATE_KEY');
      
      if (!publicKey || !privateKey) {
        this.logger.warn('Web Push keys not configured. Run: npx web-push generate-vapid-keys');
        return;
      }
      
      // Set VAPID details
      webPush.setVapidDetails(
        `mailto:${this.configService.getOrThrow<string>('WEB_PUSH_CONTACT_EMAIL')}`,
        publicKey,
        privateKey
      );
      
      this.initialized = true;
      this.logger.log('Web Push initialized');
    } catch (error: any) {
      this.logger.error(`Failed to initialize Web Push: ${error.message}`);
    }
  }
  
  /**
   * Send push notification to a subscription
   */
  async sendPushNotification(
    subscription: webPush.PushSubscription,
    payload: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      data?: any;
      actions?: { action: string; title: string; icon?: string }[];
    }
  ): Promise<boolean> {
    if (!this.initialized) {
      this.logger.warn('Web Push not initialized, skipping notification');
      return false;
    }
    
    try {
      await webPush.sendNotification(
        subscription,
        JSON.stringify(payload)
      );
      return true;
    } catch (error: any) {
      // Check for specific errors
      if (error.statusCode === 410) {
        this.logger.warn(`Subscription has expired or been unsubscribed: ${error.message}`);
        // Return an identifier so we know to remove this subscription
        throw { code: 'SUBSCRIPTION_EXPIRED', subscription };
      }
      
      this.logger.error(`Failed to send push notification: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Generate VAPID keys (for initial setup)
   */
  generateVapidKeys(): { publicKey: string; privateKey: string } {
    return webPush.generateVAPIDKeys();
  }
  
  /**
   * Get public key for clients to use
   */
  getPublicKey(): string {
    return this.configService.get<string>('WEB_PUSH_PUBLIC_KEY', '');
  }
}