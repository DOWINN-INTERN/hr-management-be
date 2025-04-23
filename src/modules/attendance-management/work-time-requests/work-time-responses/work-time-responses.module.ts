import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkTimeResponse } from './entities/work-time-response.entity';
import { WorkTimeResponsesController } from './work-time-responses.controller';
import { WorkTimeResponsesService } from './work-time-responses.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkTimeResponse])
    ],
    providers: [WorkTimeResponsesService],
    exports: [WorkTimeResponsesService],
    controllers: [WorkTimeResponsesController],
})
export class WorkTimeResponsesModule {}