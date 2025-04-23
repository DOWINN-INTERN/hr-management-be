import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollItemType } from './entities/payroll-item-type.entity';
import { PayrollItemTypesController } from './payroll-item-types.controller';
import { PayrollItemTypesService } from './payroll-item-types.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([PayrollItemType]),
    ],
    providers: [PayrollItemTypesService],
    exports: [PayrollItemTypesService],
    controllers: [PayrollItemTypesController],
})
export class PayrollItemTypesModule {}