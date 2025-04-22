import { CutoffStatus } from '@/common/enums/cutoff-status.enum';
import { CutoffType } from '@/common/enums/cutoff-type.enum';
import { PayrollItemCategory } from '@/common/enums/payroll-item-category.enum';
import { PayrollStatus } from '@/common/enums/payroll-status.enum';
import { UtilityHelper } from '@/common/helpers/utility.helper';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { FinalWorkHour } from '@/modules/attendance-management/final-work-hours/entities/final-work-hour.entity';
import { FinalWorkHoursService } from '@/modules/attendance-management/final-work-hours/final-work-hours.service';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { evaluate } from 'mathjs';
import { DataSource, Repository } from 'typeorm';
import { EmployeesService } from '../employee-management/employees.service';
import { Employee } from '../employee-management/entities/employee.entity';
import { CutoffsService } from './cutoffs/cutoffs.service';
import { Cutoff } from './cutoffs/entities/cutoff.entity';
import { Payroll } from './entities/payroll.entity';
import { PayrollItemTypesService } from './payroll-item-types/payroll-item-types.service';
import { PayrollItem } from './payroll-items/entities/payroll-item.entity';
import { PayrollItemsService } from './payroll-items/payroll-items.service';

@Injectable()
export class PayrollsService extends BaseService<Payroll> {
  protected readonly logger = new Logger(PayrollsService.name);
  private readonly RestDayPayMultiplier = 1.3;
  private readonly HolidayPayMultiplier = 2.0;
  private readonly SpecialHolidayPayMultiplier = 1.3;
  private readonly OvertimePayMultiplier = 1.25;
  private readonly HolidayOvertimePayMultiplier = 2.6;
  private readonly SpecialHolidayOvertimePayMultiplier = 1.69;
  private readonly RestDayOvertimePayMultiplier = 1.69;
  private readonly NightDifferentialPayMultiplier = 0.1;

  constructor(
    @InjectRepository(Payroll)
    private readonly payrollsRepository: Repository<Payroll>,
    private readonly dataSource: DataSource,
    private readonly employeesService: EmployeesService,
    private readonly cutoffsService: CutoffsService,
    private readonly finalWorkHoursService: FinalWorkHoursService,
    private readonly payrollItemsService: PayrollItemsService,
    private readonly payrollItemTypesService: PayrollItemTypesService,
    protected readonly usersService: UsersService
  ) {
    super(payrollsRepository, usersService);
  }

  /**
   * Calculate rates based on monthly salary and cutoff period
   */
  calculateRates(employee: Employee, cutoff: Cutoff): {
    monthlyRate: number;
    dailyRate: number;
    hourlyRate: number;
  } {
    const monthlyRate = employee.monthlyRate;
    const businessDaysInPeriod = UtilityHelper.getBusinessDays(cutoff.startDate, cutoff.endDate);
    const businessDaysInMonth = UtilityHelper.getBusinessDaysInMonth(cutoff.startDate);
    
    // Calculate daily rate based on cutoff type
    let dailyRate: number;
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
    
    // Standard 8-hour workday in Philippines
    const hourlyRate = dailyRate / 8;
    
    return { monthlyRate, dailyRate, hourlyRate };
  }
  
