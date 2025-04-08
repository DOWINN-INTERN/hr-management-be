import { UsersModule } from '@/modules/account-management/users/users.module';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { GroupsModule } from './groups/groups.module';
import { HolidaysModule } from './holidays/holidays.module';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { ShiftsModule } from './shifts/shifts.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Schedule]),
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
                    }
                ]
            }
        ]),
        GroupsModule,
        ShiftsModule,
        HolidaysModule,
    ],
    providers: [SchedulesService],
    exports: [
        SchedulesService,
        GroupsModule,
        ShiftsModule,
        HolidaysModule,
    ],
    controllers: [SchedulesController],
})
export class ScheduleManagementModule {}