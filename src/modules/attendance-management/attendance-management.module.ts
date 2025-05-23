import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiometricsModule } from '../biometrics/biometrics.module';
import { EmployeeManagementModule } from '../employee-management/employee-management.module';
import { SchedulesModule } from '../shift-management/schedules/schedules.module';
import { AttendanceConfigurationsModule } from './attendance-configurations/attendance-configurations.module';
import { AttendancePunchesModule } from './attendance-punches/attendance-punches.module';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { Attendance } from './entities/attendance.entity';
import { FinalWorkHoursModule } from './final-work-hours/final-work-hours.module';
import { AttendancesGateway } from './gateways/attendances.gateway';
import { AttendanceListener } from './listeners/attendance.listener';
import { AttendanceDataSeederService } from './services/attendance-data-seeder.service';
import { WorkTimeRequestsModule } from './work-time-requests/work-time-requests.module';
import { WorkTimeResponsesModule } from './work-time-requests/work-time-responses/work-time-responses.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Attendance]),
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
                    },
                    {
                        path: 'configurations',
                        module: AttendanceConfigurationsModule
                    }
                ],
            }
        ]),
        AttendancePunchesModule,
        WorkTimeRequestsModule,
        FinalWorkHoursModule,
        AttendanceConfigurationsModule,
        EmployeeManagementModule,
        SchedulesModule,
        BiometricsModule
    ],
    providers: [AttendancesService, AttendanceListener, AttendanceDataSeederService, AttendancesGateway],
    exports: [
        AttendancesService,
        AttendancePunchesModule,
        WorkTimeRequestsModule,
        FinalWorkHoursModule,
        AttendanceConfigurationsModule
    ],
    controllers: [AttendancesController],
})
export class AttendanceManagementModule {}