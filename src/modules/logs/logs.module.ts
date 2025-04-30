import { Global, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { SystemLogsModule } from './system-logs/system-logs.module';

@Global()
@Module({
  imports: [
    RouterModule.register([
        {
            path: 'logs',
            module: LogsModule,
            children: [
                { 
                  path: 'activity',
                  module: ActivityLogsModule,
                },
                {
                  path: 'system',
                  module: SystemLogsModule,
                }
            ],
        },
    ]),
    ActivityLogsModule,
    SystemLogsModule,
  ],
  exports: [ActivityLogsModule, SystemLogsModule],
})
export class LogsModule {}
