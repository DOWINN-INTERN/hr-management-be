import { GovernmentContributionType } from '@/common/enums/government-contribution-type.enum';
import { Occurrence } from '@/common/enums/occurrence.enum';
import { PayrollItemCategory } from '@/common/enums/payroll-item-category.enum';
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
        category: PayrollItemCategory.GOVERNMENT,
        defaultOccurrence: Occurrence.MONTHLY,
        unit: 'PHP',
        type: 'formula',
        governmentContributionType: GovernmentContributionType.SSS,
        percentage: 5,
        employerPercentage: 10,
        isTaxable: false,
        isTaxDeductible: true,
        isRequired: true,
        minAmount: 0,
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
        category: PayrollItemCategory.GOVERNMENT,
        defaultOccurrence: Occurrence.MONTHLY,
        unit: 'PHP',
        governmentContributionType: GovernmentContributionType.PHILHEALTH,
        percentage: 2.5,
        employerPercentage: 2.5,
        isTaxable: false,
        isTaxDeductible: true,
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
        category: PayrollItemCategory.GOVERNMENT,
        defaultOccurrence: Occurrence.MONTHLY,
        unit: 'PHP',
        governmentContributionType: GovernmentContributionType.PAGIBIG,
        percentage: 1,
        employerPercentage: 2,
        isTaxable: false,
        isTaxDeductible: true,
        isRequired: true,
        minAmount: 1500,
        maxAmount: 1500,
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
          defaultOccurrence: Occurrence.MONTHLY,
          type: 'fixed' as const,
          isRequired: true,
          isTaxable: true,
        },
        {
          name: 'Daily Rate',
          category: PayrollItemCategory.COMPENSATION,
          unit: 'PHP',
          defaultOccurrence: Occurrence.DAILY,
          type: 'fixed' as const,
          isTaxable: true,
        },
        {
          name: 'Hourly Rate',
          category: PayrollItemCategory.COMPENSATION,
          unit: 'PHP',
          defaultOccurrence: Occurrence.HOURLY,
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
      
    }
  }
}