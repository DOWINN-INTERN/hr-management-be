import { UsersModule } from '@/modules/account-management/users/users.module';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { GroupsModule } from './groups/groups.module';
import { ShiftsModule } from './shifts/shifts.module';
import { HolidaysModule } from './holidays/holidays.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Schedule]),
        UsersModule,
        RouterModule.register([
            {
                  path: 'schedules',
                  module: SchedulesModule,
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
export class SchedulesModule {}