import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancePunchesController } from './attendance-punches.controller';
import { AttendancePunchesService } from './attendance-punches.service';
import { AttendancePunches } from './entities/attendance-punch.entity';

@Module({
    imports: [TypeOrmModule.forFeature([AttendancePunches])],
    providers: [AttendancePunchesService],
    exports: [AttendancePunchesService],
    controllers: [AttendancePunchesController],
})
export class AttendancePunchesModule {}