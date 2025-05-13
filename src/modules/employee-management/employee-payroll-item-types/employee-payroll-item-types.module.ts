import { PayrollItemTypesModule } from '@/modules/payroll-management/payroll-item-types/payroll-item-types.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeePayrollItemTypesController } from './employee-payroll-item-types.controller';
import { EmployeePayrollItemTypesService } from './employee-payroll-item-types.service';
import { EmployeePayrollItemType } from './entities/employee-payroll-item-type.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([EmployeePayrollItemType]),
        PayrollItemTypesModule,
    ],
    providers: [EmployeePayrollItemTypesService],
    exports: [EmployeePayrollItemTypesService],
    controllers: [EmployeePayrollItemTypesController],
})
export class EmployeePayrollItemTypesModule {}