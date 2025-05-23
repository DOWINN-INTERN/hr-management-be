import { DocumentsModule } from '@/modules/documents/documents.module';
import { EmployeeManagementModule } from '@/modules/employee-management/employee-management.module';
import { ShiftManagementModule } from '@/modules/shift-management/shift-management.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceConfigurationsModule } from '../attendance-configurations/attendance-configurations.module';
import { FinalWorkHoursModule } from '../final-work-hours/final-work-hours.module';
import { WorkTimeRequest } from './entities/work-time-request.entity';
import { WorkTimeListener } from './listener/work-time.listener';
import { WorkTimeRequestsController } from './work-time-requests.controller';
import { WorkTimeRequestsService } from './work-time-requests.service';
import { WorkTimeResponsesModule } from './work-time-responses/work-time-responses.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkTimeRequest]),
        forwardRef(() => FinalWorkHoursModule),
        DocumentsModule,
        EmployeeManagementModule,
        ShiftManagementModule,
        AttendanceConfigurationsModule,
        WorkTimeResponsesModule,
    ],
    providers: [WorkTimeRequestsService, WorkTimeListener],
    exports: [
        WorkTimeRequestsService,
        WorkTimeResponsesModule,
    ],
    controllers: [WorkTimeRequestsController],
})
export class WorkTimeRequestsModule {}