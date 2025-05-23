import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinalWorkHoursModule } from '../attendance-management/final-work-hours/final-work-hours.module';
import { WorkTimeRequestsModule } from '../attendance-management/work-time-requests/work-time-requests.module';
import { EmployeeManagementModule } from '../employee-management/employee-management.module';
import { CutoffsModule } from './cutoffs/cutoffs.module';
import { Payroll } from './entities/payroll.entity';
import { PayrollItemTypesModule } from './payroll-item-types/payroll-item-types.module';
import { PayrollItemsModule } from './payroll-items/payroll-items.module';
import { PayrollsController } from './payrolls.controller';
import { PayrollsService } from './payrolls.service';
import { PayrollMetricsService } from './services/payroll-metrics.service';
import { PayrollProcessorService } from './services/payroll-processor.service';
import { PayrollStateMachine } from './services/payroll-state-machine.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Payroll]),
        BullModule.registerQueue({
            name: 'payroll-processing',
        }),
        RouterModule.register([
            {
                  path: 'payrolls',
                  module: PayrollManagementModule,
                  children: [
                    {
                        path: 'payroll-items',
                        module: PayrollItemsModule
                    },
                    {
                        path: 'payroll-item-types',
                        module: PayrollItemTypesModule
                    },
                    {
                        path: 'cutoffs',
                        module: CutoffsModule
                    }
                  ]
              }
        ]),
        PayrollItemsModule,
        PayrollItemTypesModule,
        CutoffsModule,
        EmployeeManagementModule,
        forwardRef(() => FinalWorkHoursModule),
        WorkTimeRequestsModule,
    ],
    providers: [PayrollsService, PayrollStateMachine, PayrollProcessorService, PayrollMetricsService],
    exports: [
        PayrollsService,
        PayrollItemsModule,
        PayrollItemTypesModule,
        CutoffsModule,
    ],
    controllers: [PayrollsController],
})
export class PayrollManagementModule {}