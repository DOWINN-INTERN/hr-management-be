import { Module } from '@nestjs/common';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationsService } from './notifications.service';

@Module({
  providers: [NotificationsService, NotificationsGateway]
})
export class NotificationsModule {}
