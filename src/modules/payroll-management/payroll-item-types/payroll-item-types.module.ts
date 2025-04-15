import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from '@/modules/account-management/users/users.module';
import { PayrollItemTypesController } from './payroll-item-types.controller';
import { PayrollItemTypesService } from './payroll-item-types.service';
import { PayrollItemType } from './entities/payroll-item-type.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([PayrollItemType]),
        UsersModule,

    ],
    providers: [PayrollItemTypesService],
    exports: [PayrollItemTypesService],
    controllers: [PayrollItemTypesController],
})
export class PayrollItemTypesModule {}