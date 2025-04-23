import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CutoffsController } from './cutoffs.controller';
import { CutoffsService } from './cutoffs.service';
import { Cutoff } from './entities/cutoff.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Cutoff]),
        ScheduleModule.forRoot(),
    ],
    providers: [CutoffsService],
    exports: [CutoffsService],
    controllers: [CutoffsController],
})
export class CutoffsModule {}