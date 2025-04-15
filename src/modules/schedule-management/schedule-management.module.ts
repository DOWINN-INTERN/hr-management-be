import { UsersModule } from '@/modules/account-management/users/users.module';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeManagementModule } from '../employee-management/employee-management.module';
import { CutoffsModule } from '../payroll-management/cutoffs/cutoffs.module';
import { Schedule } from './entities/schedule.entity';
import { GroupsModule } from './groups/groups.module';
import { HolidaysModule } from './holidays/holidays.module';
import { ScheduleChangeRequestsModule } from './schedule-change-requests/schedule-change-requests.module';
import { ScheduleChangeResponsesModule } from './schedule-change-requests/schedule-change-responses/schedule-change-responses.module';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { DefaultShiftsSeeder } from './services/default-shift-seeder.service';
import { ScheduleGenerationProcessor, ScheduleGenerationService } from './services/schedule-generation.service';
import { ShiftsModule } from './shifts/shifts.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Schedule]),
        BullModule.registerQueue({
            name: 'schedule-generation',
        }),
        UsersModule,
        RouterModule.register([
            {
                  path: 'schedules',
                  module: ScheduleManagementModule,
                  children: [
                    {
                        path: 'groups',
                        module: GroupsModule
                    },
                    {
                        path: 'shifts',
                        module: ShiftsModule
                    },
                    {
                        path: 'holidays',
                        module: HolidaysModule
                    },
                    {
                        path: 'schedule-change-requests',
                        module: ScheduleChangeRequestsModule,
                        children: [
                            {
                                path: 'schedule-change-responses',
                                module: ScheduleChangeResponsesModule,
                            }
                        ]
                    }
                  ]
              }
        ]),
        GroupsModule,
        ShiftsModule,
        HolidaysModule,
        ScheduleChangeRequestsModule,
        ScheduleChangeResponsesModule,
        EmployeeManagementModule,
        CutoffsModule
    ],
    providers: [SchedulesService, DefaultShiftsSeeder, ScheduleGenerationProcessor, ScheduleGenerationService],
    exports: [
        SchedulesService,
        ScheduleGenerationService,
        GroupsModule,
        ShiftsModule,
        HolidaysModule,
        ScheduleChangeRequestsModule,
        ScheduleChangeResponsesModule,
    ],
    controllers: [SchedulesController],
})
export class ScheduleManagementModule {}