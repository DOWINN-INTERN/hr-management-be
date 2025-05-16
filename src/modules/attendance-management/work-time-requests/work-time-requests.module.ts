import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinalWorkHoursModule } from '../final-work-hours/final-work-hours.module';
import { WorkTimeRequest } from './entities/work-time-request.entity';
import { WorkTimeListener } from './listener/work-time.listener';
import { WorkTimeRequestsController } from './work-time-requests.controller';
import { WorkTimeRequestsService } from './work-time-requests.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkTimeRequest]),
        FinalWorkHoursModule
    ],
    providers: [WorkTimeRequestsService, WorkTimeListener],
    exports: [
        WorkTimeRequestsService,
    ],
    controllers: [WorkTimeRequestsController],
})
export class WorkTimeRequestsModule {}