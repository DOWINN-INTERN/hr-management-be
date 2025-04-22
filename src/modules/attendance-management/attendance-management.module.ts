import { UsersModule } from '@/modules/account-management/users/users.module';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancePunchesModule } from './attendance-punches/attendance-punches.module';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { Attendance } from './entities/attendance.entity';
import { FinalWorkHoursModule } from './final-work-hours/final-work-hours.module';
import { WorkTimeRequestsModule } from './work-time-requests/work-time-requests.module';
import { WorkTimeResponsesModule } from './work-time-requests/work-time-responses/work-time-responses.module';

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
                        path: 'punches',
                        module: AttendancePunchesModule,
                    },
                    {
                        path: 'work-time-requests',
                        module: WorkTimeRequestsModule,
                        children: [
                            {
                                path: 'responses',
                                module: WorkTimeResponsesModule,
                            }
                        ]
                    },
                    {
                        path: 'final-work-hours',
                        module: FinalWorkHoursModule,
                    }
                ],
            }
        ]),
        AttendancePunchesModule,
        WorkTimeRequestsModule,
        WorkTimeResponsesModule,
        FinalWorkHoursModule,
    ],
    providers: [AttendancesService],
    exports: [
        AttendancesService,
        AttendancePunchesModule,
        WorkTimeRequestsModule,
        WorkTimeResponsesModule,
        FinalWorkHoursModule,
    ],
    controllers: [AttendancesController],
})
export class AttendanceManagementModule {}