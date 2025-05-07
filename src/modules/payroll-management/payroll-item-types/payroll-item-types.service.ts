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
   * Seeds default Philippine payroll item types
   */
  async seedDefaultPhilippinePayrollItemTypes(userId?: string): Promise<PayrollItemType[]> {
    // Check if there is default data already
    const existingTypes = await this.getRepository().findBy({ isSystemGenerated: true });
    if (existingTypes.length > 0) {
      return existingTypes;
    }

    const defaultTypes = [
      // Base Compensation Types
      {
        name: 'Monthly Salary',
        description: 'Fixed monthly salary',
        category: PayrollItemCategory.COMPENSATION,
        defaultOccurrence: 'MONTHLY',
        unit: 'PHP',
        computationFormula: 'return Amount;',
        isSystemGenerated: true,
        isRequired: true,
        isTaxable: true
      },
      {
        name: 'Daily Rate',
        description: 'Daily rate compensation',
        category: PayrollItemCategory.COMPENSATION,
        defaultOccurrence: 'DAILY',
        unit: 'PHP',
        computationFormula: 'return Amount * WorkingDaysInPeriod;',
        isSystemGenerated: true,
        isRequired: false,
        isTaxable: true
      },
      {
        name: 'Hourly Rate',
        description: 'Hourly rate compensation',
        category: PayrollItemCategory.COMPENSATION,
        defaultOccurrence: 'HOURLY',
        unit: 'PHP',
        computationFormula: 'return Amount * RegularHours;',
        isSystemGenerated: true,
        isRequired: false,
        isTaxable: true
      },

      // Philippine Government Mandated Contributions
      {
        name: 'SSS Contribution',
        description: 'Social Security System contribution',
        category: PayrollItemCategory.GOVERNMENT,
        defaultOccurrence: 'MONTHLY',
        unit: 'PHP',
        computationFormula: this.getSSSFormula(),
        isSystemGenerated: true,
        isGovernmentMandated: true,
        governmentContributionType: 'SSS',
        hasEmployerShare: true,
        employerFormulaPercentage: this.getSSSEmployerFormula(),
        isPartOfTaxCalculation: true,
        isTaxable: false,
        isTaxDeductible: true,
        calculationParameters: { sssTable: '2023' }
      },
      {
        name: 'PhilHealth Contribution',
        description: 'Philippine Health Insurance Corporation contribution',
        category: PayrollItemCategory.GOVERNMENT,
        defaultOccurrence: 'MONTHLY',
        unit: 'PHP',
        computationFormula: this.getPhilHealthFormula(),
        isSystemGenerated: true,
        isGovernmentMandated: true,
        governmentContributionType: 'PHILHEALTH',
        hasEmployerShare: true,
        employerFormulaPercentage: 'return Amount;', // Equal share
        isPartOfTaxCalculation: true,
        isTaxable: false,
        isTaxDeductible: true,
        calculationParameters: { philhealthTable: '2023', premiumRate: 4 }
      },
      {
        name: 'Pag-IBIG Contribution',
        description: 'Home Development Mutual Fund contribution',
        category: PayrollItemCategory.GOVERNMENT,
        defaultOccurrence: 'MONTHLY',
        unit: 'PHP',
        computationFormula: this.getPagIBIGFormula(),
        isSystemGenerated: true,
        isGovernmentMandated: true,
        governmentContributionType: 'PAGIBIG',
        hasEmployerShare: true,
        employerFormulaPercentage: this.getPagIBIGEmployerFormula(),
        isPartOfTaxCalculation: true,
        isTaxable: false,
        isTaxDeductible: true,
        calculationParameters: { pagibigTable: '2023', rate: 2 }
      },
      {
        name: 'Withholding Tax',
        description: 'BIR withholding tax for compensation income',
        category: PayrollItemCategory.TAX,
        defaultOccurrence: 'MONTHLY',
        unit: 'PHP',
        computationFormula: this.getWithholdingTaxFormula(),
        isSystemGenerated: true,
        isGovernmentMandated: true,
        governmentContributionType: 'TAX',
        hasEmployerShare: false,
        isPartOfTaxCalculation: false,
        isTaxable: false,
        isTaxDeductible: false,
        calculationParameters: { 
          taxTable: '2023', 
          applicableTaxExemptions: ['de_minimis', 'thirteenth_month']
        }
      },
      
      // Common Allowances
      {
        name: 'Transportation Allowance',
        description: 'Monthly transportation allowance (non-taxable up to 2,000)',
        category: PayrollItemCategory.ALLOWANCE,
        defaultOccurrence: 'MONTHLY',
        unit: 'PHP',
        computationFormula: 'return Amount;',
        isSystemGenerated: true,
        isTaxable: false,
        calculationParameters: {
          taxExemptionLimit: 2000
        }
      },
      {
        name: 'Meal Allowance',
        description: 'Monthly meal allowance (non-taxable up to BIR limits)',
        category: PayrollItemCategory.ALLOWANCE,
        defaultOccurrence: 'MONTHLY',
        unit: 'PHP',
        computationFormula: 'return Amount;',
        isSystemGenerated: true,
        isTaxable: false,
        calculationParameters: {
          taxExemptionLimit: 1500
        }
      },
      
      // Common Bonuses
      {
        name: '13th Month Pay',
        description: 'Mandatory 13th month pay (non-taxable up to 90,000)',
        category: PayrollItemCategory.BONUS,
        defaultOccurrence: 'YEARLY',
        unit: 'PHP',
        computationFormula: 'return MonthlyRate;',
        isSystemGenerated: true,
        isTaxable: false,
        calculationParameters: {
          taxExemptionLimit: 90000
        }
      }
    ];
    
    const createdTypes: PayrollItemType[] = [];
    
    for (const typeData of defaultTypes) {
      // Check if type already exists by name
      const existing = await this.findOneBy({ name: typeData.name });
      
      if (!existing) {
        const payrollItemType = new PayrollItemType({});
        Object.assign(payrollItemType, typeData);
        
        const saved = await this.create(payrollItemType, userId);
        createdTypes.push(saved);
      } else {
        createdTypes.push(existing);
      }
    }
    
    return createdTypes;
  }
  
  // Philippine-specific contribution formulas
  private getSSSFormula(): string {
    return `
      // 2023 SSS Contribution Table
      const msw = BaseCompensation;
      let contribution = 0;
      
      if (msw <= 3249.99) contribution = 135;
      else if (msw <= 3749.99) contribution = 157.50;
      else if (msw <= 4249.99) contribution = 180;
      else if (msw <= 4749.99) contribution = 202.50;
      else if (msw <= 5249.99) contribution = 225;
      else if (msw <= 5749.99) contribution = 247.50;
      else if (msw <= 6249.99) contribution = 270;
      else if (msw <= 6749.99) contribution = 292.50;
      else if (msw <= 7249.99) contribution = 315;
      else if (msw <= 7749.99) contribution = 337.50;
      else if (msw <= 8249.99) contribution = 360;
      else if (msw <= 8749.99) contribution = 382.50;
      else if (msw <= 9249.99) contribution = 405;
      else if (msw <= 9749.99) contribution = 427.50;
      else if (msw <= 10249.99) contribution = 450;
      else if (msw <= 10749.99) contribution = 472.50;
      else if (msw <= 11249.99) contribution = 495;
      else if (msw <= 11749.99) contribution = 517.50;
      else if (msw <= 12249.99) contribution = 540;
      else if (msw <= 12749.99) contribution = 562.50;
      else if (msw <= 13249.99) contribution = 585;
      else if (msw <= 13749.99) contribution = 607.50;
      else if (msw <= 14249.99) contribution = 630;
      else if (msw <= 14749.99) contribution = 652.50;
      else if (msw <= 15249.99) contribution = 675;
      else if (msw <= 15749.99) contribution = 697.50;
      else if (msw <= 16249.99) contribution = 720;
      else if (msw <= 16749.99) contribution = 742.50;
      else if (msw <= 17249.99) contribution = 765;
      else if (msw <= 17749.99) contribution = 787.50;
      else if (msw <= 18249.99) contribution = 810;
      else if (msw <= 18749.99) contribution = 832.50;
      else if (msw <= 19249.99) contribution = 855;
      else if (msw <= 19749.99) contribution = 877.50;
      else if (msw <= 20249.99) contribution = 900;
      else if (msw <= 20749.99) contribution = 922.50;
      else if (msw <= 21249.99) contribution = 945;
      else if (msw <= 21749.99) contribution = 967.50;
      else if (msw <= 22249.99) contribution = 990;
      else if (msw <= 22749.99) contribution = 1012.50;
      else if (msw <= 23249.99) contribution = 1035;
      else if (msw <= 23749.99) contribution = 1057.50;
      else if (msw <= 24249.99) contribution = 1080;
      else if (msw <= 24749.99) contribution = 1102.50;
      else contribution = 1125;
      
      return contribution;
    `;
  }
  
  private getSSSEmployerFormula(): string {
    return `
      // 2023 SSS Employer Contribution Table
      const msw = BaseCompensation;
      let contribution = 0;
      
      if (msw <= 3249.99) contribution = 255;
      else if (msw <= 3749.99) contribution = 297.50;
      else if (msw <= 4249.99) contribution = 340;
      else if (msw <= 4749.99) contribution = 382.50;
      else if (msw <= 5249.99) contribution = 425;
      else if (msw <= 5749.99) contribution = 467.50;
      else if (msw <= 6249.99) contribution = 510;
      else if (msw <= 6749.99) contribution = 552.50;
      else if (msw <= 7249.99) contribution = 595;
      else if (msw <= 7749.99) contribution = 637.50;
      else if (msw <= 8249.99) contribution = 680;
      else if (msw <= 8749.99) contribution = 722.50;
      else if (msw <= 9249.99) contribution = 765;
      else if (msw <= 9749.99) contribution = 807.50;
      else if (msw <= 10249.99) contribution = 850;
      else if (msw <= 10749.99) contribution = 892.50;
      else if (msw <= 11249.99) contribution = 935;
      else if (msw <= 11749.99) contribution = 977.50;
      else if (msw <= 12249.99) contribution = 1020;
      else if (msw <= 12749.99) contribution = 1062.50;
      else if (msw <= 13249.99) contribution = 1105;
      else if (msw <= 13749.99) contribution = 1147.50;
      else if (msw <= 14249.99) contribution = 1190;
      else if (msw <= 14749.99) contribution = 1232.50;
      else if (msw <= 15249.99) contribution = 1275;
      else if (msw <= 15749.99) contribution = 1317.50;
      else if (msw <= 16249.99) contribution = 1360;
      else if (msw <= 16749.99) contribution = 1402.50;
      else if (msw <= 17249.99) contribution = 1445;
      else if (msw <= 17749.99) contribution = 1487.50;
      else if (msw <= 18249.99) contribution = 1530;
      else if (msw <= 18749.99) contribution = 1572.50;
      else if (msw <= 19249.99) contribution = 1615;
      else if (msw <= 19749.99) contribution = 1657.50;
      else if (msw <= 20249.99) contribution = 1700;
      else if (msw <= 20749.99) contribution = 1742.50;
      else if (msw <= 21249.99) contribution = 1785;
      else if (msw <= 21749.99) contribution = 1827.50;
      else if (msw <= 22249.99) contribution = 1870;
      else if (msw <= 22749.99) contribution = 1912.50;
      else if (msw <= 23249.99) contribution = 1955;
      else if (msw <= 23749.99) contribution = 1997.50;
      else if (msw <= 24249.99) contribution = 2040;
      else if (msw <= 24749.99) contribution = 2082.50;
      else contribution = 2125;
      
      return contribution;
    `;
  }
  
  private getPhilHealthFormula(): string {
    return `
      // 2023 PhilHealth Contribution
      const msw = BaseCompensation;
      let totalContribution = 0;
      
      if (msw <= 10000) totalContribution = 400;
      else if (msw <= 59999.99) totalContribution = msw * 0.04;
      else totalContribution = 2400;
      
      return totalContribution / 2; // Employee share only
    `;
  }
  
  private getPagIBIGFormula(): string {
    return `
      // Pag-IBIG Employee Contribution
      const msw = Math.min(BaseCompensation, 5000);
      return msw * 0.02;
    `;
  }
  
  private getPagIBIGEmployerFormula(): string {
    return `
      // Pag-IBIG Employer Contribution
      const msw = Math.min(BaseCompensation, 5000);
      return msw * 0.02;
    `;
  }
  
  private getWithholdingTaxFormula(): string {
    return `
      // 2023 Withholding Tax Table
      // Get taxable income (after deducting government contributions)
      const taxableIncome = TaxableIncome;
      let tax = 0;
      
      if (taxableIncome <= 20833) tax = 0;
      else if (taxableIncome <= 33332) tax = (taxableIncome - 20833) * 0.15;
      else if (taxableIncome <= 66666) tax = 1875 + (taxableIncome - 33333) * 0.20;
      else if (taxableIncome <= 166666) tax = 8541.80 + (taxableIncome - 66667) * 0.25;
      else if (taxableIncome <= 666666) tax = 33541.80 + (taxableIncome - 166667) * 0.30;
      else tax = 183541.80 + (taxableIncome - 666667) * 0.35;
      
      return tax;
    `;
  }
}