import { UsersModule } from '@/modules/account-management/users/users.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CutoffsController } from './cutoffs.controller';
import { CutoffsService } from './cutoffs.service';
import { Cutoff } from './entities/cutoff.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Cutoff]),
        UsersModule,
        ScheduleModule.forRoot(),
    ],
    providers: [CutoffsService],
    exports: [CutoffsService],
    controllers: [CutoffsController],
})
export class CutoffsModule {}