import { CutoffStatus } from '@/common/enums/cutoff-status.enum';
import { CutoffType } from '@/common/enums/cutoff-type.enum';
import { GovernmentContributionType } from '@/common/enums/government-contribution-type.enum';
import { Occurrence } from '@/common/enums/occurrence.enum';
import { PayrollItemCategory } from '@/common/enums/payroll-item-category.enum';
import { PayrollStatus } from '@/common/enums/payroll-status.enum';
import { RoleScopeType } from '@/common/enums/role-scope-type.enum';
import { UtilityHelper } from '@/common/helpers/utility.helper';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { FinalWorkHour } from '@/modules/attendance-management/final-work-hours/entities/final-work-hour.entity';
import { FinalWorkHoursService } from '@/modules/attendance-management/final-work-hours/final-work-hours.service';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type } from 'os';
import { DataSource, Repository } from 'typeorm';
import { EmployeePayrollItemTypesService } from '../employee-management/employee-payroll-item-types/employee-payroll-item-types.service';
import { EmployeesService } from '../employee-management/employees.service';
import { Employee } from '../employee-management/entities/employee.entity';
import { Role } from '../employee-management/roles/entities/role.entity';
import { CutoffsService } from './cutoffs/cutoffs.service';
import { Cutoff } from './cutoffs/entities/cutoff.entity';
import { Payroll } from './entities/payroll.entity';
import { PayrollItemTypesService } from './payroll-item-types/payroll-item-types.service';
import { PayrollItem } from './payroll-items/entities/payroll-item.entity';

// Add these types to your system using PayrollItemType entity
const salaryCompensationTypes = [
  {
    name: 'Monthly Salary',
    category: PayrollItemCategory.COMPENSATION,
    unit: 'PHP',
    computationFormula: 'return Amount;', // Simply return the configured amount
    isSystemGenerated: true,
    isRequired: true
  },
  {
    name: 'Daily Rate',
    category: PayrollItemCategory.COMPENSATION,
    unit: 'PHP',
    computationFormula: 'return Amount * WorkingDaysInPeriod;',
    isSystemGenerated: true,
    isRequired: true
  },
  {
    name: 'Hourly Rate',
    category: PayrollItemCategory.COMPENSATION,
    unit: 'PHP',
    computationFormula: 'return Amount * WorkHoursInPeriod;',
    isSystemGenerated: true,
    isRequired: true
  }
];

const sssEmployeeContribution = {
  name: 'SSS Employee Contribution',
  description: 'Social Security System employee contribution',
  category: PayrollItemCategory.GOVERNMENT,
  defaultOccurrence: 'MONTHLY',
  unit: 'PHP',
  computationFormula: `
    // 2023 SSS Contribution Table
    const msw = Employee.MonthlyRate;
    let contribution = 0;
    
    if (msw <= 3249.99) contribution = 135;
    else if (msw <= 3749.99) contribution = 157.50;
    else if (msw <= 4249.99) contribution = 180;
    else if (msw <= 4749.99) contribution = 202.50;
    // ... more brackets
    else if (msw >= 24750) contribution = 1125;
    
    return contribution;
  `,
  isSystemGenerated: true,
  isGovernmentMandated: true,
  governmentContributionType: 'SSS',
  hasEmployerShare: true,
  employerFormulaPercentage: `
    // 2023 SSS Employer Contribution Table
    const msw = Employee.MonthlyRate;
    let contribution = 0;
    
    if (msw <= 3249.99) contribution = 315;
    else if (msw <= 3749.99) contribution = 367.50;
    else if (msw <= 4249.99) contribution = 420;
    // ... more brackets
    else if (msw >= 24750) contribution = 2625;
    
    return contribution;
  `,
  isPartOfTaxCalculation: true,
  isTaxable: false,
  isTaxDeductible: true,
  isDisplayedInPayslip: true,
  isRequired: true,
  calculationParameters: {
    sssTable: '2023',
    includingEC: true,
    includingMPF: false
  }
};

const philhealthContribution = {
  name: 'PhilHealth Contribution',
  description: 'Philippine Health Insurance Corporation contribution',
  category: PayrollItemCategory.GOVERNMENT,
  defaultOccurrence: 'MONTHLY',
  unit: 'PHP',
  computationFormula: `
    // 2023 PhilHealth Contribution - shared equally by employer and employee
    const msw = Employee.MonthlyRate;
    let totalContribution = 0;
    
    if (msw <= 10000) totalContribution = 400;
    else if (msw <= 59999.99) totalContribution = msw * 0.04;
    else totalContribution = 2400;
    
    return totalContribution / 2; // Employee share only
  `,
  isSystemGenerated: true,
  isGovernmentMandated: true,
  governmentContributionType: 'PHILHEALTH',
  hasEmployerShare: true,
  employerFormulaPercentage: `return Amount;`, // Equal share: employee and employer
  isPartOfTaxCalculation: true,
  isTaxable: false,
  isTaxDeductible: true,
  isDisplayedInPayslip: true,
  isRequired: true,
  calculationParameters: {
    philhealthTable: '2023',
    premiumRate: 4 // percent
  }
};

const pagibigContribution = {
  name: 'Pag-IBIG Contribution',
  description: 'Home Development Mutual Fund contribution',
  category: PayrollItemCategory.GOVERNMENT,
  defaultOccurrence: 'MONTHLY',
  unit: 'PHP',
  computationFormula: `
    // Pag-IBIG Contribution - 2% of monthly salary
    const msw = Math.min(Employee.MonthlyRate, 5000);
    return msw * 0.02;
  `,
  isSystemGenerated: true,
  isGovernmentMandated: true,
  governmentContributionType: 'PAGIBIG',
  hasEmployerShare: true,
  employerFormulaPercentage: `
    // Employer share is also 2% of monthly salary
    const msw = Math.min(Employee.MonthlyRate, 5000);
    return msw * 0.02;
  `,
  isPartOfTaxCalculation: true,
  isTaxable: false,
  isTaxDeductible: true,
  isDisplayedInPayslip: true,
  isRequired: true,
  calculationParameters: {
    pagibigTable: '2023',
    rate: 2 // percent
  }
};

