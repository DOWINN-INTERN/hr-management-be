import { UsersModule } from '@/modules/account-management/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancePunchesController } from './attendance-punches.controller';
import { AttendancePunchesService } from './attendance-punches.service';
import { AttendancePunches } from './entities/attendance-punches.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AttendancePunches]),
        UsersModule,

    ],
    providers: [AttendancePunchesService],
    exports: [AttendancePunchesService],
    controllers: [AttendancePunchesController],
})
export class AttendancePunchesModule {}