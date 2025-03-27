import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from './entities/activity-logs.entity';
import { LogsService } from './logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
