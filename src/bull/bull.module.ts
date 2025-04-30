import { BullModule as NestBullModule } from '@nestjs/bull';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueConfig, queues } from '../config/queues.config';
import { QueueFactoryService } from './services/queue-factory.service';

@Module({})
export class BullModule {
  static forRoot(): DynamicModule {
    return {
      module: BullModule,
      imports: [
        NestBullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                redis: {
                    host: configService.get('REDIS_HOST', 'localhost'),
                    port: configService.get('REDIS_PORT', 6379),
                    password: configService.get('REDIS_PASSWORD', undefined),
                },
                defaultJobOptions: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 1000 },
                    removeOnComplete: true,
                    removeOnFail: false,
                },
            }),
        }),
        NestBullModule.registerQueue(
            ...queues.map((queueConfig: QueueConfig) => ({
                name: queueConfig.name,
                options: queueConfig.options,
            }))
        ),
      ],
      providers: [QueueFactoryService],
      exports: [NestBullModule],
    };
  }
}