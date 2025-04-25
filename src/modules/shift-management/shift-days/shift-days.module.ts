import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftDay } from './entities/shift-day.entity';
import { ShiftDaysController } from './shift-days.controller';
import { ShiftDaysService } from './shift-days.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ShiftDay]),
    ],
    providers: [ShiftDaysService],
    exports: [ShiftDaysService],
    controllers: [ShiftDaysController],
})
export class ShiftDaysModule {}