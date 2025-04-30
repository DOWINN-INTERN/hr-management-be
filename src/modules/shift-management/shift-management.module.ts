import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CutoffsModule } from '../payroll-management/cutoffs/cutoffs.module';
import { ShiftDay } from './entities/shift-day.entity';
import { Shift } from './entities/shift.entity';
import { GroupsModule } from './groups/groups.module';
import { HolidaysModule } from './holidays/holidays.module';
import { ScheduleChangeRequestsModule } from './schedules/schedule-change-requests/schedule-change-requests.module';
import { ScheduleChangeResponsesModule } from './schedules/schedule-change-requests/schedule-change-responses/schedule-change-responses.module';
import { SchedulesModule } from './schedules/schedules.module';
import { DefaultShiftsSeeder } from './services/default-shift-seeder.service';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Shift, ShiftDay]),
        RouterModule.register([
            {
                path: 'shifts',
                module: ShiftManagementModule,
                children: [
                    {
                        path: 'schedules',
                        module: SchedulesModule,
                        children: [
                            {
                                path: 'requests',
                                module: ScheduleChangeRequestsModule,
                                children: [
                                    {
                                        path: 'responses',
                                        module: ScheduleChangeResponsesModule,
                                    }
                                ]
                            },
                        ]
                    },
                    {
                        path: 'groups',
                        module: GroupsModule
                    },
                ]
            },
            {
                path: 'holiday',
                module: HolidaysModule,
            }
        ]),
        HolidaysModule,
        SchedulesModule,
        GroupsModule,
        CutoffsModule,
    ],
    providers: [ShiftsService, DefaultShiftsSeeder],
    exports: [
        ShiftsService,
        HolidaysModule,
        SchedulesModule,
        GroupsModule,
    ],
    controllers: [ShiftsController],
})
export class ShiftManagementModule {}