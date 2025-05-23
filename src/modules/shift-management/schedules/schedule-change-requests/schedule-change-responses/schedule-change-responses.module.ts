import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleChangeResponse } from './entities/schedule-change-response.entity';
import { ScheduleChangeResponsesController } from './schedule-change-responses.controller';
import { ScheduleChangeResponsesService } from './schedule-change-responses.service';
import { ScheduleChangeRequestsModule } from '../schedule-change-requests.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ScheduleChangeResponse]),
        ScheduleChangeRequestsModule,
    ],
    providers: [ScheduleChangeResponsesService],
    exports: [ScheduleChangeResponsesService],
    controllers: [ScheduleChangeResponsesController],
})
export class ScheduleChangeResponsesModule {}