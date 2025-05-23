import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulesModule } from '../schedules.module';
import { AlternativeSchedule } from './entities/alternative-schedule.entity';
import { ScheduleChangeRequest } from './entities/schedule-change-request.entity';
import { ScheduleChangeListener } from './listener/schedule-change.listener';
import { ScheduleChangeRequestsController } from './schedule-change-requests.controller';
import { ScheduleChangeRequestsService } from './schedule-change-requests.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ScheduleChangeRequest, AlternativeSchedule]),
        forwardRef(() => SchedulesModule),
    ],
    providers: [ScheduleChangeRequestsService, ScheduleChangeListener],
    exports: [
        ScheduleChangeRequestsService,
    ],
    controllers: [ScheduleChangeRequestsController],
})
export class ScheduleChangeRequestsModule {}