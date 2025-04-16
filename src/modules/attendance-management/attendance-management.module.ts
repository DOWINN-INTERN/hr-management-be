import { UsersModule } from '@/modules/account-management/users/users.module';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { Attendance } from './entities/attendance.entity';
import { AttendancePunchesModule } from './attendance-punches/attendance-punches.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Attendance]),
        UsersModule,
        RouterModule.register([
            {
                  path: 'attendances',
                  module: AttendanceManagementModule
              }
        ]),
        AttendancePunchesModule,
    ],
    providers: [AttendancesService],
    exports: [
        AttendancesService,
        AttendancePunchesModule,
    ],
    controllers: [AttendancesController],
})
export class AttendanceManagementModule {}