import { AttendanceManagementModule } from '@/modules/attendance-management/attendance-management.module';
import { BiometricsModule } from '@/modules/biometrics/biometrics.module';
import { EmployeeManagementModule } from '@/modules/employee-management/employee-management.module';
import { CutoffsModule } from '@/modules/payroll-management/cutoffs/cutoffs.module';
import { ScheduleManagementModule } from '@/modules/schedule-management/schedule-management.module';
import { Global, Module } from '@nestjs/common';
import { AttendanceListener } from './listeners/attendance.listener';
import { EmployeeGroupAssignmentListener } from './listeners/employee-group-assignement.listener';
import { CommonService } from './services/common.service';
import { TransactionService } from './services/transaction.service';

@Global()
@Module({
  imports: [CutoffsModule, ScheduleManagementModule, EmployeeManagementModule, AttendanceManagementModule, BiometricsModule],
  providers: [
    CommonService, TransactionService,
    EmployeeGroupAssignmentListener,
    AttendanceListener,
  ],
  exports: [CommonService, TransactionService, EmployeeGroupAssignmentListener],
})

export class CommonModule {}
