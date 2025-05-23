import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AccountManagementModule } from './modules/account-management/account-management.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AttendanceManagementModule } from './modules/attendance-management/attendance-management.module';
import { BiometricsModule } from './modules/biometrics/biometrics.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EmailsModule } from './modules/emails/emails.module';
import { EmployeeManagementModule } from './modules/employee-management/employee-management.module';
import { FilesModule } from './modules/files/files.module';
import { LogsModule } from './modules/logs/logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrganizationManagementModule } from './modules/organization-management/organization-management.module';
import { PayrollManagementModule } from './modules/payroll-management/payroll-management.module';
import { ShiftManagementModule } from './modules/shift-management/shift-management.module';
import { MemorandumsModule } from './modules/memorandums/memorandums.module';
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
    ShiftManagementModule,
    AddressesModule,
    DocumentsModule,
    BiometricsModule,
    PayrollManagementModule,
    EmailsModule,
    MemorandumsModule,
  ],
  controllers: [],
})
export class AppModule {}