import { AttendanceManagementModule } from '@/modules/attendance-management/attendance-management.module';
import { BiometricsModule } from '@/modules/biometrics/biometrics.module';
import { EmployeeManagementModule } from '@/modules/employee-management/employee-management.module';
import { CutoffsModule } from '@/modules/payroll-management/cutoffs/cutoffs.module';
import { ScheduleManagementModule } from '@/modules/schedule-management/schedule-management.module';
import { Module } from '@nestjs/common';
import { UsersModule } from '../modules/account-management/users/users.module';
import { AttendanceListener } from './listeners/attendance.listener';
import { EmployeeGroupAssignmentListener } from './listeners/employee-group-assignement.listener';
import { CommonService } from './services/common.service';
import { TransactionService } from './services/transaction.service';

@Module({
  imports: [UsersModule, CutoffsModule, ScheduleManagementModule, EmployeeManagementModule, AttendanceManagementModule, BiometricsModule],
  providers: [
    CommonService, TransactionService,
    EmployeeGroupAssignmentListener,
    AttendanceListener,
  ],
  exports: [CommonService, TransactionService, EmployeeGroupAssignmentListener],
})

export class CommonModule {}
