import { CutoffsModule } from '@/modules/payroll-management/cutoffs/cutoffs.module';
import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeManagementModule } from '../../employee-management/employee-management.module';
import { GroupsModule } from '../groups/groups.module';
import { HolidaysModule } from '../holidays/holidays.module';
import { Schedule } from './entities/schedule.entity';
import { ScheduleChangeRequestsModule } from './schedule-change-requests/schedule-change-requests.module';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { ScheduleGenerationProcessor, ScheduleGenerationService } from './services/schedule-generation.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Schedule]),
        BullModule.registerQueue({
            name: 'schedule-generation',
        }),
        ScheduleChangeRequestsModule,
        CutoffsModule,
        EmployeeManagementModule,
        GroupsModule,
        forwardRef(() => HolidaysModule),
    ],
    providers: [SchedulesService, ScheduleGenerationProcessor, ScheduleGenerationService],
    exports: [
        SchedulesService,
        ScheduleChangeRequestsModule,
        ScheduleGenerationProcessor,
        ScheduleGenerationService,
    ],
    controllers: [SchedulesController],
})
export class SchedulesModule {}