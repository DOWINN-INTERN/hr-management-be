import { CutoffsModule } from '@/modules/payroll-management/cutoffs/cutoffs.module';
import { PayrollManagementModule } from '@/modules/payroll-management/payroll-management.module';
import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceConfigurationsModule } from '../attendance-configurations/attendance-configurations.module';
import { AttendanceManagementModule } from '../attendance-management.module';
import { FinalWorkHour } from './entities/final-work-hour.entity';
import { FinalWorkHoursController } from './final-work-hours.controller';
import { FinalWorkHoursService } from './final-work-hours.service';
import { WorkHourCalculationProcessor, WorkHourCalculationService } from './services/work-hour-calculation.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([FinalWorkHour]),
        BullModule.registerQueue({
            name: 'work-hour-calculation'
        }),
        CutoffsModule,
        forwardRef(() => AttendanceManagementModule),
        PayrollManagementModule,
        AttendanceConfigurationsModule,
    ],
    providers: [FinalWorkHoursService, WorkHourCalculationService, WorkHourCalculationProcessor],
    exports: [FinalWorkHoursService, WorkHourCalculationService, WorkHourCalculationProcessor],
    controllers: [FinalWorkHoursController],
})
export class FinalWorkHoursModule {}