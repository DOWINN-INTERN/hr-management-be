import { UsersModule } from '@/modules/account-management/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holiday } from './entities/holiday.entity';
import { HolidaysController } from './holidays.controller';
import { HolidaysService } from './holidays.service';

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