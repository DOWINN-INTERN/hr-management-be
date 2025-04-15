import { CutoffsModule } from '@/modules/payroll-management/cutoffs/cutoffs.module';
import { ScheduleManagementModule } from '@/modules/schedule-management/schedule-management.module';
import { Module } from '@nestjs/common';
import { UsersModule } from '../modules/account-management/users/users.module';
import { EmployeeGroupAssignmentListener } from './listeners/employee-group-assignement.listener';
import { CommonService } from './services/common.service';
import { TransactionService } from './services/transaction.service';

@Module({
  imports: [UsersModule, CutoffsModule, ScheduleManagementModule],
  providers: [
    CommonService, TransactionService,
    EmployeeGroupAssignmentListener
  ],
  exports: [CommonService, TransactionService, EmployeeGroupAssignmentListener],
})

export class CommonModule {}