  /**
   * Calculate basic pay components from work hours
   */
  calculateBasicPay(payroll: Payroll, finalWorkHours: FinalWorkHour[]): void {
    const rates = this.calculateRates(payroll.employee, payroll.cutoff);
    
    // Set rates
    payroll.monthlyRate = rates.monthlyRate;
    payroll.dailyRate = rates.dailyRate;
    payroll.hourlyRate = rates.hourlyRate;
    
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
    
    // Process each work hour record
    for (const workHour of finalWorkHours) {
      // Aggregate regular hours
      payroll.totalRegularHours += +workHour.regularDayHours || 0;
      payroll.totalHolidayHours += +workHour.specialHolidayHours || 0; 
      payroll.totalSpecialHolidayHours += +workHour.regularHolidayHours || 0;
      payroll.totalRestDayHours += +workHour.restDayHours || 0;
      
      // Aggregate overtime hours
      payroll.totalOvertimeHours += +workHour.overtimeRegularDayHours || 0;
      payroll.totalHolidayOvertimeHours += +workHour.overtimeRegularHolidayHours || 0;
      payroll.totalSpecialHolidayOvertimeHours += +workHour.overtimeSpecialHolidayHours || 0;
      payroll.totalRestDayOvertimeHours += +workHour.overtimeRestDayHours || 0;
      
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

    // 7. Overtime special holiday pay (1.69x)
    payroll.specialHolidayOvertimePay = payroll.totalSpecialHolidayOvertimeHours * payroll.hourlyRate * this.SpecialHolidayOvertimePayMultiplier;

    // 8. Overtime rest day pay (1.69x)
    payroll.restDayOvertimePay = payroll.totalRestDayOvertimeHours * payroll.hourlyRate * this.RestDayOvertimePayMultiplier;
    
    // 9. Night differential (10% of hourly rate)
    payroll.nightDifferentialPay = payroll.totalNightDifferentialHours * payroll.hourlyRate * this.NightDifferentialPayMultiplier;
    
    // 10. Initial gross pay from basic components
    payroll.grossPay = payroll.basicPay + payroll.restDayPay + payroll.holidayPay
      + payroll.specialHolidayPay + payroll.overtimePay
      + payroll.holidayOvertimePay + payroll.specialHolidayOvertimePay
      + payroll.restDayOvertimePay + payroll.nightDifferentialPay;

    // 11. Total hours worked

    
    // 12. Initial taxable income (will be adjusted for non-taxable items)
    payroll.taxableIncome = payroll.grossPay;
  }
  
  /**
   * Evaluate formula for a payroll item
   */
  async evaluateFormula(
    formula: string,
    payroll: Payroll,
    parameters?: Record<string, any>
  ): Promise<{ result: number; details: any }> {
    try {
      // Create comprehensive scope for formula evaluation
      const scope: Record<string, any> = {
        // Employee data
        MonthlyRate: payroll.monthlyRate,
        DailyRate: payroll.dailyRate,
        HourlyRate: payroll.hourlyRate,
        
        // Work hours
        RegularHours: payroll.totalRegularHours,
        HolidayHours: payroll.totalHolidayHours,
        SpecialHolidayHours: payroll.totalSpecialHolidayHours,
        RestDayHours: payroll.totalRestDayHours,
        NightDiffHours: payroll.totalNightDifferentialHours,
        OvertimeHours: payroll.totalOvertimeHours,
        HolidayOvertimeHours: payroll.totalHolidayOvertimeHours,
        SpecialHolidayOvertimeHours: payroll.totalSpecialHolidayOvertimeHours,
        RestDayOvertimeHours: payroll.totalRestDayOvertimeHours,

        // Pay components
        BasicPay: payroll.basicPay,
        HolidayPay: payroll.holidayPay,
        SpecialHolidayPay: payroll.specialHolidayPay,
        RestDayPay: payroll.restDayPay,
        NightDifferentialPay: payroll.nightDifferentialPay,
        OvertimePay: payroll.overtimePay,
        HolidayOvertimePay: payroll.holidayOvertimePay,
        SpecialHolidayOvertimePay: payroll.specialHolidayOvertimePay,
        RestDayOvertimePay: payroll.restDayOvertimePay,
        
        // Totals
        GrossPay: payroll.grossPay,
        TaxableIncome: payroll.taxableIncome,
        
        // Add custom parameters
        ...parameters
      };
      
      // Execute formula
      const result = evaluate(formula, scope);
      const numericResult = parseFloat(Number(result).toFixed(2));
      
      return {
        result: numericResult,
        details: {
          formula,
          scope: { ...scope },
          result: numericResult
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error evaluating formula: ${formula}`, error.stack);
        return {
          result: 0,
          details: {
            formula,
            error: error.message,
            result: 0
          }
        };
      } else {
        this.logger.error(`Error evaluating formula: ${formula}`, String(error));
        return {
          result: 0,
          details: {
            formula,
            error: String(error),
            result: 0
          }
        };
      }
    }
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
    
    // Get employee's assigned payroll items
    const employeePayrollItems = await this.payrollItemsService.getRepository().find({
      where: {
        employee: { id: payroll.employee.id },
        isDeleted: false
      },
      relations: {
        payrollItemType: true
      }
    });
    
    // Clear existing payroll items if reprocessing
    // if (payroll.payrollItems?.length) {
    //   for (const item of payroll.payrollItems) {
    //     await this.payrollItemsService.delete(item.id);
    //   }
    // }
    
    // Order for processing categories
    const processingOrder = [
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
        // Check if this item type is assigned to employee or is system-generated
        const employeeItem = employeePayrollItems.find(
          item => item.payrollItemType.id === itemType.id
        );
        
        // If not assigned and not system-generated, skip
        if (!employeeItem && !itemType.isSystemGenerated) {
          continue;
        }
        
        // Create new payroll item
        const payrollItem = new PayrollItem({});
        payrollItem.employee = payroll.employee;
        payrollItem.payrollItemType = itemType;
        payrollItem.payroll = payroll;
        payrollItem.occurrence = employeeItem?.occurrence || itemType.defaultOccurrence;
        payrollItem.parameters = employeeItem?.parameters || {};
        
        // Evaluate the formula
        const { result, details } = await this.evaluateFormula(
          itemType.computationFormula,
          payroll,
          payrollItem.parameters
        );
        
        payrollItem.amount = result;
        payrollItem.calculationDetails = details;
        
        // For government-mandated contributions with employer share
        if (itemType.isGovernmentMandated && itemType.hasEmployerShare && itemType.employerFormulaPercentage) {
          const { result: employerAmount } = await this.evaluateFormula(
            itemType.employerFormulaPercentage,
            payroll,
            { ...payrollItem.parameters, Amount: result }
          );
          payrollItem.employerAmount = employerAmount;
        }
        
        // Save the payroll item
        const savedItem = await this.payrollItemsService.create(payrollItem, userId);
        newPayrollItems.push(savedItem);
        
        // Track calculation
        calculationLog.push({
          itemType: itemType.name,
          category: itemType.category,
          formula: itemType.computationFormula,
          amount: result,
          parameters: payrollItem.parameters
        });
        
        // Update payroll totals based on this item
        this.updatePayrollTotals(payroll, savedItem);
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
   * Update payroll totals based on a single payroll item
   */
  private updatePayrollTotals(payroll: Payroll, item: PayrollItem): void {
    const category = item.payrollItemType.category;
    const amount = +item.amount;
    
    // Update category totals
    switch (category) {
      case PayrollItemCategory.ALLOWANCE:
        payroll.totalAllowances += amount;
        payroll.grossPay += amount;
        
        // Update taxable income if this allowance is taxable
        if (item.isTaxable) {
          payroll.taxableIncome += amount;
        }
        break;
        
      case PayrollItemCategory.BONUS:
        payroll.totalBonuses += amount;
        payroll.grossPay += amount;
        
        // Update taxable income if this bonus is taxable (some bonuses like 13th month up to 90k are non-taxable)
        if (item.isTaxable) {
          payroll.taxableIncome += amount;
        }
        break;
        
      case PayrollItemCategory.BENEFIT:
        payroll.totalBenefits += amount;
        // Benefits typically aren't part of gross pay
        break;
        
      case PayrollItemCategory.DEDUCTION:
        payroll.totalDeductions += amount;
        // Deductions don't affect gross pay, only net pay
        break;
        
      case PayrollItemCategory.TAX:
        payroll.totalTaxes += amount;
        // Taxes don't affect taxable income
        break;
        
      default:
        // For other categories like REIMBURSEMENT, COMMISSION, etc.
        // Handle based on specific rules
        
        // For government contributions
        if (item.payrollItemType.isGovernmentMandated) {
          payroll.totalGovernmentContributions += amount;
          
          // Government contributions typically reduce taxable income
          if (item.payrollItemType.isTaxDeductible) {
            payroll.taxableIncome -= amount;
          }
          
          // // Update specific contribution tracking for reporting
          // if (item.payrollItemType.governmentContributionType) {
          //   const type = item.payrollItemType.governmentContributionType.toLowerCase();
            
          //   if (type.includes('sss')) {
          //     payroll.sssEmployeeContribution = amount;
          //     if (item.employerAmount) {
          //       payroll.sssEmployerContribution = +item.employerAmount;
          //     }
          //   } else if (type.includes('philhealth')) {
          //     payroll.philHealthEmployeeContribution = amount;
          //     if (item.employerAmount) {
          //       payroll.philHealthEmployerContribution = +item.employerAmount;
          //     }
          //   } else if (type.includes('pagibig')) {
          //     payroll.pagIbigEmployeeContribution = amount;
          //     if (item.employerAmount) {
          //       payroll.pagIbigContribution = +item.employerAmount;
          //     }
          //   } else if (type.includes('tax')) {
          //     payroll.withHoldingTax = amount;
          //   }
          // }
        }
        break;
    }
    
    // Ensure taxable income doesn't go negative
    payroll.taxableIncome = Math.max(0, payroll.taxableIncome);
    
    // Update net pay
    payroll.netPay = payroll.grossPay + payroll.totalBenefits - 
                     payroll.totalDeductions - payroll.totalGovernmentContributions - 
                     payroll.totalTaxes;
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
      
      // If exists and already processed, prevent re-processing
      if (existingPayroll && ![PayrollStatus.DRAFT, PayrollStatus.ERROR].includes(existingPayroll.status)) {
        throw new BadRequestException(
          `Payroll for this employee and cutoff already processed with status: ${existingPayroll.status}`
        );
      }
      
      // Get employee and cutoff data
      const employee = await this.employeesService.findOneByOrFail({ id: employeeId });
      const cutoff = await this.cutoffsService.findOneByOrFail({ id: cutoffId });
      
      if (cutoff.status !== CutoffStatus.PENDING) {
        throw new BadRequestException('Cutoff is not pending');
      }
      
      // Get final work hours for this employee and cutoff
      const finalWorkHours = await this.finalWorkHoursService.getRepository().findBy({
        employee: { id: employeeId },
        cutoff: { id: cutoffId },
        isApproved: true,
        isProcessed: false
      });
      
      if (!finalWorkHours.length) {
        throw new BadRequestException('No approved work hours found for this cutoff period');
      }
      
      // Use existing payroll or create new one
      const payroll = existingPayroll || new Payroll({});
      
      // Set core properties
      payroll.employee = employee;
      payroll.cutoff = cutoff;
      payroll.status = PayrollStatus.PROCESSING;
      
      // Calculate basic pay from work hours
      this.calculateBasicPay(payroll, finalWorkHours);
      
      // Save payroll to get an ID if new
      const savedPayroll = await transactionManager.save(payroll);
      
      // Process all payroll items
      const payrollItems = await this.processPayrollItems(savedPayroll, userId);
      savedPayroll.payrollItems = payrollItems;
      
      // Mark work hours as processed
      for (const workHour of finalWorkHours) {
        await this.finalWorkHoursService.update(
          workHour.id, 
          { isProcessed: true },
          userId
        );
      }
      
      // Finalize payroll
      savedPayroll.processedAt = new Date();
      savedPayroll.processedBy = userId;
      savedPayroll.status = PayrollStatus.APPROVED;
      
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
        isDisplayed: item.payrollItemType.isDisplayedInPayslip !== false
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
          item => item.payrollItemType.isGovernmentMandated
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