const withholdingTax = {
  name: 'Withholding Tax',
  description: 'BIR withholding tax for compensation income',
  category: PayrollItemCategory.TAX,
  defaultOccurrence: 'MONTHLY',
  unit: 'PHP',
  computationFormula: `
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
  `,
  isSystemGenerated: true,
  isGovernmentMandated: true,
  governmentContributionType: 'TAX',
  hasEmployerShare: false,
  isPartOfTaxCalculation: false, // Not part of taxable income computation
  isTaxable: false,
  isTaxDeductible: false,
  isDisplayedInPayslip: true,
  isRequired: true,
  calculationParameters: {
    taxTable: '2023',
    applicableTaxExemptions: ['de_minimis', 'thirteenth_month']
  }
};

@Injectable()
export class PayrollsService extends BaseService<Payroll> {
  protected readonly logger = new Logger(PayrollsService.name);
  private readonly RestDayPayMultiplier = 1.3;
  private readonly HolidayPayMultiplier = 2.0;
  private readonly SpecialHolidayPayMultiplier = 1.3;
  private readonly OvertimePayMultiplier = 1.25;
  private readonly HolidayOvertimePayMultiplier = 2.3;
  private readonly SpecialHolidayOvertimePayMultiplier = 1.3;
  private readonly RestDayOvertimePayMultiplier = 1.69;
  private readonly NightDifferentialPayMultiplier = 0.1;

  constructor(
    @InjectRepository(Payroll)
    private readonly payrollsRepository: Repository<Payroll>,
    private readonly dataSource: DataSource,
    private readonly employeesService: EmployeesService,
    private readonly cutoffsService: CutoffsService,
    private readonly finalWorkHoursService: FinalWorkHoursService,
    private readonly employeePayrollItemTypesService: EmployeePayrollItemTypesService,
    private readonly payrollItemTypesService: PayrollItemTypesService,
    protected readonly usersService: UsersService
  ) {
    super(payrollsRepository, usersService);
  }

  /**
   * Calculate rates based on employee's compensation type and cutoff period
   */
  async calculateRates(employeeId: string, cutoff: Cutoff): Promise<{
    monthlyRate: number;
    dailyRate: number;
    hourlyRate: number;
    baseCompensationType: string;
    baseCompensationAmount: number;
  }> {
    const baseCompensation = await this.employeePayrollItemTypesService.getEmployeeBaseCompensation(employeeId);
    
    const { rateType, amount } = baseCompensation;
    const businessDaysInPeriod = UtilityHelper.getBusinessDays(cutoff.startDate, cutoff.endDate);
    const businessDaysInMonth = UtilityHelper.getBusinessDaysInMonth(cutoff.startDate);
    
    // Default values
    let monthlyRate = 0;
    let dailyRate = 0;
    let hourlyRate = 0;
    
    // Calculate rates based on compensation type
    switch (rateType) {
      case Occurrence.MONTHLY:
        monthlyRate = amount;
        
        // Calculate daily rate based on cutoff type
        switch (cutoff.cutoffType) {
          case CutoffType.DAILY:
            dailyRate = monthlyRate / businessDaysInMonth;
            break;
          case CutoffType.WEEKLY:
            dailyRate = (monthlyRate / 4) / businessDaysInPeriod;
            break;
          case CutoffType.BI_WEEKLY:
            dailyRate = (monthlyRate / 2) / businessDaysInPeriod;
            break;
          case CutoffType.MONTHLY:
          default:
            dailyRate = monthlyRate / businessDaysInMonth;
            break;
        }
        
        // Standard 8-hour workday
        hourlyRate = dailyRate / 8;
        break;
        
      case Occurrence.DAILY:
        dailyRate = amount;
        monthlyRate = dailyRate * businessDaysInMonth;
        hourlyRate = dailyRate / 8;
        break;
        
      case Occurrence.HOURLY:
        hourlyRate = amount;
        dailyRate = hourlyRate * 8;
        monthlyRate = dailyRate * businessDaysInMonth;
        break;
        
      default:
        throw new BadRequestException(`Unknown compensation type: ${type}`);
    }
    
    return {
      monthlyRate,
      dailyRate,
      hourlyRate,
      baseCompensationType: rateType,
      baseCompensationAmount: amount
    };
  }

  
  /**
   * Calculate SSS contribution based on 2025 rules
   */
  private calculateSSSContribution(salary: number, params?: Record<string, any>): number {
    const employeeRate = (params?.employeeRate || 5) / 100;
    const mscCeiling = params?.mscCeiling || 35000;
    
    // Apply MSC ceiling
    const msc = Math.min(salary, mscCeiling);
    
    // Calculate employee's share
    return msc * employeeRate;
  }
  
  /**
   * Calculate PhilHealth contribution based on 2025 rules
   */
  private calculatePhilHealthContribution(salary: number, params?: Record<string, any>): number {
    const premiumRate = (params?.premiumRate || 5) / 100;
    const floorSalary = params?.floorSalary || 10000;
    const ceilingSalary = params?.ceilingSalary || 100000;
    
    // Apply floor and ceiling
    let computationBase = salary;
    if (computationBase < floorSalary) {
      computationBase = floorSalary;
    } else if (computationBase > ceilingSalary) {
      computationBase = ceilingSalary;
    }
    
    // Calculate total contribution then divide by 2 for employee's share
    return (computationBase * premiumRate) / 2;
  }
  
