import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleChangeRequest } from './entities/schedule-change-request.entity';
import { ScheduleChangeRequestsController } from './schedule-change-requests.controller';
import { ScheduleChangeRequestsService } from './schedule-change-requests.service';
import { ScheduleChangeResponsesModule } from './schedule-change-responses/schedule-change-responses.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ScheduleChangeRequest]),
        ScheduleChangeResponsesModule,
    ],
    providers: [ScheduleChangeRequestsService],
    exports: [
        ScheduleChangeRequestsService,
        ScheduleChangeResponsesModule,
    ],
    controllers: [ScheduleChangeRequestsController],
})
export class ScheduleChangeRequestsModule {}