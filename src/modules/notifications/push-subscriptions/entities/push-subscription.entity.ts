import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('push-subscriptions')
export class PushSubscription extends BaseEntity<PushSubscription> {
    @Column({ unique: true })
    endpoint!: string;
    
    @Column()
    p256dh!: string;
    
    @Column()
    auth!: string;
}