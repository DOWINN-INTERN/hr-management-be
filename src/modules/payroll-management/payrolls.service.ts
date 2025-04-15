import { PayrollItemCategory } from '@/common/enums/payroll-item-category.enum';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { evaluate } from 'mathjs';
import { Repository } from 'typeorm';
import { Employee } from '../employee-management/entities/employee.entity';
import { Payroll } from './entities/payroll.entity';
import { PayrollItem } from './payroll-items/entities/payroll-item.entity';

@Injectable()
export class PayrollsService extends BaseService<Payroll> {
    constructor(
        @InjectRepository(Payroll)
        private readonly payrollsRepository: Repository<Payroll>,
        protected readonly usersService: UsersService
    ) {
        super(payrollsRepository, usersService);
    }

    async evaluateFormula(
        employee: Employee,
        item: PayrollItem,
        grossPay?: number,
      ): Promise<number> {
        const formula = item.payrollItemType.computationFormula;
    
        const scope: Record<string, number> = {
          'Employee.MonthlyRate': Number(employee.monthlyRate),
          'Employee.DailyRate': employee.dailyRate,
        };
    
        if (item.parameters) {
          for (const key in item.parameters) {
            scope[`Parameters.${key}`] = item.parameters[key];
          }
        }
    
        if (grossPay !== undefined) {
          scope['GrossPay'] = grossPay;
        }
    
        try {
          const result = evaluate(formula, scope);
          return Number(result);
        } catch (err) {
          console.error(`Error evaluating formula: ${formula}`, err);
          return 0;
        }
      }
    
      async processPayroll(employee: Employee): Promise<any> {
        const items = employee.payrollItems!.filter((i) => i.isActive);
    
        let totalCompensations = 0;
        let totalBenefits = 0;
        let totalDeductions = 0;
    
        for (const item of items.filter(
          (i) => i.payrollItemType.category === PayrollItemCategory.COMPENSATION,
        )) {
          item.amount = await this.evaluateFormula(employee, item);
          totalCompensations += item.amount;
        }
    
        const grossPay = totalCompensations;
    
        for (const item of items.filter(
          (i) => i.payrollItemType.category === PayrollItemCategory.BENEFIT,
        )) {
          item.amount = await this.evaluateFormula(employee, item);
          totalBenefits += item.amount;
        }
    
        for (const item of items.filter(
          (i) => i.payrollItemType.category === PayrollItemCategory.DEDUCTION,
        )) {
          item.amount = await this.evaluateFormula(employee, item, grossPay);
          totalDeductions += item.amount;
        }
    
        const netPay = grossPay + totalBenefits - totalDeductions;
    
        return {
          employeeId: employee.id,
          grossPay,
          totalBenefits,
          totalDeductions,
          netPay,
          processedItems: items,
        };
      }
}