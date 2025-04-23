import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkTimeRequest } from './entities/work-time-request.entity';
import { WorkTimeRequestsController } from './work-time-requests.controller';
import { WorkTimeRequestsService } from './work-time-requests.service';
import { WorkTimeResponsesModule } from './work-time-responses/work-time-responses.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkTimeRequest]),
        WorkTimeResponsesModule,
    ],
    providers: [WorkTimeRequestsService],
    exports: [
        WorkTimeRequestsService,
        WorkTimeResponsesModule,
    ],
    controllers: [WorkTimeRequestsController],
})
export class WorkTimeRequestsModule {}