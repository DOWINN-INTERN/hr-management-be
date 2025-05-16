import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { CutoffStatus } from '@/common/enums/cutoff-status.enum';
import { CutoffType } from '@/common/enums/cutoff-type.enum';
import { GovernmentMandatedType } from '@/common/enums/government-contribution-type.enum';
import { Occurrence } from '@/common/enums/occurrence.enum';
import { PayrollItemCategory } from '@/common/enums/payroll-item-category.enum';
import { PayrollStatus } from '@/common/enums/payroll-status.enum';
import { RequestStatus } from '@/common/enums/request-status.enum';
import { UtilityHelper } from '@/common/helpers/utility.helper';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { FinalWorkHour } from '@/modules/attendance-management/final-work-hours/entities/final-work-hour.entity';
import { FinalWorkHoursService } from '@/modules/attendance-management/final-work-hours/final-work-hours.service';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type } from 'os';
import { DataSource, LessThan, MoreThan, Repository } from 'typeorm';
import { WorkTimeRequestsService } from '../attendance-management/work-time-requests/work-time-requests.service';
import { EmployeePayrollItemTypesService } from '../employee-management/employee-payroll-item-types/employee-payroll-item-types.service';
import { EmployeesService } from '../employee-management/employees.service';
import { CutoffsService } from './cutoffs/cutoffs.service';
import { Cutoff } from './cutoffs/entities/cutoff.entity';
import { Payroll } from './entities/payroll.entity';
import { PayrollItemType } from './payroll-item-types/entities/payroll-item-type.entity';
import { PayrollItemTypesService } from './payroll-item-types/payroll-item-types.service';
import { PayrollItem } from './payroll-items/entities/payroll-item.entity';
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
  private readonly BaseAmount: 'grossPay' | 'monthlyRate' = 'monthlyRate';

  constructor(
    @InjectRepository(Payroll)
    private readonly payrollsRepository: Repository<Payroll>,
    private readonly dataSource: DataSource,
    private readonly employeesService: EmployeesService,
    private readonly cutoffsService: CutoffsService,
    private readonly finalWorkHoursService: FinalWorkHoursService,
    private readonly employeePayrollItemTypesService: EmployeePayrollItemTypesService,
    private readonly payrollItemTypesService: PayrollItemTypesService,
    protected readonly usersService: UsersService,
    private readonly workTimeRequestsService: WorkTimeRequestsService,
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
    // Compute annual taxable income from monthly
    const annualTaxableIncome = monthlyTaxableIncome * 12;
    
    // Apply 2025 tax table
    let annualTax = 0;
    
    if (annualTaxableIncome <= 250000) {
      annualTax = 0; // Exempt
    } else if (annualTaxableIncome <= 400000) {
      annualTax = (annualTaxableIncome - 250000) * 0.15; // 15% of excess over 250,000
    } else if (annualTaxableIncome <= 800000) {
      annualTax = 22500 + (annualTaxableIncome - 400000) * 0.2; // 22,500 + 20% of excess over 400,000
    } else if (annualTaxableIncome <= 2000000) {
      annualTax = 102500 + (annualTaxableIncome - 800000) * 0.25; // 102,500 + 25% of excess over 800,000
    } else if (annualTaxableIncome <= 8000000) {
      annualTax = 402500 + (annualTaxableIncome - 2000000) * 0.3; // 402,500 + 30% of excess over 2,000,000
    } else {
      annualTax = 2202500 + (annualTaxableIncome - 8000000) * 0.35; // 2,202,500 + 35% of excess over 8,000,000
    }
    
    // Get monthly tax
    const calculatedAmount = parseFloat((annualTax / 12).toFixed(2));
    
    const calculationDetail: WithholdingTaxCalculationDetails = {
      calculationType: 'WITHHOLDING_TAX',
      monthlyTaxableIncome: monthlyTaxableIncome,
      annualTaxableIncome: annualTaxableIncome,
      annualTax: annualTax,
      monthlyTax: calculatedAmount
    };

    return { calculatedAmount, calculationDetail };
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
    payroll.totalBasicDeductions = payroll.absences + payroll.tardiness + payroll.undertime
      + payroll.noTimeIn + payroll.noTimeOut;
    
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
    payroll.netPay = payroll.grossPay;
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
      // Find the first cutoff payroll in the same month
      const firstCutoffDate = new Date(cutoff.startDate);
      firstCutoffDate.setDate(1); // Set to first day of month
      
      const previousPayroll = await this.payrollsRepository.findOne({
        where: {
          employee: { id: payroll.employee.id },
          cutoff: {
            cutoffNumber: cutoff.cutoffNumber - 1,
          },
          status: PayrollStatus.RELEASED
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

        // Skip if not applicable for this employee
        // Only process required items or items that have employee-specific configuration
        if (!employeeItemConfig || employeeItemConfig.exempted || (itemType.processEvery && cutoff.cutoffPlace !== itemType.processEvery)) {
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
                  status: PayrollStatus.RELEASED
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
          payrollItems: {
            payrollItemType: true
          }
        }
      });

      // Get employee and cutoff data
      const employee = await this.employeesService.findOneByOrFail({ id: employeeId });
      const cutoff = await this.cutoffsService.findOneByOrFail({ id: cutoffId });

      // If exists and already processed, prevent re-processing
      if (existingPayroll && existingPayroll.status === PayrollStatus.RELEASED) {
        throw new BadRequestException(
          `Payroll for employee ${employee.id} for cutoff ${cutoff.id} has already been released and cannot be reprocessed`
        );
      }
      
      // Get base compensation
      const baseCompensation = await this.employeePayrollItemTypesService.getEmployeeBaseCompensation(employeeId);
      if (!baseCompensation) {
        throw new BadRequestException(`No base compensation defined for employee ${employeeId}. Please define employee's base compensation first.`);
      }

      // Check if there is pending overtime work time requests for this employee
      const pendingWorkTimeRequests = await this.workTimeRequestsService.getRepository().find({
        where: {
          employee: { id: employeeId },
          status: RequestStatus.PENDING,
          type: AttendanceStatus.OVERTIME,
          cutoff: { id: cutoffId }
        }
      });

      if (pendingWorkTimeRequests.length > 0) {
        // could prevent process or just change payroll status to error
        throw new BadRequestException(`There are pending overtime work time requests for employee ${employeeId}. Please approve or reject them first.`);
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
      const payroll = new Payroll({});
      
      // Set core properties
      payroll.employee = employee;
      payroll.cutoff = cutoff;
      payroll.status = PayrollStatus.PROCESSING;

      
      // Calculate basic pay from work hours
      await this.calculateBasicPay(payroll, finalWorkHours);

      
      // Save payroll to get an ID if new
      const savedPayroll = await transactionManager.save(payroll);
      
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
    const payroll = await this.findOneByOrFail({ id: payrollId }, {
      relations: {
        employee: {
          user: {
            profile: true
          },
          roles: true
        },
        cutoff: true,
        payrollItems: {
          payrollItemType: true
        }
      }
    });

    // Get the employee's highest scope role
    const highestRole = UtilityHelper.determineEffectiveScope(payroll.employee.roles || []);

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
        holidayOvertime: payroll.totalHolidayOvertimeHours,
        specialHoliday: payroll.totalSpecialHolidayHours,
        specialHolidayOvertime: payroll.totalSpecialHolidayOvertimeHours,
        restDay: payroll.totalRestDayHours,
        restDayOvertime: payroll.totalRestDayOvertimeHours,
        nightDifferential: payroll.totalNightDifferentialHours,
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
        tips: itemsByCategory[PayrollItemCategory.TIP] || [],
        others: itemsByCategory[PayrollItemCategory.OTHER] || []
      },
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
          philhealth: payroll.philHealthContribution.employee,
          pagibig: payroll.pagIbigContribution.employee,
          tax: payroll.withHoldingTax
        },
        otherDeductions: itemsByCategory[PayrollItemCategory.DEDUCTION].filter((item: PayrollItemType) => item.governmentMandatedType) || []
      },
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
}