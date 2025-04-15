import { UsersModule } from '@/modules/account-management/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './entities/shift.entity';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';

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