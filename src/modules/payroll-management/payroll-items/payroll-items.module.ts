import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { PayrollItemsController } from './payroll-items.controller';
import { PayrollItemsService } from './payroll-items.service';
import { PayrollItem } from './entities/payroll-item.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([PayrollItem]),
        UsersModule,

    ],
    providers: [PayrollItemsService],
    exports: [PayrollItemsService],
    controllers: [PayrollItemsController],
})
export class PayrollItemsModule {}