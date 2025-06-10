import { Occurrence } from '@/common/enums/occurrence.enum';
import { CutoffStatus } from '@/common/enums/payroll/cutoff-status.enum';
import { CutoffType } from '@/common/enums/payroll/cutoff-type.enum';
import { GovernmentMandatedType } from '@/common/enums/payroll/government-contribution-type.enum';
import { PayrollItemCategory } from '@/common/enums/payroll/payroll-item-category.enum';
import { PayrollState } from '@/common/enums/payroll/payroll-state.enum';
import { UtilityHelper } from '@/common/helpers/utility.helper';
import { BaseService } from '@/common/services/base.service';
import { TransactionService } from '@/common/services/transaction.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { FinalWorkHour } from '@/modules/attendance-management/final-work-hours/entities/final-work-hour.entity';
import { FinalWorkHoursService } from '@/modules/attendance-management/final-work-hours/final-work-hours.service';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { type } from 'os';
import { In, IsNull, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { WorkTimeRequestsService } from '../attendance-management/work-time-requests/work-time-requests.service';
import { EmployeePayrollItemTypesService } from '../employee-management/employee-payroll-item-types/employee-payroll-item-types.service';
import { EmployeesService } from '../employee-management/employees.service';
import { CutoffsService } from './cutoffs/cutoffs.service';
import { Cutoff } from './cutoffs/entities/cutoff.entity';
import { RecalculateOptionsDto } from './dtos/recalculate-options.dto';
import { Payroll } from './entities/payroll.entity';
import { PayrollItemType } from './payroll-item-types/entities/payroll-item-type.entity';
import { PayrollItemTypesService } from './payroll-item-types/payroll-item-types.service';
import { PayrollItem } from './payroll-items/entities/payroll-item.entity';
import { PayrollStateMachine } from './services/payroll-state-machine.service';
import { CalculationDetails, PagIbigCalculationDetails, PhilHealthCalculationDetails, SSSCalculationDetails, WithholdingTaxCalculationDetails } from './types/calculation-details.type';

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
  private readonly NightDifferentialPayMultiplier = 1.1;
  private readonly NightDifferentialOvertimePayMultiplier = 1.35;
  private readonly BaseAmount: 'grossPay' | 'monthlyRate' = 'monthlyRate';

  constructor(
    @InjectRepository(Payroll)
    private readonly payrollsRepository: Repository<Payroll>,
    private readonly employeesService: EmployeesService,
    private readonly cutoffsService: CutoffsService,
    private readonly finalWorkHoursService: FinalWorkHoursService,
    private readonly employeePayrollItemTypesService: EmployeePayrollItemTypesService,
    private readonly payrollItemTypesService: PayrollItemTypesService,
    protected readonly usersService: UsersService,
    private readonly workTimeRequestsService: WorkTimeRequestsService,
    public readonly stateMachine: PayrollStateMachine,
    private readonly eventEmitter: EventEmitter2,
    protected readonly transactionService: TransactionService,
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
  private calculateSSSContribution(itemType: PayrollItemType, baseAmount: number) {
    // SSS calculation based on 2025 rates
    const sssEmployeeRate = (itemType.percentage || 5) / 100;
    const sssEmployerRate = (itemType.employerPercentage || 10) / 100;
    const mscCeiling = itemType.maxAmount || 35000;
    const mscFloor = itemType.minAmount || 5000;
    
    // Apply MSC ceiling based on gross pay
    let msc = Math.max(baseAmount, mscFloor);
    msc = Math.min(msc, mscCeiling);
    
    // Calculate employee and employer shares
    const calculatedAmount = parseFloat((msc * sssEmployeeRate).toFixed(2));
    let employerAmount = parseFloat((msc * sssEmployerRate).toFixed(2));
    
    // Add EC contribution (employer only)
    const ecContribution = msc <= (itemType.minContribution || 14500) ? 10 : 30;
    employerAmount += ecContribution;
    
    const calculationDetail: SSSCalculationDetails = {
      calculationType: 'SSS',
      baseAmount: baseAmount,
      msc: msc,
      employeeRate: `${sssEmployeeRate * 100}%`,
      employerRate: `${sssEmployerRate * 100}%`,
      employeeContribution: calculatedAmount,
      employerContribution: employerAmount,
      ecContribution: ecContribution,
      totalContribution: calculatedAmount + employerAmount
    };
  
    return { calculatedAmount, employerAmount, calculationDetail };
  }
  
  /**
   * Calculate withholding tax based on TRAIN Law
   */
  // Function to calculate withholding tax based on 2025 tax brackets
  private calculateWithholdingTax(monthlyTaxableIncome: number): {
    calculatedAmount: number;
    calculationDetail: WithholdingTaxCalculationDetails;
  } {
    // Convert monthly to annual taxable income
    const annualTaxableIncome = monthlyTaxableIncome * 12;
    
    // Apply 2025 TRAIN Law tax brackets (accurate rates and thresholds)
    let annualTax = 0;
    
    if (annualTaxableIncome <= 250000) {
      // First bracket: 0% for income up to ₱250,000
      annualTax = 0;
    } else if (annualTaxableIncome <= 400000) {
      // Second bracket: 15% of excess over ₱250,000
      annualTax = (annualTaxableIncome - 250000) * 0.15;
    } else if (annualTaxableIncome <= 800000) {
      // Third bracket: ₱22,500 + 20% of excess over ₱400,000
      annualTax = 22500 + (annualTaxableIncome - 400000) * 0.20;
    } else if (annualTaxableIncome <= 2000000) {
      // Fourth bracket: ₱102,500 + 25% of excess over ₱800,000
      annualTax = 102500 + (annualTaxableIncome - 800000) * 0.25;
    } else if (annualTaxableIncome <= 8000000) {
      // Fifth bracket: ₱402,500 + 30% of excess over ₱2,000,000
      annualTax = 402500 + (annualTaxableIncome - 2000000) * 0.30;
    } else {
      // Sixth bracket: ₱2,202,500 + 35% of excess over ₱8,000,000
      annualTax = 2202500 + (annualTaxableIncome - 8000000) * 0.35;
    }
    
    // Calculate monthly withholding tax
    // Round to 2 decimal places to avoid floating point precision issues
    const monthlyTax = Math.round((annualTax / 12) * 100) / 100;
    
    const calculationDetail: WithholdingTaxCalculationDetails = {
      calculationType: 'WITHHOLDING_TAX',
      monthlyTaxableIncome: monthlyTaxableIncome,
      annualTaxableIncome: annualTaxableIncome,
      annualTax: Math.round(annualTax * 100) / 100, // Round annual tax too
      monthlyTax: monthlyTax
    };

    return { 
      calculatedAmount: monthlyTax, 
      calculationDetail 
    };
  }

  /**
   * Calculates PhilHealth contributions based on 2025 rates
   * @param baseAmount Employee's base salary amount
   * @param itemType Configuration object with rates and thresholds
   * @returns Object containing calculated amounts and detailed breakdown
   */
  private calculatePhilHealthContribution(
    baseAmount: number,
    itemType: PayrollItemType
   ) {
    // PhilHealth calculation based on 2025 rates
    const philHealthRate = (itemType.percentage || 2.5) / 100; 
    const philHealthEmployerRate = (itemType.employerPercentage || 2.5) / 100;
    const floorSalary = itemType.minAmount || 10000;
    const ceilingSalary = itemType.maxAmount || 100000;
    
    // Apply floor and ceiling
    let philHealthBase = baseAmount;
    philHealthBase = Math.max(philHealthBase, floorSalary);
    philHealthBase = Math.min(philHealthBase, ceilingSalary);
    
    // Calculate contributions
    const calculatedAmount = parseFloat((philHealthBase * philHealthRate).toFixed(2));
    const employerAmount = parseFloat((philHealthBase * philHealthEmployerRate).toFixed(2));
    
    const calculationDetail: PhilHealthCalculationDetails = {
      calculationType: 'PHILHEALTH',
      baseAmount: baseAmount,
      computationBase: philHealthBase,
      employeeRate: `${philHealthRate * 100}%`,
      employerRate: `${philHealthEmployerRate * 100}%`,
      employeeContribution: calculatedAmount,
      employerContribution: employerAmount,
      totalContribution: calculatedAmount + employerAmount
    };

    return { calculatedAmount, employerAmount, calculationDetail };
  }

  /**
   * Calculates PAGIBIG contributions for both employee and employer
   * @param baseAmount The employee's base salary
   * @param itemType Configuration object containing rates and limits
   * @returns Object containing calculated amounts and detailed breakdown
   */
  private calculatePagibigContribution(baseAmount: number, itemType: PayrollItemType) {
    // Pag-IBIG calculation based on 2025 rates
    const pagibigBaseSalary = Math.min(baseAmount, itemType.maxAmount || 10000);
    
    // Employee rate depends on salary (1% if ≤ 1500, 2% otherwise)
    const employeePagibigRate = baseAmount <= (itemType.minAmount || 1500) ? 
      (itemType.minContribution || 1) / 100 : 
      (itemType.maxContribution || 2) / 100;
      
    const employerPagibigRate = (itemType.employerPercentage || 2) / 100;
    
    const calculatedAmount = parseFloat((pagibigBaseSalary * employeePagibigRate).toFixed(2));
    const employerAmount = parseFloat((pagibigBaseSalary * employerPagibigRate).toFixed(2));
    
    const calculationDetail: PagIbigCalculationDetails = {
      calculationType: 'PAGIBIG',
      baseAmount: baseAmount,
      computationBase: pagibigBaseSalary,
      employeeRate: `${employeePagibigRate * 100}%`,
      employerRate: `${employerPagibigRate * 100}%`,
      employeeContribution: calculatedAmount,
      employerContribution: employerAmount,
      totalContribution: calculatedAmount + employerAmount
    };

    return {
      calculatedAmount,
      employerAmount,
      calculationDetail
    };
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
    payroll.totalNightDifferentialOvertimeHours = 0;
    
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
    payroll.nightDifferentialOvertimePay = 0;

    // Reset deduction totals
    payroll.absences = 0;
    payroll.tardiness = 0;
    payroll.undertime = 0;
    payroll.noTimeIn = 0;
    payroll.noTimeOut = 0;

    payroll.totalBasicDeductions = 0;

    payroll.totalDeductions = 0;
    payroll.totalAllowances = 0;

    
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
      payroll.totalNightDifferentialOvertimeHours += +workHour.overtimeNightDifferentialHours || 0;
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

    // 9. Overtime night differential (1.35x)
    payroll.nightDifferentialOvertimePay = payroll.totalNightDifferentialOvertimeHours * payroll.hourlyRate * this.NightDifferentialOvertimePayMultiplier;

    // 10. Deduction hours
    payroll.absences = payroll.totalAbsentHours * payroll.hourlyRate;
    payroll.tardiness = payroll.totalTardinessHours * payroll.hourlyRate;
    payroll.undertime = payroll.totalUndertimeHours * payroll.hourlyRate;
    payroll.noTimeIn = payroll.totalNoTimeInHours * payroll.hourlyRate;
    payroll.noTimeOut = payroll.totalNoTimeOutHours * payroll.hourlyRate;
    payroll.totalBasicDeductions = payroll.absences + payroll.tardiness + payroll.undertime
      + payroll.noTimeIn + payroll.noTimeOut;

    payroll.totalDeductions = payroll.totalBasicDeductions;
    
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

    // 13. Initial net pay
    payroll.netPay = payroll.grossPay - payroll.totalDeductions;
  }
  
  /**
   * Process all payroll items for an employee
   */
  async processPayrollItems(payroll: Payroll, userId: string): Promise<PayrollItem[]> {
    // check if cutoff is available
    const { cutoff } = payroll;

    if (!cutoff) {
      throw new NotFoundException(`Cutoff not found for payroll ID: ${payroll.id}`);
    }

    // Get all payroll item types
    const allPayrollItemTypes = await this.payrollItemTypesService.getRepository().find({
      where: { isActive: true, isDeleted: false, includeInPayrollItemsProcessing: true },
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
        payrollItemType: true,
        employee: true
      }
    });

    // For government mandated contributions on second cutoff, get combined income
    let combinedGrossPay = payroll.grossPay;
    let combinedTaxableIncome = payroll.taxableIncome;

    if (cutoff.cutoffPlace === 2) {
      // log 
      this.logger.log(`Processing second cutoff payroll for employee ${payroll.employee.id} with gross pay ${payroll.grossPay} and taxable income ${payroll.taxableIncome}`);
      // Find the first cutoff payroll in the same month
      const firstCutoffDate = new Date(cutoff.startDate);
      firstCutoffDate.setDate(1); // Set to first day of month
      
      const previousPayroll = await this.payrollsRepository.findOne({
        where: {
          employee: { id: payroll.employee.id },
          cutoff: {
            cutoffNumber: cutoff.cutoffNumber - 1,
          },
          // status: PayrollStatus.RELEASED
        },
        relations: {
          employee: true,
          cutoff: true
        }
      });
      
      if (previousPayroll) {
        // Add the gross pay from the first cutoff
        combinedGrossPay += previousPayroll.grossPay;
        combinedTaxableIncome += previousPayroll.taxableIncome;
      }
    }

    // Check if employee has the required payroll item types
    const requiredPayrollItemTypes = allPayrollItemTypes.filter(item => item.isRequired);
    let missingRequiredItems = requiredPayrollItemTypes.filter(item =>
      !employeePayrollItems.some(empItem => empItem.payrollItemType.id === item.id)
    );

    if (missingRequiredItems.length > 0) {
      throw new BadRequestException(`Employee ${payroll.employee.id} is missing required payroll item types: ${missingRequiredItems.map(item => item.name).join(', ')}`);
    }
    
    // Map employee payroll items by payroll item type ID for quick lookup
    const employeePayrollItemMap = new Map(
      employeePayrollItems.map(item => [item.payrollItemType.id, item])
    );
    
    // Order for processing categories
    const processingOrder = [
      PayrollItemCategory.COMPENSATION,
      PayrollItemCategory.ADJUSTMENT,
      PayrollItemCategory.DEDUCTION,
      PayrollItemCategory.ALLOWANCE,
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

        // log
        this.logger.log(`Processing payroll item type: ${itemType.name} for employee ${payroll.employee.id} in category ${category}`);

        // Skip if not applicable for this employee
        // Only process required items or items that have employee-specific configuration
        if (!employeeItemConfig || !employeeItemConfig.isApplicable || (itemType.processEvery && cutoff.cutoffPlace !== itemType.processEvery)) {
          // log
          this.logger.log(`Skipping payroll item type: ${itemType.name} for employee ${payroll.employee.id} as it is not applicable or not configured.`);
          continue;
        }
        
        // Create new payroll item
        const payrollItem = new PayrollItem({});
        payrollItem.payrollItemType = itemType;
        payrollItem.employeePayrollItemType = employeeItemConfig;
        
        // Calculate item amount
        let calculatedAmount = employeeItemConfig.amount || itemType.defaultAmount || 0;
        let employerAmount: number | undefined;
        let calculationDetail: CalculationDetails | undefined;
        // the base amount for calculation gross or monthly rate
        const baseAmount = this.BaseAmount === 'grossPay' ? combinedGrossPay : payroll.monthlyRate;

        // Otherwise, calculate based on item type
        if (itemType.governmentMandatedType) {
          // log type
          this.logger.log(`Processing government mandated type: ${itemType.governmentMandatedType} for ${payroll.employee.id} for cutoff ${cutoff.cutoffNumber}`);
          // Calculate government contributions based on 2025 rates from the item type properties
          switch (itemType.governmentMandatedType) {
            case GovernmentMandatedType.SSS:
              const sssResult = this.calculateSSSContribution(itemType, baseAmount);
              calculatedAmount = sssResult.calculatedAmount;
              employerAmount = sssResult.employerAmount;
              calculationDetail = sssResult.calculationDetail;
              break;
              
            case GovernmentMandatedType.PHILHEALTH:
              const philHealthResult = this.calculatePhilHealthContribution(baseAmount, itemType);
              calculatedAmount = philHealthResult.calculatedAmount;
              employerAmount = philHealthResult.employerAmount;
              calculationDetail = philHealthResult.calculationDetail;
              break;
              
            case GovernmentMandatedType.PAGIBIG:
              const pagibigResult = this.calculatePagibigContribution(baseAmount, itemType);
              calculatedAmount = pagibigResult.calculatedAmount;
              employerAmount = pagibigResult.employerAmount;
              calculationDetail = pagibigResult.calculationDetail;
              break;
            case GovernmentMandatedType.THIRTEENTH_MONTH_PAY:
              // 13th month pay calculation
              // Check if it is december and first cutoff
              const isDecember = UtilityHelper.ensureDate(cutoff.startDate).getMonth() === 12;
              const isFirstCutoff = cutoff.cutoffPlace === 1;
              if (!isDecember || !isFirstCutoff) {
                // log that 13th month pay is not applicable
                this.logger.log(`13th month pay is not applicable for ${payroll.employee.id} for cutoff ${cutoff.cutoffNumber} as it is not the first cutoff of December.`);
                continue;
              }

              // Get all payroll net pay of the employee for the year
              const yearStartDate = new Date(cutoff.startDate.getFullYear(), 0, 1);
              const yearEndDate = new Date(cutoff.startDate.getFullYear(), 11, 31);
              const yearPayrolls = await this.payrollsRepository.find({
                where: {
                  employee: { id: payroll.employee.id },
                  cutoff: {
                    startDate: MoreThan(yearStartDate),
                    endDate: LessThan(yearEndDate)
                  },
                  state: PayrollState.PAID
                },
                relations: {
                  employee: true,
                  cutoff: true
                }
              });

              // Calculate total net pay for the year
              const totalNetPay = yearPayrolls.reduce((total, p) => total + p.netPay, 0);

              // Calculate 13th month pay
              calculatedAmount = parseFloat((totalNetPay / 12).toFixed(2));
              calculationDetail = {
                calculationType: 'THIRTEENTH_MONTH',
                totalNetPay: totalNetPay,
                thirteenthMonthPay: calculatedAmount
              };

              break;
            case GovernmentMandatedType.TAX:
              // Withholding tax calculation based on 2025 Tax Brackets
              const { calculatedAmount: taxAmount, calculationDetail: taxDetail } = this.calculateWithholdingTax(combinedTaxableIncome);
              calculatedAmount = taxAmount;
              calculationDetail = taxDetail;
              break;
          }
        } else if (itemType.type === 'fixed') {
          // For fixed type items
          calculatedAmount = employeeItemConfig.amount || itemType.defaultAmount || 0;
          calculationDetail = {
            calculationType: 'DEFAULT',
            amount: calculatedAmount
          };
        } else if (itemType.type === 'formula') {
          // // For formula types without actual formula in entity, 
          // // use percentage-based calculation on monthly rate
          // if (itemType.percentage) {
          //   calculatedAmount = parseFloat(((payroll.monthlyRate * itemType.percentage) / 100).toFixed(2));
            
          //   calculationDetail = {
          //     source: 'percentage_calculation',
          //     baseAmount: payroll.monthlyRate,
          //     percentage: `${itemType.percentage}%`,
          //     result: calculatedAmount
          //   };
            
          //   // Calculate employer share if applicable
          //   if (itemType.employerPercentage) {
          //     employerAmount = parseFloat(((payroll.monthlyRate * itemType.employerPercentage) / 100).toFixed(2));
              
          //     calculationDetail.employerCalculation = {
          //       percentage: `${itemType.employerPercentage}%`,
          //       baseAmount: payroll.monthlyRate,
          //       result: employerAmount
          //     };
          //   }
          // } else {
          //   // Fallback to default amount if no percentage
          //   calculatedAmount = itemType.defaultAmount || 0;
          //   calculationDetail = {
          //     source: 'default_amount',
          //     amount: calculatedAmount
          //   };
          // }
        }

        // log calculated ammount
        this.logger.log(`Calculated amount for ${itemType.name}: ${calculatedAmount}`);

        if (itemType.category === PayrollItemCategory.DEDUCTION) {
          // Deduct from net pay
          payroll.netPay -= Number(calculatedAmount);
          payroll.totalDeductions = (Number(payroll.totalDeductions) || 0) + Number(calculatedAmount);
        }
        else if (itemType.category === PayrollItemCategory.ALLOWANCE) {
          // Add to net pay
          payroll.netPay += Number(calculatedAmount);
          payroll.totalAllowances = (Number(payroll.totalAllowances) || 0) + Number(calculatedAmount);
        }
        else if (itemType.category === PayrollItemCategory.COMPENSATION) {
          // Add to gross pay
          payroll.grossPay += Number(calculatedAmount);
        }
        if (itemType.isTaxable) {
          // Add to taxable income
          const taxExempt = Number(itemType.taxExemptionAmount) || 0;
          payrollItem.taxableAmount = taxExempt <= calculatedAmount ? 
            Number(calculatedAmount) - taxExempt : 0;
          payroll.taxableIncome += Number(payrollItem.taxableAmount);
        }
        if (itemType.isTaxDeductible) {
          // Deduct from gross pay
          payroll.taxableIncome -= Number(calculatedAmount);
        }

        // Set calculated amounts
        payrollItem.amount = calculatedAmount;
        payrollItem.employerAmount = employerAmount;
        payrollItem.calculationDetails = calculationDetail;
        
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
        totalDeductions: payroll.totalDeductions,
        netPay: payroll.netPay
      }
    };
    
    return newPayrollItems;
  }
  
  /**
   * Process payroll for a single employee
   */
  async processPayrollForEmployee(
    employeeId: string,
    cutoffId: string,
    userId: string,
    batchId?: string,
  ): Promise<Payroll> {
    return this.transactionService.executeInTransaction(async (queryRunner) => {
      // Use queryRunner.manager instead of transactionManager
      const transactionManager = queryRunner.manager;
      // Check if payroll already exists for this employee and cutoff
      const existingPayroll = await transactionManager.findOne(Payroll, {
        where: {
          employee: { id: employeeId },
          cutoff: { id: cutoffId },
          state: Not(PayrollState.VOID)
        },
        relations: {
          payrollItems: {
            payrollItemType: true
          }
        }
      });

      // If payroll already exist prevent re-processing
      if (existingPayroll) {
        throw new ConflictException(`Payroll already exists for employee ${employeeId} for cutoff ${cutoffId}`);
      }

      // Get employee and cutoff data
      const employee = await this.employeesService.findOneByOrFail({ id: employeeId });
      const cutoff = await this.cutoffsService.findOneByOrFail({ id: cutoffId });

      // Get final work hours for this employee and cutoff
      const finalWorkHours = await this.finalWorkHoursService.getRepository().findBy({
        employee: { id: employeeId },
        cutoff: { id: cutoffId },
        isApproved: true,
      });
      
      if (!finalWorkHours.length) {
        throw new BadRequestException(`No approved work hours found for employee ${employeeId} in cutoff ${cutoffId}`);
      }
      
      // Get base compensation
      const baseCompensation = await this.employeePayrollItemTypesService.getEmployeeBaseCompensation(employeeId);
      if (!baseCompensation) {
        throw new BadRequestException(`No base compensation defined for employee ${employeeId}. Please define employee's base compensation first.`);
      }

      // // Check if there is pending overtime work time requests for this employee
      // const pendingWorkTimeRequests = await this.workTimeRequestsService.getRepository().find({
      //   where: {
      //     employee: { id: employeeId },
      //     status: RequestStatus.PENDING,
      //     type: AttendanceStatus.OVERTIME,
      //     cutoff: { id: cutoffId }
      //   }
      // });

      // if (pendingWorkTimeRequests.length > 0) {
      //   // could prevent process or just change payroll status to error
      //   throw new BadRequestException(`There are pending overtime work time requests for employee ${employeeId}. Please approve or reject them first.`);
      // }
      
      // if (cutoff.status !== CutoffStatus.PROCESSING) {
      //   throw new BadRequestException('Cutoff is not in processing status');
      // }

      let payroll: Payroll;
      
      // Create a new payroll if none exists
      payroll = new Payroll({});
      payroll.employee = employee;
      payroll.cutoff = cutoff;
      payroll.batchId = batchId;
      payroll.state = PayrollState.DRAFT;
      payroll.stateHistory = [];
  
      // Start calculation process
      const startSuccess = this.stateMachine.startCalculation(payroll);
      if (!startSuccess) {
        throw new BadRequestException(`Cannot start calculation for payroll in state ${payroll.state}`);
      }

      // Calculate basic pay from work hours
      await this.calculateBasicPay(payroll, finalWorkHours);

      // Save payroll to get an ID if new
      const savedPayroll = await transactionManager.save(Payroll, payroll);
      
      // In processPayrollForEmployee
      const payrollItems = await this.processPayrollItems(savedPayroll, userId);
      // Set the relationship properly
      payrollItems.forEach(item => {
        item.payroll = savedPayroll;
      });
      // Save items first
      await transactionManager.save(payrollItems);
      // Then set on payroll
      savedPayroll.payrollItems = payrollItems;
      
      // Finalize payroll
      savedPayroll.processedAt = new Date();
      savedPayroll.processedBy = userId;

      // complete calculation
      const completeSuccess = this.stateMachine.completeCalculation(savedPayroll);
      if (!completeSuccess) {
        throw new BadRequestException(`Cannot complete calculation for payroll in state ${savedPayroll.state}`);
      }
      
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
      // isProcessed: false
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
    const payroll = await this.findOneByOrFail({ id: payrollId }, {
      relations: {
        employee: {
          roles: {
            organization: true,
            department: true,
            branch: true
          },
          user: {
            profile: true
          },
        },
        cutoff: true,
        payrollItems: {
          payrollItemType: true
        }
      }
    });

    // check if state is not approve not archive
    if (![PayrollState.APPROVED, PayrollState.PAID, PayrollState.ARCHIVED].includes(payroll.state)) {
      throw new BadRequestException('Payroll must be approved, released, paid or archived to generate payslips');
    }

    // log employee roles
    this.logger.log(`Generating payslip for employee ${payroll.employee.id} with roles: ${payroll.employee.roles?.map(role => role.name).join(', ')}`);

    // Get the employee's highest scope role
    const highestRole = UtilityHelper.determineEffectiveScope(payroll.employee.roles || []);

    // log highest role
    this.logger.log(`Highest role for employee ${payroll.employee.id}: ${highestRole.name}`);

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
    const startDate = UtilityHelper.ensureDate(payroll.cutoff.startDate).toLocaleDateString();
    const endDate = UtilityHelper.ensureDate(payroll.cutoff.endDate).toLocaleDateString();

    const name = payroll.employee.user.profile?.fullName || payroll.employee.user.userName || payroll.employee.user.email;
    
    // Build payslip data
    return {
      employee: {
        name,
        employeeNumber: payroll.employee.employeeNumber,
        position: highestRole.name,
        department: highestRole?.department?.name || 'N/A',
        branch: highestRole?.branch?.name || 'N/A',
        organization: highestRole?.organization?.name || 'N/A',
      },
      cutoffPeriod: `${startDate} - ${endDate}`,
      rates: {
        monthly: payroll.monthlyRate,
        daily: payroll.dailyRate,
        hourly: payroll.hourlyRate
      },
      workHours: {
        regular: payroll.totalRegularHours,
        overtime: payroll.totalOvertimeHours,
        holiday: payroll.totalHolidayHours,
        holidayOvertime: payroll.totalHolidayOvertimeHours,
        specialHoliday: payroll.totalSpecialHolidayHours,
        specialHolidayOvertime: payroll.totalSpecialHolidayOvertimeHours,
        restDay: payroll.totalRestDayHours,
        restDayOvertime: payroll.totalRestDayOvertimeHours,
        nightDifferential: payroll.totalNightDifferentialHours,
        nightDifferentialOvertime: payroll.totalNightDifferentialOvertimeHours,
      },
      compensation: {
        basicPay: payroll.basicPay,
        overtimePay: payroll.overtimePay,
        holidayPay: payroll.holidayPay,
        holidayOvertimePay: payroll.holidayOvertimePay,
        specialHolidayPay: payroll.specialHolidayPay,
        specialHolidayOvertimePay: payroll.specialHolidayOvertimePay,
        restDayPay: payroll.restDayPay,
        restDayOvertimePay: payroll.restDayOvertimePay,
        nightDifferentialPay: payroll.nightDifferentialPay,
        nightDifferentialOvertimePay: payroll.nightDifferentialOvertimePay,
        adjustments: itemsByCategory[PayrollItemCategory.ADJUSTMENT] || [],
        others: itemsByCategory[PayrollItemCategory.COMPENSATION]?.filter((item: PayrollItemType) => !item.includeInPayrollItemsProcessing) || []
      },
      benefits: itemsByCategory[PayrollItemCategory.BENEFIT] || [],
      deductions: {
        basic: {
          absences: payroll.absences,
          tardiness: payroll.tardiness,
          undertime: payroll.undertime,
          noTimeIn: payroll.noTimeIn,
          noTimeOut: payroll.noTimeOut,
          total: payroll.totalBasicDeductions
        },
        governmentMandated: {
          sss: payroll.sssContribution.employee,
          philHealth: payroll.philHealthContribution.employee,
          pagIbig: payroll.pagIbigContribution.employee,
          withholdingTax: payroll.withholdingTax
        },
        others: itemsByCategory[PayrollItemCategory.DEDUCTION]?.filter((item: PayrollItemType) => item.governmentMandatedType) || []
      },
      allowances: itemsByCategory[PayrollItemCategory.ALLOWANCE] || [],
      totals: {
        grossPay: payroll.grossPay,
        totalDeductions: payroll.totalDeductions,
        totalAllowances: payroll.totalAllowances,
        taxableIncome: payroll.taxableIncome,
        netPay: payroll.netPay
      },
      year: new Date().getFullYear(),
      payrollDate: UtilityHelper.ensureDate(payroll.processedAt || new Date).toLocaleDateString()
    };
  }

  /**
   * Process payrolls in batches with optimized performance
   */
  async processPayrollBatch(
    cutoffId: string, 
    userId: string,
    batchId: string,
    batchSize = 50
  ): Promise<Payroll[]> {
    this.logger.log(`Processing payroll batch ${batchId} for cutoff ${cutoffId}`);
    
    const cutoff = await this.cutoffsService.findOneByOrFail({ id: cutoffId });
    
    // Get employees in optimized batches with reduced relations
    const workHours = await this.finalWorkHoursService.getRepository().find({
      where: {
        cutoff: { id: cutoffId },
        isApproved: true,
        // isProcessed: false, // can be used to filter unprocessed work hours
        payrollBatchId: batchId // Process only employees in this specific batch
      },
      relations: { employee: true },
      take: batchSize
    });
    
    if (!workHours.length) {
      throw new BadRequestException(`No approved work hours found for batch ${batchId} in cutoff ${cutoffId}`);
    }
    
    // Group by employee to prevent duplicate processing
    const employeeMap = new Map();
    workHours.forEach(wh => employeeMap.set(wh.employee.id, wh.employee));
    const employees = Array.from(employeeMap.values());
    
    // Process with connection pooling and transaction management
    const payrolls: Payroll[] = [];
    const failedEmployees: Array<{id: string, reason: string}> = [];
    let processedCount = 0;
    
    for (const employee of employees) {
      try {
        const payroll = await this.processPayrollForEmployee(
          employee.id,
          cutoffId,
          userId
        );
        payrolls.push(payroll);
        processedCount++;
        // // Mark work hours as processed
        // await this.finalWorkHoursService.getRepository().update(
        //   { employee: { id: employee.id }, cutoff: { id: cutoffId } },
        //   { isProcessed: true, processedAt: new Date(), processedBy: userId }
        // );
        
      } catch (error: any) {
        this.logger.error(
          `Failed to process payroll for employee ${employee.id}`,
          error.message
        );
        
        failedEmployees.push({
          id: employee.id,
          reason: error.message || 'Unknown error'
        });
      }
    }
    
    // Record failure metrics for monitoring
    if (failedEmployees.length > employees.length * 0.5) {
      // this.eventEmitter.emit('payroll.batch.partialFailure', {
      //   batchId,
      //   cutoffId,
      //   failedCount: failedEmployees.length,
      //   totalCount: employees.length,
      //   failedEmployees
      // });
      throw new Error(`Batch ${batchId} had too many failures: ${failedEmployees.length }/${employees.length}`);

      // if (failedCount > attendanceIds.length * 0.5) { // If more than 50% failed
      // }
    }
    if (processedCount === employees.length) {
      this.logger.log(
        `Batch ${batchId} processing completed. Success: ${payrolls.length}, Failed: ${failedEmployees.length}`
      );
    }
    else 
    {
      this.logger.warn(`Processed ${processedCount} out of ${employees.length} payrolls in batch ${batchId}`);
    }
    
    
    return payrolls;
  }

  /**
   * Divide employees into processing batches for parallel execution
   */
  async createProcessingBatches(
    cutoffId: string, 
    batchSize = 200
  ): Promise<Array<{batchId: string, employeeCount: number}>> {
    // Get all employees with work hours for this cutoff
    const result = await this.finalWorkHoursService.getRepository()
      .createQueryBuilder('workHour')
      .select('workHour.employeeId', 'employeeId')
      .addSelect('COUNT(*)', 'recordCount')
      .where('workHour.cutoffId = :cutoffId', { cutoffId })
      .andWhere('workHour.isApproved = :isApproved', { isApproved: true }) 
      // .andWhere('workHour.isProcessed = :isProcessed', { isProcessed: false })
      .groupBy('workHour.employeeId')
      .getRawMany();

    const totalEmployees = result.length;
    const batchCount = Math.ceil(totalEmployees / batchSize);
    const batches = [];
    
    // Create batch assignments
    for (let i = 0; i < batchCount; i++) {
      const start = i * batchSize;
      const end = Math.min((i + 1) * batchSize, totalEmployees);
      const batchEmployees = result.slice(start, end);
      const batchId = `${cutoffId}-batch-${i+1}`;
      
      // Assign batch ID to these work hours
      await this.finalWorkHoursService.getRepository().createQueryBuilder()
      .update()
      .set({ payrollBatchId: batchId })
      .where('employeeId IN (:...employeeIds)', { 
        employeeIds: batchEmployees.map(e => e.employeeId) 
      })
      .andWhere('cutoffId = :cutoffId', { cutoffId })
      .andWhere('isApproved = :isApproved', { isApproved: true })
      // .andWhere('isProcessed = :isProcessed', { isProcessed: false })
      .execute();
        
      batches.push({
        batchId,
        employeeCount: batchEmployees.length
      });
    }
    
    return batches;
  }

  /**
 * Get batch processing status for a specific cutoff
 */
async getBatchProcessingStatus(cutoffId: string): Promise<{
  status: string,
  processed: number,
  pending: number,
  failed: number,
  total: number,
  percentComplete: number,
  batchStatuses: Array<{
    batchId: string,
    status: string,
    processedCount: number,
    pendingCount: number,
    failedCount: number
  }>
}> {
  this.logger.log(`Getting batch processing status for cutoff ${cutoffId}`);
  
  // Get all payrolls for this cutoff
  const payrolls = await this.repository.find({
    where: { cutoff: { id: cutoffId } },
    relations: ['employee']
  });
  
  // Get all work hours with batch IDs for this cutoff
  const workHours = await this.finalWorkHoursService.getRepository().find({
    where: {
      cutoff: { id: cutoffId },
      isApproved: true,
      batchId: Not(IsNull())
    },
    relations: { employee: true }
  });
  
  // Extract unique batch IDs
  const batchIds = [...new Set(workHours
    .filter(wh => wh.batchId)
    .map(wh => wh.batchId))];
  
  // Count processing states
  const processed = payrolls.filter(p => 
    [
      PayrollState.PENDING_APPROVAL,
      PayrollState.APPROVED,
      PayrollState.PAID,
      PayrollState.ARCHIVED
    ].includes(p.state)
  ).length;
  
  const failed = payrolls.filter(p => 
    p.state === PayrollState.FAILED
  ).length;
  
  // Calculate employees with work hours but no payroll yet
  const employeesWithWorkHours = [...new Set(workHours.map(wh => wh.employee.id))];
  const employeesWithPayrolls = [...new Set(payrolls.map(p => p.employee.id))];
  
  const pending = employeesWithWorkHours.length - employeesWithPayrolls.length + 
    payrolls.filter(p => p.state === PayrollState.DRAFT ||
                         p.state === PayrollState.CALCULATING).length;
  
  const total = Math.max(employeesWithWorkHours.length, employeesWithPayrolls.length);
  
  // Calculate batch statuses
  const batchStatuses = batchIds.map(batchId => {
    const batchWorkHours = workHours.filter(wh => wh.batchId === batchId);
    const employeeIdsInBatch = [...new Set(batchWorkHours.map(wh => wh.employee.id))];
    
    const batchPayrolls = payrolls.filter(p => 
      employeeIdsInBatch.includes(p.employee.id)
    );
    
    const processedCount = batchPayrolls.filter(p => 
      [
        PayrollState.PENDING_APPROVAL,
        PayrollState.APPROVED,
        PayrollState.PAID,
        PayrollState.ARCHIVED
      ].includes(p.state)
    ).length;
    
    const failedCount = batchPayrolls.filter(p => 
      p.state === PayrollState.FAILED
    ).length;
    
    const pendingCount = employeeIdsInBatch.length - processedCount - failedCount;
    
    let status = 'Not Started';
    if (processedCount > 0 && processedCount < employeeIdsInBatch.length) {
      status = 'In Progress';
    } else if (processedCount === employeeIdsInBatch.length) {
      status = 'Completed';
    } else if (failedCount > 0) {
      status = 'Has Failures';
    }
    
    return {
      batchId,
      status,
      processedCount,
      pendingCount,
      failedCount
    };
  });
  
  // Calculate overall status
  let status = 'Not Started';
  if (processed > 0 && processed < total) {
    status = 'In Progress';
  } else if (processed === total && total > 0) {
    status = 'Completed';
  } else if (failed > 0) {
    status = 'Has Failures';
  }
  
  const percentComplete = total > 0 ? Math.round((processed / total) * 100) : 0;
  
  return {
    status,
    processed,
    pending,
    failed,
    total,
    percentComplete,
    batchStatuses
  };
}

/**
 * Get detailed audit trail for a payroll
 */
async getPayrollAudit(payrollId: string): Promise<{
  payrollId: string,
  stateHistory: any[],
  calculations: any,
  changes: any[]
}> {
  this.logger.log(`Getting audit trail for payroll ${payrollId}`);
  
  const payroll = await this.findOneByOrFail(
    { id: payrollId },
    { 
      relations: {
        employee: true,
        cutoff: true,
        payrollItems: { 
          payrollItemType: true 
        }
      }
    }
  );
  
  // Get the previous payroll for comparison if available
  const previousPayrolls = await this.repository.find({
    where: {
      employee: { id: payroll.employee.id },
      cutoff: { endDate: LessThan(payroll.cutoff.startDate) }
    },
    order: { cutoff: { endDate: 'DESC' } },
    take: 1
  });
  
  const previousPayroll = previousPayrolls.length > 0 ? previousPayrolls[0] : null;
  
  // Calculate changes if previous payroll exists
  const changes = [];
  if (previousPayroll) {
    const compareFields = [
      { field: 'grossPay', label: 'Gross Pay' },
      { field: 'netPay', label: 'Net Pay' },
      { field: 'basicPay', label: 'Basic Pay' },
      { field: 'totalDeductions', label: 'Total Deductions' },
      { field: 'totalAllowances', label: 'Total Allowances' }
    ];
    
    for (const { field, label } of compareFields) {
      const currentValue = Number(payroll[field as keyof Payroll]);
      const previousValue = Number(previousPayroll[field as keyof Payroll]);
      
      if (previousValue !== 0) {
        const percentChange = ((currentValue - previousValue) / previousValue) * 100;
        
        if (Math.abs(percentChange) > 5) { // Only record significant changes
          changes.push({
            field: label,
            previousValue,
            currentValue,
            difference: currentValue - previousValue,
            percentChange: Math.round(percentChange * 100) / 100
          });
        }
      }
    }
  }
  
  return {
    payrollId,
    stateHistory: payroll.stateHistory || [],
    calculations: payroll.calculationDetails || {},
    changes
  };
}

/**
 * Recalculate a payroll with options to preserve state and selectively update components
 */
async recalculatePayroll(
  id: string, 
  options: RecalculateOptionsDto,
  userId: string
): Promise<Payroll> {
  this.logger.log(`Recalculating payroll ${id} with options:`, options);
  
  const payroll = await this.findOneByOrFail(
    { id }, 
    { 
      relations: { 
        employee: true, 
        cutoff: true, 
        payrollItems: { 
          payrollItemType: true 
        } 
      }
    }
  );
  
  // Save original state if we need to preserve it
  const originalState = payroll.state;
  
  // Use the state machine to reset if not preserving state
  if (!options.preserveState) {
    if (!this.stateMachine.resetToDraft(payroll, 'Recalculation requested')) {
      throw new BadRequestException(
        `Cannot recalculate payroll in state ${payroll.state}`
      );
    }
  }
  
  // Get work hours for recalculation
  const workHours = await this.finalWorkHoursService.getRepository().findBy({
    employee: { id: payroll.employee.id },
    cutoff: { id: payroll.cutoff.id },
    isApproved: true
  });

  if (!workHours.length) {
    throw new BadRequestException('No approved work hours found for recalculation');
  }
  
  // Recalculate basic pay components (hours, rates, basic pay)
  await this.calculateBasicPay(payroll, workHours);
  
  // Filter payroll items based on recalculation options
  if (payroll.payrollItems?.length) {
    payroll.payrollItems = payroll.payrollItems.filter(item => {
      const category = item.payrollItemType.category;
      
      if (options.recalculateDeductions && 
        category === PayrollItemCategory.DEDUCTION) {
        return false; // Remove to recalculate
      }
      
      if (options.recalculateAllowances && 
        category === PayrollItemCategory.ALLOWANCE) {
        return false; // Remove to recalculate
      }
      
      return true; // Keep other items
    });
  }
  
  // Recalculate the payroll items
  const payrollItems = await this.processPayrollItems(payroll, userId);
  
  // Restore original state if preserving
  if (options.preserveState) {
    payroll.state = originalState;
  } else {
    // Mark as recalculated
    payroll.stateHistory?.push({
      from: PayrollState.DRAFT,
      to: PayrollState.PENDING_APPROVAL,
      timestamp: new Date(),
      note: `Recalculated by ${userId}`
    });
    payroll.state = PayrollState.PENDING_APPROVAL;
  }
  
  // Update processed information
  payroll.processedAt = new Date();
  payroll.processedBy = userId;
  payroll.payrollItems = payrollItems;
  payroll.organizationId = payroll.employee.organizationId;
  payroll.branchId = payroll.employee.branchId;
  payroll.departmentId = payroll.employee.departmentId;
  payroll.userId = payroll.employee.userId;

  // Save the updated payroll
  return await this.repository.save(payroll);
}

  /**
   * Smart re-processing of failed payrolls with metadata tracking
   */
  async retryFailedPayrolls(
    cutoffId: string,
    userId: string,
    options?: { 
      maxRetries?: number, 
      onlySpecificIds?: string[] 
    }
  ): Promise<{ 
    successful: number, 
    failed: number, 
    skipped: number,
    payrolls: Payroll[] 
  }> {
    const maxRetries = options?.maxRetries || 3;
    
    // Find payrolls that failed
    const failedPayrolls = await this.payrollsRepository.find({
      where: {
        cutoff: { id: cutoffId },
        state: PayrollState.FAILED,
        ...(options?.onlySpecificIds ? { id: In(options.onlySpecificIds) } : {}),
      },
      relations: ['employee', 'cutoff'],
    });
    
    this.logger.log(`Found ${failedPayrolls.length} failed payrolls to retry`);
    
    const result = { successful: 0, failed: 0, skipped: 0, payrolls: [] as Payroll[] };
    
    for (const payroll of failedPayrolls) {
      // Skip if exceeded max retries
      if ((payroll.stateHistory?.filter(h => h.to === PayrollState.FAILED).length || 0) >= maxRetries) {
        this.logger.warn(`Skipping payroll ${payroll.id} - exceeded max retries (${maxRetries})`);
        result.skipped++;
        continue;
      }
      
      try {
        // Reset and reprocess
        await this.stateMachine.resetToDraft(payroll, `Retry attempt ${new Date().toISOString()}`);
        await this.repository.save(payroll);
        
        const reprocessed = await this.processPayrollForEmployee(
          payroll.employee.id, 
          payroll.cutoff.id,
          userId
        );
        
        result.successful++;
        result.payrolls.push(reprocessed);
        
      } catch (error: any) {
        this.logger.error(`Failed to reprocess payroll ${payroll.id}`, error.stack);
        result.failed++;
      }
    }
    
    return result;
  }
}