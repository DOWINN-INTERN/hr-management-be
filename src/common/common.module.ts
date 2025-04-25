import { EmployeeManagementModule } from '@/modules/employee-management/employee-management.module';
import { CutoffsModule } from '@/modules/payroll-management/cutoffs/cutoffs.module';
import { ShiftManagementModule } from '@/modules/shift-management/shift-management.module';
import { Global, Module } from '@nestjs/common';
import { EmployeeGroupAssignmentListener } from './listeners/employee-group-assignement.listener';
import { CommonService } from './services/common.service';
import { TransactionService } from './services/transaction.service';

@Global()
@Module({
  imports: [CutoffsModule, ShiftManagementModule, EmployeeManagementModule],
  providers: [
    CommonService, TransactionService,
    EmployeeGroupAssignmentListener,
  ],
  exports: [CommonService, TransactionService, EmployeeGroupAssignmentListener],
})

export class CommonModule {}
