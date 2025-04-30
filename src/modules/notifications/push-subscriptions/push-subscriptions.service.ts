import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushSubscription } from './entities/push-subscription.entity';

@Injectable()
export class PushSubscriptionsService extends BaseService<PushSubscription> {
    constructor(
        @InjectRepository(PushSubscription)
        private readonly pushSubscriptionsRepository: Repository<PushSubscription>,
        protected readonly usersService: UsersService
    ) {
        super(pushSubscriptionsRepository, usersService);
    }

    /**
     * Save a new push subscription for a user
     */
    async saveSubscription(userId: string, subscription: any): Promise<PushSubscription> {
        // First check if already exists
        const existing = await this.pushSubscriptionsRepository.findOne({
        where: {
            endpoint: subscription.endpoint,
            userId
        }
        });
        
        if (existing) {
        // Update keys if needed
        existing.p256dh = subscription.keys.p256dh;
        existing.auth = subscription.keys.auth;
        return this.pushSubscriptionsRepository.save(existing);
        }
        
        // Create new subscription
        const newSubscription = this.pushSubscriptionsRepository.create({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
        });
        
        return this.pushSubscriptionsRepository.save(newSubscription);
    }
    
    /**
     * Remove a subscription
     */
    async removeSubscription(userId: string, endpoint: string): Promise<void> {
        await this.pushSubscriptionsRepository.delete({
        userId,
        endpoint
        });
    }
    
    /**
     * Get all subscriptions for a user
     */
    async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
        return this.pushSubscriptionsRepository.find({
        where: { userId }
        });
    }
    
    /**
     * Remove expired subscription
     */
    async removeExpiredSubscription(endpoint: string): Promise<void> {
        await this.pushSubscriptionsRepository.delete({ endpoint });
        this.logger.debug(`Removed expired subscription: ${endpoint}`);
    }
}