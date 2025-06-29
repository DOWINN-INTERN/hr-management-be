import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountManagementModule } from '../account-management/account-management.module';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './processor/notifications.processor';
import { PushSubscriptionsModule } from './push-subscriptions/push-subscriptions.module';
import { UserConnectionService } from './services/user-connection.service';
import { WebPushService } from './services/web-push.service';

@Global()
@Module({
  imports: [
        TypeOrmModule.forFeature([Notification]),
        PushSubscriptionsModule,
        BullModule.registerQueue({
          name: 'notifications',
        }),
        RouterModule.register([
          {
            path: 'notifications',
            module: NotificationsModule,
            children: [
              {
                path: 'push',
                module: PushSubscriptionsModule,
              }
            ]
          },
        ]),
        AccountManagementModule,
    ],
  providers: [
    NotificationsService, 
    NotificationsGateway,
    NotificationsProcessor,
    WebPushService,
    UserConnectionService,
  ],
  exports: [
        NotificationsService,
        NotificationsGateway,
        PushSubscriptionsModule,
        WebPushService,
        UserConnectionService,
    ],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
