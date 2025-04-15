import { CutoffType } from '@/common/enums/cutoff-type.enum';
import { PayrollItemCategory } from '@/common/enums/payroll-item-category.enum';
import { UtilityHelper } from '@/common/helpers/utility.helper';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { BadRequestException, Injectable } from '@nestjs/common';
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

  calculateDailyRate(monthlySalary: number, startDate: Date, endDate: Date, cutoffType: CutoffType): number {
    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const totalBusinessDays = UtilityHelper.getBusinessDays(startDate, endDate);
    const salaryMap = {
      [CutoffType.DAILY]: monthlySalary / UtilityHelper.getBusinessDaysInMonth(startDate),
      [CutoffType.WEEKLY]: (monthlySalary * 12) / 52,
      [CutoffType.BI_WEEKLY]: (monthlySalary * 12) / 26,
      [CutoffType.MONTHLY]: monthlySalary,
      [CutoffType.QUARTERLY]: monthlySalary * 3,
      [CutoffType.SEMI_ANNUAL]: monthlySalary * 6,
      [CutoffType.ANNUAL]: monthlySalary * 12,
      [CutoffType.BI_ANNUAL]: monthlySalary * 24
    };
    
    const periodSalary = salaryMap[cutoffType] || monthlySalary;
    return periodSalary / totalBusinessDays;
  }
  

    async evaluateFormula(
        employee: Employee,
        item: PayrollItem,
        grossPay?: number,
      ): Promise<number> {
        const formula = item.payrollItemType.computationFormula;
    
        const scope: Record<string, number> = {
          'Employee.MonthlyRate': Number(employee.monthlyRate),
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