  /**
   * Calculate Pag-IBIG contribution based on 2025 rules
   */
  private calculatePagIBIGContribution(salary: number, params?: Record<string, any>): number {
    const employeeRate1 = (params?.employeeRate1 || 1) / 100;
    const employeeRate2 = (params?.employeeRate2 || 2) / 100;
    const maxSalary = params?.maxSalary || 10000;
    
    // Apply ceiling
    const computationBase = Math.min(salary, maxSalary);
    
    // Apply rate based on salary
    const rate = salary <= 1500 ? employeeRate1 : employeeRate2;
    
    return computationBase * rate;
  }
  
  /**
   * Calculate withholding tax based on TRAIN Law
   */
  private calculateWithholdingTax(monthlyTaxableIncome: number): number {
    // Annualize taxable income
    const annualTaxableIncome = monthlyTaxableIncome * 12;
    
    // Apply tax table
    let annualTax = 0;
    
    if (annualTaxableIncome <= 250000) {
      annualTax = 0;
    } else if (annualTaxableIncome <= 400000) {
      annualTax = (annualTaxableIncome - 250000) * 0.2;
    } else if (annualTaxableIncome <= 800000) {
      annualTax = 30000 + (annualTaxableIncome - 400000) * 0.25;
    } else if (annualTaxableIncome <= 2000000) {
      annualTax = 130000 + (annualTaxableIncome - 800000) * 0.3;
    } else if (annualTaxableIncome <= 8000000) {
      annualTax = 490000 + (annualTaxableIncome - 2000000) * 0.32;
    } else {
      annualTax = 2410000 + (annualTaxableIncome - 8000000) * 0.35;
    }
    
    // Get monthly tax
    return annualTax / 12;
  }

