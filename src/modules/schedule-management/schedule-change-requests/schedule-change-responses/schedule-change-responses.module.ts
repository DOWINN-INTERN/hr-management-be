import { UsersModule } from '@/modules/account-management/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleChangeResponse } from './entities/schedule-change-response.entity';
import { ScheduleChangeResponsesController } from './schedule-change-responses.controller';
import { ScheduleChangeResponsesService } from './schedule-change-responses.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ScheduleChangeResponse]),
        UsersModule,
    ],
    providers: [ScheduleChangeResponsesService],
    exports: [ScheduleChangeResponsesService],
    controllers: [ScheduleChangeResponsesController],
})
export class ScheduleChangeResponsesModule {}