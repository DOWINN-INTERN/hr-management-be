import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';
import { Shift } from './entities/shift.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Shift]),
        UsersModule,

    ],
    providers: [ShiftsService],
    exports: [ShiftsService],
    controllers: [ShiftsController],
})
export class ShiftsModule {}