import { Occurrence } from '@/common/enums/occurrence.enum';
import { GovernmentMandatedType } from '@/common/enums/payroll/government-contribution-type.enum';
import { PayrollItemCategory } from '@/common/enums/payroll/payroll-item-category.enum';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollItemType } from './entities/payroll-item-type.entity';

@Injectable()
export class PayrollItemTypesService extends BaseService<PayrollItemType> {
  constructor(
      @InjectRepository(PayrollItemType)
      private readonly payrollItemTypesRepository: Repository<PayrollItemType>,
      protected readonly usersService: UsersService
  ) {
      super(payrollItemTypesRepository, usersService);
      this.seedDefaultPhilippinePayrollItemTypes();
  }

  /**
   * Seeds default Philippine payroll item types with 2025 rates
   */
  async seedDefaultPhilippinePayrollItemTypes(userId?: string): Promise<void> {
    // Check if there is default data already
    const existingTypes = await this.getRepository().find();
    
    if (existingTypes.length == 0) {
      // Create new contribution types if none exist
      const newTypes: PayrollItemType[] = [];
      
      // 1. SSS Contribution
      const sssContribution = new PayrollItemType({
        name: 'SSS Contribution',
        description: 'Social Security System contribution (2025)',
        category: PayrollItemCategory.DEDUCTION,
        defaultOccurrence: Occurrence.MONTHLY,
        type: 'formula',
        governmentMandatedType: GovernmentMandatedType.SSS,
        percentage: 5,
        employerPercentage: 10,
        processEvery: 2,
        isTaxable: false,
        isTaxDeductible: true,
        isRequired: true,
        minAmount: 5000,
        maxAmount: 35000,
        minAdditionalAmount: 10,
        maxAdditionalAmount: 30,
        minContribution: 14500,
        maxContribution: 15000,
      });
      const savedSSS = await this.create(sssContribution, userId);
      newTypes.push(savedSSS);
      
      // 2. PhilHealth Contribution
      const philhealthContribution = new PayrollItemType({
        name: 'PhilHealth Contribution',
        description: 'Philippine Health Insurance Corporation contribution (2025)',
        category: PayrollItemCategory.DEDUCTION,
        defaultOccurrence: Occurrence.MONTHLY,
        governmentMandatedType: GovernmentMandatedType.PHILHEALTH,
        percentage: 2.5,
        employerPercentage: 2.5,
        processEvery: 2,
        isTaxable: false,
        isTaxDeductible: true,
        type: 'formula',
        isRequired: true,
        minAmount: 10000,
        maxAmount: 100000
      });

      const savedPhilHealth = await this.create(philhealthContribution, userId);
      newTypes.push(savedPhilHealth);
      
      // 3. Pag-IBIG Contribution
      const pagibigContribution = new PayrollItemType({
        name: 'Pag-IBIG Contribution',
        description: 'Home Development Mutual Fund contribution (2025)',
        category: PayrollItemCategory.DEDUCTION,
        defaultOccurrence: Occurrence.MONTHLY,
        governmentMandatedType: GovernmentMandatedType.PAGIBIG,
        percentage: 1,
        employerPercentage: 2,
        processEvery: 2,
        isTaxable: false,
        isTaxDeductible: true,
        isRequired: true,
        type: 'formula',
        minAmount: 1500,
        maxAmount: 10000,
        minContribution: 1,
        maxContribution: 2 
      });
      const savedPagIBIG = await this.create(pagibigContribution, userId);
      newTypes.push(savedPagIBIG);
      
      // 4. Add basic salary compensation types
      const salaryTypes = [
        {
          name: 'Monthly Salary',
          category: PayrollItemCategory.COMPENSATION,
          unit: 'PHP',
          group: 'Salary',
          defaultOccurrence: Occurrence.MONTHLY,
          type: 'fixed' as const,
          isRequired: true,
          includeInPayrollItemsProcessing: false,
          isTaxable: true,
        },
        {
          name: 'Daily Rate',
          category: PayrollItemCategory.COMPENSATION,
          unit: 'PHP',
          group: 'Salary',
          defaultOccurrence: Occurrence.DAILY,
          type: 'fixed' as const,
          includeInPayrollItemsProcessing: false,
          isTaxable: true,
        },
        {
          name: 'Hourly Rate',
          category: PayrollItemCategory.COMPENSATION,
          unit: 'PHP',
          group: 'Salary',
          defaultOccurrence: Occurrence.HOURLY,
          includeInPayrollItemsProcessing: false,
          type: 'fixed' as const,
          isTaxable: true,
        }
      ];
      
      for (const salary of salaryTypes) {
        const salaryType = new PayrollItemType({
          ...salary,
          description: `Employee ${salary.name.toLowerCase()} compensation`,
        });
        const savedSalary = await this.create(salaryType, userId);
        newTypes.push(savedSalary);
      }
      
      // 5. 13th Month Pay
      const thirteenthMonthPay = new PayrollItemType({
        name: '13th Month Pay',
        description: '13th month pay',
        category: PayrollItemCategory.COMPENSATION,
        governmentMandatedType: GovernmentMandatedType.THIRTEENTH_MONTH_PAY,
        defaultOccurrence: Occurrence.ANNUALLY,
        isTaxable: true,
        isTaxDeductible: false,
        taxExemptionAmount: 90000,
        type: 'fixed' as const,
        isRequired: true,
      });

      const savedThirteenthMonthPay = await this.create(thirteenthMonthPay, userId);
      newTypes.push(savedThirteenthMonthPay);

      // 6. Withholding Tax
      const withholdingTax = new PayrollItemType({
        name: 'Withholding Tax',
        description: 'Withholding tax deduction',
        category: PayrollItemCategory.DEDUCTION,
        governmentMandatedType: GovernmentMandatedType.TAX,
        processEvery: 1,
        defaultOccurrence: Occurrence.MONTHLY,
        type: 'formula' as const,
        isRequired: true,
      });
      
      const savedWithholdingTax = await this.create(withholdingTax, userId);
      newTypes.push(savedWithholdingTax);

    }
  }
}