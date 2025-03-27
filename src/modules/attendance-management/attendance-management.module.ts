import { Module } from '@nestjs/common';
import { AttendancesModule } from './attendances/attendances.module';
import { WorkHoursModule } from './work-hours/work-hours.module';

@Module({
  imports: [AttendancesModule, WorkHoursModule]
})
export class AttendanceManagementModule {}
