import { EmployeeManagementModule } from '@/modules/employee-management/employee-management.module';
import { CutoffsModule } from '@/modules/payroll-management/cutoffs/cutoffs.module';
import { ShiftManagementModule } from '@/modules/shift-management/shift-management.module';
import { Global, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { PdfUtilsController } from './controllers/html-to-pdf.controller';
import { EmployeeGroupAssignmentListener } from './listeners/employee-group-assignement.listener';
import { CommonService } from './services/common.service';
import { HtmlToPdfService } from './services/html-to-pdf.service';
import { TransactionService } from './services/transaction.service';

@Global()
@Module({
  imports: [CutoffsModule, ShiftManagementModule, EmployeeManagementModule,
      RouterModule.register([
      {
        path: 'common',
        module: CommonModule
      }
    ])
  ],
  providers: [
    CommonService, TransactionService,
    EmployeeGroupAssignmentListener,
    HtmlToPdfService,
  ],
  controllers: [PdfUtilsController],
  exports: [CommonService, TransactionService, EmployeeGroupAssignmentListener, HtmlToPdfService],
})

export class CommonModule {}