  /**
   * Calculate basic pay components from work hours
   */
  async calculateBasicPay(payroll: Payroll, finalWorkHours: FinalWorkHour[]): Promise<void> {
    // Get rates based on employee's compensation type
    const rates = await this.calculateRates(payroll.employee.id, payroll.cutoff);
    
    // Set rates
    payroll.monthlyRate = rates.monthlyRate;
    payroll.dailyRate = rates.dailyRate;
    payroll.hourlyRate = rates.hourlyRate;

    // Reset deduction hours
    payroll.totalNoTimeInHours = 0;
    payroll.totalNoTimeOutHours = 0;
    payroll.totalAbsentHours = 0;
    payroll.totalTardinessHours = 0;
    payroll.totalUndertimeHours = 0;
    
    // Reset hour totals
    payroll.totalRegularHours = 0;
    payroll.totalHolidayHours = 0;
    payroll.totalSpecialHolidayHours = 0;
    payroll.totalRestDayHours = 0;
    payroll.totalOvertimeHours = 0;
    payroll.totalHolidayOvertimeHours = 0;
    payroll.totalSpecialHolidayOvertimeHours = 0;
    payroll.totalRestDayOvertimeHours = 0;
    payroll.totalNightDifferentialHours = 0;
    
    // Reset pay components
    payroll.basicPay = 0;
    payroll.overtimePay = 0;
    payroll.holidayPay = 0;
    payroll.holidayOvertimePay = 0;
    payroll.specialHolidayPay = 0;
    payroll.specialHolidayOvertimePay = 0;
    payroll.restDayPay = 0;
    payroll.restDayOvertimePay = 0;
    payroll.nightDifferentialPay = 0;

    // Reset deduction totals
    payroll.absences = 0;
    payroll.tardiness = 0;
    payroll.undertime = 0;
    payroll.noTimeIn = 0;
    payroll.noTimeOut = 0;
    
    // Process each work hour record
    for (const workHour of finalWorkHours) {
      // Fix the hours mapping - you had these swapped
      payroll.totalRegularHours += +workHour.regularDayHours || 0;
      payroll.totalHolidayHours += +workHour.regularHolidayHours || 0; 
      payroll.totalSpecialHolidayHours += +workHour.specialHolidayHours || 0;
      payroll.totalRestDayHours += +workHour.restDayHours || 0;
      
      // Aggregate overtime hours
      payroll.totalOvertimeHours += +workHour.overtimeRegularDayHours || 0;
      payroll.totalHolidayOvertimeHours += +workHour.overtimeRegularHolidayHours || 0;
      payroll.totalSpecialHolidayOvertimeHours += +workHour.overtimeSpecialHolidayHours || 0;
      payroll.totalRestDayOvertimeHours += +workHour.overtimeRestDayHours || 0;

      // Aggregate deductions
      payroll.totalNoTimeInHours += +workHour.noTimeInHours || 0;
      payroll.totalNoTimeOutHours += +workHour.noTimeOutHours || 0;
      payroll.totalAbsentHours += +workHour.absentHours || 0;
      payroll.totalTardinessHours += +workHour.tardinessHours || 0;
      payroll.totalUndertimeHours += +workHour.undertimeHours || 0;

      // Night differential
      payroll.totalNightDifferentialHours += +workHour.nightDifferentialHours || 0;
    }
    
    // Calculate pay components with proper rate multipliers according to Philippine labor laws
    
    // 1. Basic regular day pay (1.0x)
    payroll.basicPay = payroll.totalRegularHours * payroll.hourlyRate;
    
    // 2. Rest day pay (1.3x)
    payroll.restDayPay = payroll.totalRestDayHours * payroll.hourlyRate * this.RestDayPayMultiplier;
    
    // 3. Holiday pay (2.0x)
    payroll.holidayPay = payroll.totalHolidayHours * payroll.hourlyRate * this.HolidayPayMultiplier;

    // 4. Special holiday pay (1.3x)
    payroll.specialHolidayPay = payroll.totalSpecialHolidayHours * payroll.hourlyRate * this.SpecialHolidayPayMultiplier;

    // 5. Overtime regular pay (1.25x)
    payroll.overtimePay = payroll.totalOvertimeHours * payroll.hourlyRate * this.OvertimePayMultiplier;

    // 6. Overtime holiday pay (2.6x)
    payroll.holidayOvertimePay = payroll.totalHolidayOvertimeHours * payroll.hourlyRate * this.HolidayOvertimePayMultiplier;

    // 7. Overtime special holiday pay (1.3x)
    payroll.specialHolidayOvertimePay = payroll.totalSpecialHolidayOvertimeHours * payroll.hourlyRate * this.SpecialHolidayOvertimePayMultiplier;

    // 8. Overtime rest day pay (1.69x)
    payroll.restDayOvertimePay = payroll.totalRestDayOvertimeHours * payroll.hourlyRate * this.RestDayOvertimePayMultiplier;
    
    // 9. Night differential (10% of hourly rate)
    payroll.nightDifferentialPay = payroll.totalNightDifferentialHours * payroll.hourlyRate * this.NightDifferentialPayMultiplier;

    // 10. Deduction hours
    payroll.absences = payroll.totalAbsentHours * payroll.hourlyRate;
    payroll.tardiness = payroll.totalTardinessHours * payroll.hourlyRate;
    payroll.undertime = payroll.totalUndertimeHours * payroll.hourlyRate;
    payroll.noTimeIn = payroll.totalNoTimeInHours * payroll.hourlyRate;
    payroll.noTimeOut = payroll.totalNoTimeOutHours * payroll.hourlyRate;
    
    // 10. Initial gross pay from basic components
    payroll.grossPay = payroll.basicPay + payroll.restDayPay + payroll.holidayPay
      + payroll.specialHolidayPay + payroll.overtimePay
      + payroll.holidayOvertimePay + payroll.specialHolidayOvertimePay
      + payroll.restDayOvertimePay + payroll.nightDifferentialPay;

    // 11. Total hours worked
    payroll.totalHours = payroll.totalRegularHours + payroll.totalRestDayHours + 
                        payroll.totalHolidayHours + payroll.totalSpecialHolidayHours +
                        payroll.totalOvertimeHours + payroll.totalRestDayOvertimeHours +
                        payroll.totalHolidayOvertimeHours + payroll.totalSpecialHolidayOvertimeHours;
    
    // 12. Initial taxable income (will be adjusted for non-taxable items)
    payroll.taxableIncome = payroll.grossPay;
  }
  
/**
 * Process all payroll items for an employee
 */
async processPayrollItems(payroll: Payroll, userId: string): Promise<PayrollItem[]> {
  // Get all payroll item types
  const allPayrollItemTypes = await this.payrollItemTypesService.getRepository().find({
    where: { isActive: true, isDeleted: false },
    order: { category: 'ASC', name: 'ASC' }
  });
  
  // Get employee specific payroll item configurations
  const employeePayrollItems = await this.employeePayrollItemTypesService.getRepository().find({
    where: { 
      employee: { id: payroll.employee.id },
      isActive: true,
      isDeleted: false
    },
    relations: {
      payrollItemType: true
    }
  });
  
  // Map employee payroll items by payroll item type ID for quick lookup
  const employeePayrollItemMap = new Map(
    employeePayrollItems.map(item => [item.payrollItemType.id, item])
  );
  
  // Order for processing categories
  const processingOrder = [
    PayrollItemCategory.GOVERNMENT,
    PayrollItemCategory.ALLOWANCE,
    PayrollItemCategory.BONUS,
    PayrollItemCategory.COMMISSION,
    PayrollItemCategory.TIP,
    PayrollItemCategory.BENEFIT,
    PayrollItemCategory.DEDUCTION,
    PayrollItemCategory.REIMBURSEMENT,
    PayrollItemCategory.TAX,
    PayrollItemCategory.OTHER,
  ];
  
  const newPayrollItems: PayrollItem[] = [];
  const calculationLog: any[] = [];
  
  // First, track original values for reference
  const originalValues = {
    grossPay: payroll.grossPay,
    taxableIncome: payroll.taxableIncome
  };
  
  // Process each category in order
  for (const category of processingOrder) {
    // Get item types for this category
    const categoryItemTypes = allPayrollItemTypes.filter(
      type => type.category === category
    );
    
    for (const itemType of categoryItemTypes) {
      // Check if this employee has a specific configuration for this item type
      const employeeItemConfig = employeePayrollItemMap.get(itemType.id);
      
      // Skip if not applicable for this employee
      // Only process required items or items that have employee-specific configuration
      if (!employeeItemConfig) {
        continue;
      }
      
      // Create new payroll item
      const payrollItem = new PayrollItem({});
      payrollItem.payrollItemType = itemType;
      payrollItem.payroll = payroll;
      
      // Calculate item amount
      let calculatedAmount = 0;
      let employerAmount = 0;
      let calculationDetail: any = {};
      
      // If employee has specific amount configured, use it
      if (employeeItemConfig?.amount !== undefined && employeeItemConfig?.amount !== null) {
        calculatedAmount = employeeItemConfig.amount;
      } 
      // Otherwise, calculate based on item type
      else {
        if (itemType.governmentContributionType) {
          // Calculate government contributions based on 2025 rates from the item type properties
          switch (itemType.governmentContributionType) {
            case GovernmentContributionType.SSS:
              // SSS calculation based on 2025 rates
              const sssEmployeeRate = (itemType.percentage || 5) / 100;
              const sssEmployerRate = (itemType.employerPercentage || 10) / 100;
              const mssCeiling = itemType.maxAmount || 35000;
              
              // Apply MSC ceiling
              const msc = Math.min(payroll.monthlyRate, mssCeiling);
              
              // Calculate employee and employer shares
              calculatedAmount = parseFloat((msc * sssEmployeeRate).toFixed(2));
              employerAmount = parseFloat((msc * sssEmployerRate).toFixed(2));
              
              // Add EC contribution (employer only)
              const ecContribution = msc <= 14500 ? 10 : 30;
              employerAmount += ecContribution;
              
              calculationDetail = {
                calculationType: 'SSS_2025',
                monthlyRate: payroll.monthlyRate,
                msc: msc,
                employeeRate: `${sssEmployeeRate * 100}%`,
                employerRate: `${sssEmployerRate * 100}%`,
                employeeContribution: calculatedAmount,
                employerContribution: employerAmount,
                ecContribution: ecContribution,
                totalContribution: calculatedAmount + employerAmount
              };
              break;
              
            case GovernmentContributionType.PHILHEALTH:
              // PhilHealth calculation based on 2025 rates
              const philHealthRate = (itemType.percentage || 2.5) / 100; 
              const philHealthEmployerRate = (itemType.employerPercentage || 2.5) / 100;
              const floorSalary = itemType.minAmount || 10000;
              const ceilingSalary = itemType.maxAmount || 100000;
              
              // Apply floor and ceiling
              let philHealthBase = payroll.monthlyRate;
              if (philHealthBase < floorSalary) {
                philHealthBase = floorSalary;
              } else if (philHealthBase > ceilingSalary) {
                philHealthBase = ceilingSalary;
              }
              
              // Calculate contributions
              calculatedAmount = parseFloat((philHealthBase * philHealthRate).toFixed(2));
              employerAmount = parseFloat((philHealthBase * philHealthEmployerRate).toFixed(2));
              
              calculationDetail = {
                calculationType: 'PHILHEALTH_2025',
                monthlyRate: payroll.monthlyRate,
                computationBase: philHealthBase,
                employeeRate: `${philHealthRate * 100}%`,
                employerRate: `${philHealthEmployerRate * 100}%`,
                employeeContribution: calculatedAmount,
                employerContribution: employerAmount,
                totalContribution: calculatedAmount + employerAmount
              };
              break;
              
            case GovernmentContributionType.PAGIBIG:
              // Pag-IBIG calculation based on 2025 rates
              const pagibigBaseSalary = Math.min(payroll.monthlyRate, itemType.maxAmount || 10000);
              
              // Employee rate depends on salary (1% if ≤ 1500, 2% otherwise)
              const employeePagibigRate = payroll.monthlyRate <= 1500 ? 
                (itemType.minContribution || 1) / 100 : 
                (itemType.maxContribution || 2) / 100;
                
              const employerPagibigRate = (itemType.employerPercentage || 2) / 100;
              
              calculatedAmount = parseFloat((pagibigBaseSalary * employeePagibigRate).toFixed(2));
              employerAmount = parseFloat((pagibigBaseSalary * employerPagibigRate).toFixed(2));
              
              calculationDetail = {
                calculationType: 'PAGIBIG_2025',
                monthlyRate: payroll.monthlyRate,
                computationBase: pagibigBaseSalary,
                employeeRate: `${employeePagibigRate * 100}%`,
                employerRate: `${employerPagibigRate * 100}%`,
                employeeContribution: calculatedAmount,
                employerContribution: employerAmount,
                totalContribution: calculatedAmount + employerAmount
              };
              break;
              
            case GovernmentContributionType.TAX:
              // Withholding tax calculation based on TRAIN Law
              // Compute annual taxable income from monthly
              const annualTaxableIncome = payroll.taxableIncome * 12;
              
              // Apply tax table
              let annualTax = 0;
              
              if (annualTaxableIncome <= 250000) {
                annualTax = 0;
              } else if (annualTaxableIncome <= 400000) {
                annualTax = (annualTaxableIncome - 250000) * 0.2;
              } else if (annualTaxableIncome <= 800000) {
                annualTax = 30000 + (annualTaxableIncome - 400000) * 0.25;
              } else if (annualTaxableIncome <= 2000000) {
                annualTax = 130000 + (annualTaxableIncome - 800000) * 0.3;
              } else if (annualTaxableIncome <= 8000000) {
                annualTax = 490000 + (annualTaxableIncome - 2000000) * 0.32;
              } else {
                annualTax = 2410000 + (annualTaxableIncome - 8000000) * 0.35;
              }
              
              // Get monthly tax
              calculatedAmount = parseFloat((annualTax / 12).toFixed(2));
              
              calculationDetail = {
                calculationType: 'WITHHOLDING_TAX_2025',
                monthlyTaxableIncome: payroll.taxableIncome,
                annualTaxableIncome: annualTaxableIncome,
                annualTax: annualTax,
                monthlyTax: calculatedAmount
              };
              break;
          }
        } else if (itemType.type === 'fixed') {
          // For fixed type items
          calculatedAmount = itemType.defaultAmount || 0;
          calculationDetail = {
            source: 'default_amount',
            amount: calculatedAmount
          };
        } else if (itemType.type === 'formula') {
          // For formula types without actual formula in entity, 
          // use percentage-based calculation on monthly rate
          if (itemType.percentage) {
            calculatedAmount = parseFloat(((payroll.monthlyRate * itemType.percentage) / 100).toFixed(2));
            
            calculationDetail = {
              source: 'percentage_calculation',
              baseAmount: payroll.monthlyRate,
              percentage: `${itemType.percentage}%`,
              result: calculatedAmount
            };
            
            // Calculate employer share if applicable
            if (itemType.employerPercentage) {
              employerAmount = parseFloat(((payroll.monthlyRate * itemType.employerPercentage) / 100).toFixed(2));
              
              calculationDetail.employerCalculation = {
                percentage: `${itemType.employerPercentage}%`,
                baseAmount: payroll.monthlyRate,
                result: employerAmount
              };
            }
          } else {
            // Fallback to default amount if no percentage
            calculatedAmount = itemType.defaultAmount || 0;
            calculationDetail = {
              source: 'default_amount',
              amount: calculatedAmount
            };
          }
        }
      }
      
      // Set calculated amounts
      payrollItem.amount = calculatedAmount;
      payrollItem.employerAmount = employerAmount;
      
      // Save to log
      calculationLog.push({
        id: itemType.id,
        name: itemType.name,
        category: itemType.category,
        amount: calculatedAmount,
        employerAmount,
        details: calculationDetail
      });
      
      // Add to return array
      newPayrollItems.push(payrollItem);
    }
  }
  
  // Save calculated totals and details
  payroll.calculationDetails = {
    items: calculationLog,
    original: originalValues,
    final: {
      grossPay: payroll.grossPay,
      taxableIncome: payroll.taxableIncome,
      totalAllowances: payroll.totalAllowances,
      totalBonuses: payroll.totalBonuses,
      totalBenefits: payroll.totalBenefits,
      totalDeductions: payroll.totalDeductions,
      totalGovernmentContributions: payroll.totalGovernmentContributions,
      totalTaxes: payroll.totalTaxes,
      netPay: payroll.netPay
    }
  };
  
  return newPayrollItems;
}

