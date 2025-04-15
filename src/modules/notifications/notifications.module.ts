import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountManagementModule } from '../account-management/account-management.module';
import { UsersModule } from '../account-management/users/users.module';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), UsersModule, ConfigModule, AccountManagementModule],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
