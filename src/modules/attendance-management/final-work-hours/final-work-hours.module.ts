import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinalWorkHour } from './entities/final-work-hour.entity';
import { FinalWorkHoursController } from './final-work-hours.controller';
import { FinalWorkHoursService } from './final-work-hours.service';
import { WorkHourCalculationService } from './services/work-hour-calculation.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([FinalWorkHour]),
        BullModule.registerQueue({
            name: 'work-hour-calculation'
          }),
    ],
    providers: [FinalWorkHoursService, WorkHourCalculationService],
    exports: [FinalWorkHoursService, WorkHourCalculationService],
    controllers: [FinalWorkHoursController],
})
export class FinalWorkHoursModule {}