  /**
 * Generate a detailed view of a payroll for an employee
 */
async getPayrollDetails(payrollId: string): Promise<any> {
  const payroll = await this.findOneByOrFail({ id: payrollId }, {
    relations: {
      employee: {
        user: {
          profile: true
        },
        roles: {
          department: true,
          branch: true,
          organization: true,
        }
      },
      cutoff: true,
      payrollItems: {
        payrollItemType: true
      }
    }
  });

  // Get the employee's highest scope role
  const highestRole = this.getHighestScopeRole(payroll.employee.roles || []);
  
  // Determine organizational position based on roles and entity relationships
  const position = this.determineEmployeePosition(payroll.employee);
  
  // Get government contributions using the entity's getter methods
  const sssContribution = payroll.sssContribution;
  const philHealthContribution = payroll.philHealthContribution;
  const pagIbigContribution = payroll.pagIbigContribution;
  const withHoldingTax = payroll.withHoldingTax;
  
  // Group items by category for display
  const itemsByCategory = this.groupPayrollItemsByCategory(payroll.payrollItems || []);
  
  // Format dates
  const startDate = payroll.cutoff.startDate.toLocaleDateString();
  const endDate = payroll.cutoff.endDate.toLocaleDateString();
  
  return {
    payrollId: payroll.id,
    employee: {
      id: payroll.employee.id,
      name: `${payroll.employee.user.profile?.firstName} ${payroll.employee.user.profile?.lastName}`,
      employeeNumber: payroll.employee.employeeNumber,
      position: position,
      department: highestRole?.department?.name || 'N/A',
      branch: highestRole?.branch?.name || 'N/A',
      organization: highestRole?.organization?.name || 'N/A',
    },
    cutoff: {
      id: payroll.cutoff.id,
      period: `${startDate} - ${endDate}`,
      type: payroll.cutoff.cutoffType
    },
    rates: {
      monthly: payroll.monthlyRate,
      daily: payroll.dailyRate,
      hourly: payroll.hourlyRate
    },
    workHours: {
      regular: payroll.totalRegularHours,
      overtime: payroll.totalOvertimeHours,
      holiday: payroll.totalHolidayHours,
      specialHoliday: payroll.totalSpecialHolidayHours,
      restDay: payroll.totalRestDayHours,
      nightDifferential: payroll.totalNightDifferentialHours,
      holidayOvertime: payroll.totalHolidayOvertimeHours,
      specialHolidayOvertime: payroll.totalSpecialHolidayOvertimeHours,
      restDayOvertime: payroll.totalRestDayOvertimeHours,
      total: (
        payroll.totalRegularHours + 
        payroll.totalOvertimeHours + 
        payroll.totalHolidayHours +
        payroll.totalSpecialHolidayHours +
        payroll.totalRestDayHours +
        payroll.totalHolidayOvertimeHours +
        payroll.totalSpecialHolidayOvertimeHours +
        payroll.totalRestDayOvertimeHours
      )
    },
    earnings: {
      basicPay: payroll.basicPay,
      overtimePay: payroll.overtimePay,
      holidayPay: payroll.holidayPay,
      holidayOvertimePay: payroll.holidayOvertimePay,
      specialHolidayPay: payroll.specialHolidayPay,
      specialHolidayOvertimePay: payroll.specialHolidayOvertimePay,
      restDayPay: payroll.restDayPay,
      restDayOvertimePay: payroll.restDayOvertimePay,
      nightDifferentialPay: payroll.nightDifferentialPay,
      allowances: itemsByCategory[PayrollItemCategory.ALLOWANCE] || [],
      bonuses: itemsByCategory[PayrollItemCategory.BONUS] || [],
      commissions: itemsByCategory[PayrollItemCategory.COMMISSION] || [],
      tips: itemsByCategory[PayrollItemCategory.TIP] || [],
    },
    deductions: {
      governmentContributions: {
        sss: {
          employee: sssContribution.employee,
          employer: sssContribution.employer,
          total: sssContribution.total
        },
        philhealth: {
          employee: philHealthContribution.employee,
          employer: philHealthContribution.employer,
          total: philHealthContribution.total
        },
        pagibig: {
          employee: pagIbigContribution.employee,
          employer: pagIbigContribution.employer,
          total: pagIbigContribution.total
        },
        tax: withHoldingTax
      },
      otherDeductions: itemsByCategory[PayrollItemCategory.DEDUCTION] || []
    },
    totals: {
      grossPay: payroll.grossPay,
      taxableIncome: payroll.taxableIncome,
      totalDeductions: (
        payroll.totalDeductions + 
        payroll.totalGovernmentContributions + 
        payroll.totalTaxes
      ),
      netPay: payroll.netPay
    },
    benefits: itemsByCategory[PayrollItemCategory.BENEFIT] || [],
    reimbursements: itemsByCategory[PayrollItemCategory.REIMBURSEMENT] || [],
    status: payroll.status,
    paymentDetails: {
      method: payroll.paymentMethod,
      bankAccount: payroll.bankAccount,
      checkNumber: payroll.checkNumber,
      referenceNumber: payroll.bankReferenceNumber,
      paymentDate: payroll.paymentDate?.toLocaleDateString(),
    },
    processing: {
      processedAt: payroll.processedAt?.toLocaleDateString(),
      processedBy: payroll.processedBy,
      approvedAt: payroll.approvedAt?.toLocaleDateString(),
      approvedBy: payroll.approvedBy,
      releasedAt: payroll.releasedAt?.toLocaleDateString(),
      releasedBy: payroll.releasedBy,
    },
    notes: payroll.notes,
  };
}

/**
 * Get the highest scope role from the employee's roles
 */
private getHighestScopeRole(roles: Role[]): Role | undefined {
  if (!roles.length) return undefined;
  
  // Define scope priority (higher number = higher priority)
  const scopePriority: Record<RoleScopeType, number> = {
    [RoleScopeType.GLOBAL]: 5,
    [RoleScopeType.ORGANIZATION]: 4,
    [RoleScopeType.BRANCH]: 3,
    [RoleScopeType.DEPARTMENT]: 2,
    [RoleScopeType.OWNED]: 1
  };
  
  // Sort roles by scope priority (highest first)
  const sortedRoles = [...roles].sort((a, b) => 
    scopePriority[b.scope] - scopePriority[a.scope]
  );
  
  return sortedRoles[0];
}

/**
 * Determine the employee's position based on roles and organizational relationships
 */
private determineEmployeePosition(employee: Employee): string {
  if (!employee.roles || employee.roles.length === 0) {
    return 'Staff';
  }
  
  const highestRole = this.getHighestScopeRole(employee.roles);
  
  if (!highestRole) return 'Staff';
  
  // Construct position based on role scope and name
  let positionPrefix = '';
  
  switch (highestRole.scope) {
    case RoleScopeType.GLOBAL:
      positionPrefix = 'Executive';
      break;
    case RoleScopeType.ORGANIZATION:
      positionPrefix = highestRole.organization?.name || 'Organizational';
      break;
    case RoleScopeType.BRANCH:
      positionPrefix = highestRole.branch?.name || 'Branch';
      break;
    case RoleScopeType.DEPARTMENT:
      positionPrefix = highestRole.department?.name || 'Department';
      break;
    case RoleScopeType.OWNED:
      positionPrefix = 'Team';
      break;
  }
  
  return `${positionPrefix} ${highestRole.name}`;
}
  /**
   * Helper method to group payroll items by category
   */
  private groupPayrollItemsByCategory(
    payrollItems: PayrollItem[]
  ): Record<PayrollItemCategory, any[]> {
    const result: Record<string, any[]> = {};
    
    payrollItems.forEach(item => {
      const category = item.payrollItemType.category;
      
      if (!result[category]) {
        result[category] = [];
      }
      
      result[category].push({
        id: item.id,
        name: item.payrollItemType.name,
        amount: item.amount,
        employerAmount: item.employerAmount || 0,
        total: item.amount + (item.employerAmount || 0),
        govType: item.payrollItemType.governmentContributionType,
        description: item.payrollItemType.description
      });
    });
    
    return result;
  }
  
