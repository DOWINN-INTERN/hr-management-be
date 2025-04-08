import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AccountManagementModule } from './modules/account-management/account-management.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AttendanceManagementModule } from './modules/attendance-management/attendance-management.module';
import { BiometricsModule } from './modules/biometrics/biometrics.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EmployeeManagementModule } from './modules/employee-management/employee-management.module';
import { FilesModule } from './modules/files/files.module';
import { LogsModule } from './modules/logs/logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrganizationManagementModule } from './modules/organization-management/organization-management.module';
import { ScheduleManagementModule } from './modules/schedule-management/schedule-management.module';
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
    AttendanceManagementModule,
    ScheduleManagementModule,
    AddressesModule,
    DocumentsModule,
    BiometricsModule,
  ],
  controllers: [],
})
export class AppModule {}