import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AccountManagementModule } from './modules/account-management/account-management.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EmployeeManagementModule } from './modules/employee-management/employee-management.module';
import { FilesModule } from './modules/files/files.module';
import { LogsModule } from './modules/logs/logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrganizationManagementModule } from './modules/organization-management/organization-management.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CommonModule,
    LogsModule,
    FilesModule,
    NotificationsModule,
    DocumentsModule,
    EmployeeManagementModule,
    AccountManagementModule,
    OrganizationManagementModule,
    AddressesModule,
    DocumentsModule,
    SchedulesModule,
  ],
  controllers: [],
})
export class AppModule {}