  /**
   * Process payroll for a single employee
   */
  async processPayrollForEmployee(
    employeeId: string,
    cutoffId: string,
    userId: string
  ): Promise<Payroll> {
    return this.dataSource.transaction(async transactionManager => {
      // Check if payroll already exists for this employee and cutoff
      const existingPayroll = await transactionManager.findOne(Payroll, {
        where: {
          employee: { id: employeeId },
          cutoff: { id: cutoffId }
        },
        relations: {
          employee: true,
          cutoff: true,
          payrollItems: {
            payrollItemType: true
          }
        }
      });

      // Get employee and cutoff data
      const employee = await this.employeesService.findOneByOrFail({ id: employeeId });
      const cutoff = await this.cutoffsService.findOneByOrFail({ id: cutoffId });
      
      // Get base compensation
      const baseCompensation = await this.employeePayrollItemTypesService.getEmployeeBaseCompensation(employeeId);
      if (!baseCompensation) {
        throw new BadRequestException(`No base compensation defined for employee ${employeeId}. Please define employee's base compensation first.`);
      }
      
      // If exists and already processed, prevent re-processing
      if (existingPayroll && existingPayroll.status === PayrollStatus.RELEASED) {
        throw new BadRequestException(
          `Payroll for employee ${employee.id} for cutoff ${cutoff.id} has already been released and cannot be reprocessed`
        );
      }
      
      // if (cutoff.status !== CutoffStatus.PROCESSING) {
      //   throw new BadRequestException('Cutoff is not in processing status');
      // }

      // Get final work hours for this employee and cutoff
      const finalWorkHours = await this.finalWorkHoursService.getRepository().findBy({
        employee: { id: employeeId },
        cutoff: { id: cutoffId },
        isApproved: true,
      });
      
      if (!finalWorkHours.length) {
        throw new BadRequestException(`No approved work hours found for employee ${employeeId} in cutoff ${cutoffId}`);
      }
      
      // Use existing payroll or create new one
      const payroll = existingPayroll || new Payroll({});
      
      // Set core properties
      payroll.employee = employee;
      payroll.cutoff = cutoff;
      payroll.status = PayrollStatus.PROCESSING;

      
      // Calculate basic pay from work hours
      await this.calculateBasicPay(payroll, finalWorkHours);

      
      // Save payroll to get an ID if new
      const savedPayroll = await transactionManager.save(payroll);
      
      // Process all payroll items
      // const payrollItems = await this.processPayrollItems(savedPayroll, userId);
      // savedPayroll.payrollItems = payrollItems;

      
      // // Mark work hours as processed
      // for (const workHour of finalWorkHours) {
      //   await this.finalWorkHoursService.update(
      //     workHour.id, 
      //     { isProcessed: true },
      //     userId
      //   );
      // }
      
      // Finalize payroll
      savedPayroll.processedAt = new Date();
      savedPayroll.processedBy = userId;
      
      // Save the final payroll
      return await transactionManager.save(savedPayroll);
    });
  }
  
