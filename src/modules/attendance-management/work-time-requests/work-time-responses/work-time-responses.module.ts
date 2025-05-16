import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkTimeRequestsModule } from '../work-time-requests.module';
import { WorkTimeResponse } from './entities/work-time-response.entity';
import { WorkTimeResponsesController } from './work-time-responses.controller';
import { WorkTimeResponsesService } from './work-time-responses.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkTimeResponse]),
        WorkTimeRequestsModule,
    ],
    providers: [WorkTimeResponsesService],
    exports: [WorkTimeResponsesService],
    controllers: [WorkTimeResponsesController],
})
export class WorkTimeResponsesModule {}