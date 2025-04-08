import { UsersModule } from '@/modules/account-management/users/users.module';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { Attendance } from './entities/attendance.entity';
import { WorkHourModule } from './work-hour/work-hour.module';
import { WorkTimeModule } from './work-time/work-time.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Attendance]),
        UsersModule,
        RouterModule.register([
            {
                  path: 'attendances',
                  module: AttendanceManagementModule,
                  children: [
                  {
                      path: 'work-time',
                      module: WorkTimeModule
                  },
                {
                      path: 'work-hour',
                      module: WorkHourModule
                  }
                  ]
              }
        ]),
        WorkTimeModule,
        WorkHourModule,
    ],
    providers: [AttendancesService],
    exports: [
        AttendancesService,
        WorkTimeModule,
        WorkHourModule,
    ],
    controllers: [AttendancesController],
})
export class AttendanceManagementModule {}