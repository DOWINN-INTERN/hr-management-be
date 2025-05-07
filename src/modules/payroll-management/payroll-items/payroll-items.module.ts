import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollItemTypesModule } from '../payroll-item-types/payroll-item-types.module';
import { PayrollItem } from './entities/payroll-item.entity';
import { PayrollItemsController } from './payroll-items.controller';
import { PayrollItemsService } from './payroll-items.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([PayrollItem]),
        PayrollItemTypesModule,
    ],
    providers: [PayrollItemsService],
    exports: [PayrollItemsService],
    controllers: [PayrollItemsController],
})
export class PayrollItemsModule {}