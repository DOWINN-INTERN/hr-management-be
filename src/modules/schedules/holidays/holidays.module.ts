import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { HolidaysController } from './holidays.controller';
import { HolidaysService } from './holidays.service';
import { Holiday } from './entities/holiday.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Holiday]),
        UsersModule,

    ],
    providers: [HolidaysService],
    exports: [HolidaysService],
    controllers: [HolidaysController],
})
export class HolidaysModule {}