  /**
   * Process payroll for all eligible employees in a cutoff
   */
  async processPayrollForCutoff(cutoffId: string, userId: string): Promise<Payroll[]> {
    const cutoff = await this.cutoffsService.findOneByOrFail({ id: cutoffId });
    
    if (cutoff.status !== CutoffStatus.PENDING) {
      throw new BadRequestException('Cutoff is not in pending status');
    }
    
    // Get all employees with approved work hours for this cutoff
    const workHours = await this.finalWorkHoursService.getRepository().findBy({
      cutoff: { id: cutoffId },
      isApproved: true,
      isProcessed: false
    });
    
    if (!workHours.length) {
      throw new BadRequestException('No approved work hours found for this cutoff period');
    }
    
    // Get unique employee IDs
    const employeeIds = [...new Set(workHours.map(wh => wh.employee.id))];
    
    // Process payroll for each employee
    const payrolls: Payroll[] = [];
    const errors: { employeeId: string; error: string }[] = [];
    
    for (const employeeId of employeeIds) {
      try {
        const payroll = await this.processPayrollForEmployee(employeeId, cutoffId, userId);
        payrolls.push(payroll);
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(`Error processing payroll for employee ${employeeId}: ${error.message}`, error.stack);
          errors.push({ employeeId, error: error.message });
        } else {
          this.logger.error(`Error processing payroll for employee ${employeeId}: ${String(error)}`);
          errors.push({ employeeId, error: String(error) });
        }
      }
    }
    
