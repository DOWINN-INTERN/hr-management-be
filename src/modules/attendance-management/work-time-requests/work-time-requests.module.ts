import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { WorkTimeRequestsController } from './work-time-requests.controller';
import { WorkTimeRequestsService } from './work-time-requests.service';
import { WorkTimeRequest } from './entities/work-time-request.entity';
import { WorkTimeResponsesModule } from './work-time-responses/work-time-responses.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkTimeRequest]),
        UsersModule,
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