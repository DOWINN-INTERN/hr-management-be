import { BullModule } from '@/bull/bull.module';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { configValidationSchema } from '../config.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    EventEmitterModule.forRoot(),
    BullModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  exports: [NestConfigModule, EventEmitterModule, BullModule, ScheduleModule],
})
export class ConfigModule {}