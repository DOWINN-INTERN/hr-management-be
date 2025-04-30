import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { PushSubscriptionsController } from './push-subscriptions.controller';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { PushSubscription } from './entities/push-subscription.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([PushSubscription]),

    ],
    providers: [PushSubscriptionsService],
    exports: [PushSubscriptionsService],
    controllers: [PushSubscriptionsController],
})
export class PushSubscriptionsModule {}