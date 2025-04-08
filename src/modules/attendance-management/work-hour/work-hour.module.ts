import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { WorkHourController } from './work-hour.controller';
import { WorkHourService } from './work-hour.service';
import { WorkHour } from './entities/work-hour.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkHour]),
        UsersModule,

    ],
    providers: [WorkHourService],
    exports: [WorkHourService],
    controllers: [WorkHourController],
})
export class WorkHourModule {}