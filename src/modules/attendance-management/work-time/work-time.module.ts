import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { WorkTimeController } from './work-time.controller';
import { WorkTimeService } from './work-time.service';
import { WorkTime } from './entities/work-time.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkTime]),
        UsersModule,

    ],
    providers: [WorkTimeService],
    exports: [WorkTimeService],
    controllers: [WorkTimeController],
})
export class WorkTimeModule {}