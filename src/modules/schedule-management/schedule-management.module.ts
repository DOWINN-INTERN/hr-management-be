import { Module } from '@nestjs/common';
import { SchedulesModule } from './schedules/schedules.module';
import { ShiftsModule } from './shifts/shifts.module';
import { GroupsModule } from './groups/groups.module';
import { HolidaysModule } from './holidays/holidays.module';

@Module({
  imports: [SchedulesModule, ShiftsModule, GroupsModule, HolidaysModule]
})
export class ScheduleManagementModule {}
