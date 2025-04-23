import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinalWorkHour } from './entities/final-work-hour.entity';
import { FinalWorkHoursController } from './final-work-hours.controller';
import { FinalWorkHoursService } from './final-work-hours.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([FinalWorkHour])
    ],
    providers: [FinalWorkHoursService],
    exports: [FinalWorkHoursService],
    controllers: [FinalWorkHoursController],
})
export class FinalWorkHoursModule {}