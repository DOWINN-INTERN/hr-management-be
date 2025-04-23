import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleChangeRequest } from './entities/schedule-change-request.entity';
import { ScheduleChangeRequestsController } from './schedule-change-requests.controller';
import { ScheduleChangeRequestsService } from './schedule-change-requests.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ScheduleChangeRequest]),
    ],
    providers: [ScheduleChangeRequestsService],
    exports: [
        ScheduleChangeRequestsService,
    ],
    controllers: [ScheduleChangeRequestsController],
})
export class ScheduleChangeRequestsModule {}