    this.logger.log(`Processed ${payrolls.length} payrolls successfully. ${errors.length} errors.`);
    
    return payrolls;
  }
  
  /**
   * Generate payslip data for a specific payroll
   */
  async generatePayslipData(payrollId: string): Promise<any> {
    const payroll = await this.findOneBy({ id: payrollId }, {
      relations: {
        employee: true,
        cutoff: true,
        payrollItems: {
          payrollItemType: true
        }
      }
    });
    
    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${payrollId} not found`);
    }
    
    // Group payroll items by category for organized display
    const itemsByCategory: Record<string, any[]> = {};
    
    for (const item of payroll.payrollItems || []) {
      const category = item.payrollItemType.category;
      
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      
      itemsByCategory[category].push({
        name: item.payrollItemType.name,
        amount: item.amount,
      });
    }
    
    // Format dates
    const startDate = payroll.cutoff.startDate.toLocaleDateString();
    const endDate = payroll.cutoff.endDate.toLocaleDateString();
    
    // Build payslip data
    return {
      employee: {
        name: `${payroll.employee.user.profile?.firstName} ${payroll.employee.user.profile?.lastName}`,
        employeeNumber: payroll.employee.employeeNumber,
        // position: payroll.employee.roles?.name || '',
        // department: payroll.employee.departmentId?.name || ''
      },
      payPeriod: `${startDate} - ${endDate}`,
      rates: {
        monthly: payroll.monthlyRate,
        daily: payroll.dailyRate,
        hourly: payroll.hourlyRate
      },
      workHours: {
        regular: payroll.totalRegularHours,
        overtime: payroll.totalOvertimeHours,
        holiday: payroll.totalHolidayHours,
        restDay: payroll.totalRestDayHours,
        nightDifferential: payroll.totalNightDifferentialHours
      },
      earnings: {
        basicPay: payroll.basicPay,
        overtimePay: payroll.overtimePay,
        holidayPay: payroll.holidayPay,
        restDayPay: payroll.restDayPay,
        nightDifferentialPay: payroll.nightDifferentialPay,
        allowances: itemsByCategory[PayrollItemCategory.ALLOWANCE] || [],
        bonuses: itemsByCategory[PayrollItemCategory.BONUS] || [],
        commissions: itemsByCategory[PayrollItemCategory.COMMISSION] || [],
        tips: itemsByCategory[PayrollItemCategory.TIP] || [],
        others: itemsByCategory[PayrollItemCategory.OTHER] || []
      },
      deductions: {
        taxes: itemsByCategory[PayrollItemCategory.TAX] || [],
        governmentContributions: payroll.payrollItems?.filter(
          item => item.payrollItemType.governmentContributionType
        ).map(item => ({
          name: item.payrollItemType.name,
          amount: item.amount,
          employerAmount: item.employerAmount || 0,
          total: item.amount + (item.employerAmount || 0)
        })) || [],
        otherDeductions: itemsByCategory[PayrollItemCategory.DEDUCTION] || []
      },
      totals: {
        grossPay: payroll.grossPay,
        totalDeductions: payroll.totalDeductions + 
                        payroll.totalGovernmentContributions + 
                        payroll.totalTaxes,
        netPay: payroll.netPay
      },
      benefits: itemsByCategory[PayrollItemCategory.BENEFIT] || [],
      reimbursements: itemsByCategory[PayrollItemCategory.REIMBURSEMENT] || [],
      year: new Date().getFullYear(),
      payrollDate: payroll.processedAt?.toLocaleDateString() || new Date().toLocaleDateString()
    };
  }
}