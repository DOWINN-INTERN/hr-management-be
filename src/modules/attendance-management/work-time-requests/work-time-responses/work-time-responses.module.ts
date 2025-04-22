import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { WorkTimeResponsesController } from './work-time-responses.controller';
import { WorkTimeResponsesService } from './work-time-responses.service';
import { WorkTimeResponse } from './entities/work-time-response.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkTimeResponse]),
        UsersModule,

    ],
    providers: [WorkTimeResponsesService],
    exports: [WorkTimeResponsesService],
    controllers: [WorkTimeResponsesController],
})
export class WorkTimeResponsesModule {}