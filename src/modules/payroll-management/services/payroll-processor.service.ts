// import { Occurrence } from '@/common/enums/occurence.enum';
// import { PayrollItemCategory } from '@/common/enums/payroll-item-category.enum';
// import { UtilityHelper } from '@/common/helpers/utility.helper';
// import { FinalWorkHour } from '@/modules/attendance-management/final-work-hours/entities/final-work-hour.entity';
// import { BadRequestException, Injectable, Logger } from '@nestjs/common';
// import { evaluate } from 'mathjs';
// import { DataSource } from 'typeorm';
// import { Cutoff } from '../cutoffs/entities/cutoff.entity';
// import { Payroll } from '../entities/payroll.entity';
// import { PayrollStateMachine } from '../helpers/payroll-state-machine.helper';
// import { PayrollItemType } from '../payroll-item-types/entities/payroll-item-type.entity';
// import { EmployeeCompensationDto } from '../payroll-items/dtos/employee-compensation.dto';
// import { PayrollItem } from '../payroll-items/entities/payroll-item.entity';

// /**
//  * Responsible for all payroll calculations and processing logic
//  */
// @Injectable()
// export class PayrollProcessorService {
//   private readonly logger = new Logger(PayrollProcessorService.name);
//   private readonly RestDayPayMultiplier = 1.3;
//   private readonly HolidayPayMultiplier = 2.0;
//   private readonly SpecialHolidayPayMultiplier = 1.3;
//   private readonly OvertimePayMultiplier = 1.25;
//   private readonly HolidayOvertimePayMultiplier = 2.3;
//   private readonly SpecialHolidayOvertimePayMultiplier = 1.3;
//   private readonly RestDayOvertimePayMultiplier = 1.69;
//   private readonly NightDifferentialPayMultiplier = 0.1;
  
//   constructor(
//     private readonly dataSource: DataSource,
//     private readonly stateMachine: PayrollStateMachine
//   ) {}
  
//   /**
//    * Calculate basic pay components from work hours
//    */
//   async calculateBasicPay(payroll: Payroll, finalWorkHours: FinalWorkHour[], baseCompensation: EmployeeCompensationDto): Promise<void> {
//     // Get rates based on employee's compensation type
//     const rates = await this.calculateRates(baseCompensation, payroll.cutoff);
    
//     // Set rates
//     payroll.monthlyRate = rates.monthlyRate;
//     payroll.dailyRate = rates.dailyRate;
//     payroll.hourlyRate = rates.hourlyRate;
    
//     // Reset hour totals
//     payroll.totalRegularHours = 0;
//     payroll.totalHolidayHours = 0;
//     payroll.totalSpecialHolidayHours = 0;
//     payroll.totalRestDayHours = 0;
//     payroll.totalOvertimeHours = 0;
//     payroll.totalHolidayOvertimeHours = 0;
//     payroll.totalSpecialHolidayOvertimeHours = 0;
//     payroll.totalRestDayOvertimeHours = 0;
//     payroll.totalNightDifferentialHours = 0;
    
//     // Reset pay components
//     payroll.basicPay = 0;
//     payroll.overtimePay = 0;
//     payroll.holidayPay = 0;
//     payroll.holidayOvertimePay = 0;
//     payroll.specialHolidayPay = 0;
//     payroll.specialHolidayOvertimePay = 0;
//     payroll.restDayPay = 0;
//     payroll.restDayOvertimePay = 0;
//     payroll.nightDifferentialPay = 0;
    
//     // Process each work hour record
//     for (const workHour of finalWorkHours) {
//       payroll.totalRegularHours += +workHour.regularDayHours || 0;
//       payroll.totalHolidayHours += +workHour.regularHolidayHours || 0; 
//       payroll.totalSpecialHolidayHours += +workHour.specialHolidayHours || 0;
//       payroll.totalRestDayHours += +workHour.restDayHours || 0;
      
//       // Aggregate overtime hours
//       payroll.totalOvertimeHours += +workHour.overtimeRegularDayHours || 0;
//       payroll.totalHolidayOvertimeHours += +workHour.overtimeRegularHolidayHours || 0;
//       payroll.totalSpecialHolidayOvertimeHours += +workHour.overtimeSpecialHolidayHours || 0;
//       payroll.totalRestDayOvertimeHours += +workHour.overtimeRestDayHours || 0;
      
//       // Night differential
//       payroll.totalNightDifferentialHours += +workHour.nightDifferentialHours || 0;
//     }
    
//     // Calculate pay components with proper rate multipliers according to Philippine labor laws
    
//     // 1. Basic regular day pay (1.0x)
//     payroll.basicPay = payroll.totalRegularHours * payroll.hourlyRate;
    
//     // 2. Rest day pay (1.3x)
//     payroll.restDayPay = payroll.totalRestDayHours * payroll.hourlyRate * this.RestDayPayMultiplier;
    
//     // 3. Holiday pay (2.0x)
//     payroll.holidayPay = payroll.totalHolidayHours * payroll.hourlyRate * this.HolidayPayMultiplier;

//     // 4. Special holiday pay (1.3x)
//     payroll.specialHolidayPay = payroll.totalSpecialHolidayHours * payroll.hourlyRate * this.SpecialHolidayPayMultiplier;

//     // 5. Overtime regular pay (1.25x)
//     payroll.overtimePay = payroll.totalOvertimeHours * payroll.hourlyRate * this.OvertimePayMultiplier;

//     // 6. Overtime holiday pay (2.6x)
//     payroll.holidayOvertimePay = payroll.totalHolidayOvertimeHours * payroll.hourlyRate * this.HolidayOvertimePayMultiplier;

//     // 7. Overtime special holiday pay (1.3x)
//     payroll.specialHolidayOvertimePay = payroll.totalSpecialHolidayOvertimeHours * payroll.hourlyRate * this.SpecialHolidayOvertimePayMultiplier;

//     // 8. Overtime rest day pay (1.69x)
//     payroll.restDayOvertimePay = payroll.totalRestDayOvertimeHours * payroll.hourlyRate * this.RestDayOvertimePayMultiplier;
    
//     // 9. Night differential (10% of hourly rate)
//     payroll.nightDifferentialPay = payroll.totalNightDifferentialHours * payroll.hourlyRate * this.NightDifferentialPayMultiplier;
    
//     // 10. Initial gross pay from basic components
//     payroll.grossPay = payroll.basicPay + payroll.restDayPay + payroll.holidayPay
//       + payroll.specialHolidayPay + payroll.overtimePay
//       + payroll.holidayOvertimePay + payroll.specialHolidayOvertimePay
//       + payroll.restDayOvertimePay + payroll.nightDifferentialPay;

//     // 11. Total hours worked
//     payroll.totalHours = payroll.totalRegularHours + payroll.totalRestDayHours + 
//                         payroll.totalHolidayHours + payroll.totalSpecialHolidayHours +
//                         payroll.totalOvertimeHours + payroll.totalRestDayOvertimeHours +
//                         payroll.totalHolidayOvertimeHours + payroll.totalSpecialHolidayOvertimeHours;
    
//     // 12. Initial taxable income (will be adjusted for non-taxable items)
//     payroll.taxableIncome = payroll.grossPay;
//   }
  
//   /**
//    * Calculate rates based on employee's compensation type and cutoff period
//    */
//   async calculateRates(baseCompensation: EmployeeCompensationDto, cutoff: Cutoff): Promise<{
//     monthlyRate: number;
//     dailyRate: number;
//     hourlyRate: number;
//     baseCompensationType: string;
//     baseCompensationAmount: number;
//   }> {
//     const { rateType, amount } = baseCompensation;
//     const businessDaysInPeriod = UtilityHelper.getBusinessDays(cutoff.startDate, cutoff.endDate);
//     const businessDaysInMonth = UtilityHelper.getBusinessDaysInMonth(cutoff.startDate);
    
//     // Default values
//     let monthlyRate = 0;
//     let dailyRate = 0;
//     let hourlyRate = 0;
    
//     // Calculate rates based on compensation type
//     switch (rateType) {
//       case Occurrence.MONTHLY:
//         monthlyRate = amount;
//         dailyRate = monthlyRate / businessDaysInMonth;
//         hourlyRate = dailyRate / 8;
//         break;
        
//       case Occurrence.DAILY:
//         dailyRate = amount;
//         monthlyRate = dailyRate * businessDaysInMonth;
//         hourlyRate = dailyRate / 8;
//         break;
        
//       case Occurrence.HOURLY:
//         hourlyRate = amount;
//         dailyRate = hourlyRate * 8;
//         monthlyRate = dailyRate * businessDaysInMonth;
//         break;
        
//       default:
//         throw new BadRequestException(`Unknown compensation type: ${rateType}`);
//     }
    
//     return {
//       monthlyRate,
//       dailyRate,
//       hourlyRate,
//       baseCompensationType: rateType,
//       baseCompensationAmount: amount
//     };
//   }
  
//   /**
//    * Evaluate formula for a payroll item
//    */
//   async evaluateFormula(
//     formula: string,
//     payroll: Payroll,
//     parameters?: Record<string, any>
//   ): Promise<{ result: number; details: any }> {
//     try {
//       // Calculate work hours/days in period for compensation formulas
//       const workingDaysInPeriod = UtilityHelper.getBusinessDays(
//         payroll.cutoff.startDate, 
//         payroll.cutoff.endDate
//       );
      
//       // For hourly calculations - estimate based on 8 hours per working day
//       const workHoursInPeriod = workingDaysInPeriod * 8;
      
//       // Create comprehensive scope for formula evaluation
//       const scope: Record<string, any> = {
//         // Base compensation
//         BaseCompensation: payroll.monthlyRate,
//         Amount: parameters?.amount || 0,
        
//         // Work period calculations
//         WorkingDaysInPeriod: workingDaysInPeriod,
//         WorkHoursInPeriod: workHoursInPeriod,
        
//         // Employee data
//         MonthlyRate: payroll.monthlyRate,
//         DailyRate: payroll.dailyRate,
//         HourlyRate: payroll.hourlyRate,
        
//         // Work hours
//         RegularHours: payroll.totalRegularHours,
//         HolidayHours: payroll.totalHolidayHours,
//         SpecialHolidayHours: payroll.totalSpecialHolidayHours,
//         RestDayHours: payroll.totalRestDayHours,
//         NightDiffHours: payroll.totalNightDifferentialHours,
//         OvertimeHours: payroll.totalOvertimeHours,
//         HolidayOvertimeHours: payroll.totalHolidayOvertimeHours,
//         SpecialHolidayOvertimeHours: payroll.totalSpecialHolidayOvertimeHours,
//         RestDayOvertimeHours: payroll.totalRestDayOvertimeHours,
//         TotalHours: payroll.totalHours || 0,

//         // Pay components
//         BasicPay: payroll.basicPay,
//         HolidayPay: payroll.holidayPay,
//         SpecialHolidayPay: payroll.specialHolidayPay,
//         RestDayPay: payroll.restDayPay,
//         NightDifferentialPay: payroll.nightDifferentialPay,
//         OvertimePay: payroll.overtimePay,
//         HolidayOvertimePay: payroll.holidayOvertimePay,
//         SpecialHolidayOvertimePay: payroll.specialHolidayOvertimePay,
//         RestDayOvertimePay: payroll.restDayOvertimePay,
        
//         // Totals
//         GrossPay: payroll.grossPay,
//         TaxableIncome: payroll.taxableIncome,
        
//         // Cutoff info
//         CutoffType: payroll.cutoff.cutoffType,
        
//         // Add custom parameters
//         ...parameters
//       };
      
//       // For complex multi-line formulas like tax calculations, we need to use a different approach
//       if (formula.includes('{') || formula.includes('if') || formula.includes('else') || 
//           formula.includes('const') || formula.includes('let') || formula.includes('var')) {
//         // This is a complex formula, use Function constructor to evaluate it
//         try {
//           // Create parameter list from scope keys
//           const paramNames = Object.keys(scope);
//           const paramValues = paramNames.map(key => scope[key]);
          
//           // Create a new function with the formula as its body
//           // Strip comments first
//           const cleanFormula = formula.replace(/\/\/.*$/gm, '').trim();
          
//           // For security, restrict access to only what's needed
//           const safeFormula = `
//             "use strict";
//             ${cleanFormula}
//           `;
          
//           // Create and execute the function
//           const fn = new Function(...paramNames, safeFormula);
//           const result = fn(...paramValues);
          
//           return {
//             result: parseFloat(Number(result).toFixed(2)),
//             details: {
//               formula,
//               scope: { ...scope },
//               result: parseFloat(Number(result).toFixed(2))
//             }
//           };
//         } catch (error) {
//           this.logger.error(`Error evaluating complex formula: ${formula}`, error);
//           return {
//             result: 0,
//             details: {
//               formula,
//               error: error instanceof Error ? error.message : String(error),
//               result: 0
//             }
//           };
//         }
//       }
      
//       // For simple formulas, use the existing logic
//       let processedFormula = formula;
      
//       // Handle simple return statements
//       if (formula.trim().startsWith('return ')) {
//         processedFormula = formula.trim().replace(/^return\s+/, '').replace(/;$/, '');
//       } 
//       // Handle multiline or complex formulas
//       else if (formula.includes('return ')) {
//         // Extract the actual return expression from a more complex formula
//         const match = formula.match(/return\s+([^;]+);/);
//         if (match && match[1]) {
//           processedFormula = match[1];
//         }
//       }
      
//       // Execute formula
//       const result = evaluate(processedFormula, scope);
//       const numericResult = parseFloat(Number(result).toFixed(2));
      
//       return {
//         result: numericResult,
//         details: {
//           formula,
//           processedFormula,
//           scope: { ...scope },
//           result: numericResult
//         }
//       };
//     } catch (error) {
//       this.logger.error(`Error evaluating formula: ${formula}`, error);
//       return {
//         result: 0,
//         details: {
//           formula,
//           error: error instanceof Error ? error.message : String(error),
//           result: 0
//         }
//       };
//     }
//   }
  
//   /**
//    * Calculate amount based on calculation rule
//    */
//   calculateAmountByRule(
//     payrollItemType: PayrollItemType,
//     baseAmount: number,
//     payroll: Payroll
//   ): number {
//     // If no calculation rule defined, fall back to formula evaluation
//     if (!payrollItemType.calculationRule) {
//       return 0; // Will be calculated by formula later
//     }
  
//     const rule = payrollItemType.calculationRule;
    
//     switch (rule.type) {
//       case 'fixed':
//         return rule.fixedAmount || 0;
        
//       case 'percentage':
//         // Determine the base value for percentage calculation
//         let baseValue = baseAmount;
        
//         // Apply floor/ceiling for government contributions
//         if (payrollItemType.isGovernmentMandated) {
//           const params = payrollItemType.calculationParameters || {};
          
//           // Apply floor
//           if (payrollItemType.governmentContributionType === 'PHILHEALTH' && params.floorSalary) {
//             baseValue = Math.max(baseValue, params.floorSalary);
//           }
          
//           // Apply ceiling
//           if (params.ceilingSalary || params.maxSalary || params.mscCeiling) {
//             const ceiling = params.ceilingSalary || params.maxSalary || params.mscCeiling;
//             baseValue = Math.min(baseValue, ceiling);
//           }
//         }
        
//         return baseValue * ((rule.percentageRate || 0) / 100);
        
//       case 'formula':
//         // Will be handled by the formula evaluator
//         return 0;
        
//       case 'table':
//         // Look up in a table based on the base amount
//         // For simplicity, we'll implement the lookup as code switch cases
//         switch (payrollItemType.governmentContributionType) {
//           case 'SSS':
//             return this.calculateSSSContribution(baseAmount, payrollItemType.calculationParameters);
            
//           case 'PHILHEALTH':
//             return this.calculatePhilHealthContribution(baseAmount, payrollItemType.calculationParameters);
            
//           case 'PAGIBIG':
//             return this.calculatePagIBIGContribution(baseAmount, payrollItemType.calculationParameters);
            
//           case 'TAX':
//             return this.calculateWithholdingTax(payroll.taxableIncome, payrollItemType.calculationParameters);
            
//           default:
//             return 0;
//         }
        
//       default:
//         return 0;
//     }
//   }
  
//   /**
//    * Calculate SSS contribution based on 2025 rules
//    */
//   private calculateSSSContribution(salary: number, params?: Record<string, any>): number {
//     const employeeRate = (params?.employeeRate || 5) / 100;
//     const mscCeiling = params?.mscCeiling || 35000;
    
//     // Apply MSC ceiling
//     const msc = Math.min(salary, mscCeiling);
    
//     // Calculate employee's share
//     return msc * employeeRate;
//   }
  
//   /**
//    * Calculate PhilHealth contribution based on 2025 rules
//    */
//   private calculatePhilHealthContribution(salary: number, params?: Record<string, any>): number {
//     const premiumRate = (params?.premiumRate || 5) / 100;
//     const floorSalary = params?.floorSalary || 10000;
//     const ceilingSalary = params?.ceilingSalary || 100000;
    
//     // Apply floor and ceiling
//     let computationBase = salary;
//     if (computationBase < floorSalary) {
//       computationBase = floorSalary;
//     } else if (computationBase > ceilingSalary) {
//       computationBase = ceilingSalary;
//     }
    
//     // Calculate total contribution then divide by 2 for employee's share
//     return (computationBase * premiumRate) / 2;
//   }
  
//   /**
//    * Calculate Pag-IBIG contribution based on 2025 rules
//    */
//   private calculatePagIBIGContribution(salary: number, params?: Record<string, any>): number {
//     const employeeRate1 = (params?.employeeRate1 || 1) / 100;
//     const employeeRate2 = (params?.employeeRate2 || 2) / 100;
//     const maxSalary = params?.maxSalary || 10000;
    
//     // Apply ceiling
//     const computationBase = Math.min(salary, maxSalary);
    
//     // Apply rate based on salary
//     const rate = salary <= 1500 ? employeeRate1 : employeeRate2;
    
//     return computationBase * rate;
//   }
  
//   /**
//    * Calculate withholding tax based on TRAIN Law
//    */
//   private calculateWithholdingTax(monthlyTaxableIncome: number, params?: Record<string, any>): number {
//     // Annualize taxable income
//     const annualTaxableIncome = monthlyTaxableIncome * 12;
    
//     // Apply tax table
//     let annualTax = 0;
    
//     if (annualTaxableIncome <= 250000) {
//       annualTax = 0;
//     } else if (annualTaxableIncome <= 400000) {
//       annualTax = (annualTaxableIncome - 250000) * 0.2;
//     } else if (annualTaxableIncome <= 800000) {
//       annualTax = 30000 + (annualTaxableIncome - 400000) * 0.25;
//     } else if (annualTaxableIncome <= 2000000) {
//       annualTax = 130000 + (annualTaxableIncome - 800000) * 0.3;
//     } else if (annualTaxableIncome <= 8000000) {
//       annualTax = 490000 + (annualTaxableIncome - 2000000) * 0.32;
//     } else {
//       annualTax = 2410000 + (annualTaxableIncome - 8000000) * 0.35;
//     }
    
//     // Get monthly tax
//     return annualTax / 12;
//   }
  
//   /**
//    * Calculate employer share for government contributions
//    */
//   async calculateEmployerShare(
//     itemType: PayrollItemType,
//     baseAmount: number,
//     employeeAmount: number,
//     payroll: Payroll
//   ): Promise<number> {
//     try {
//       // Check if it's a special case handled by the calculation rule
//       if (itemType.calculationRule && itemType.governmentContributionType) {
//         switch (itemType.governmentContributionType) {
//           case 'SSS':
//             // Special case for SSS with EC contribution
//             const employerRate = (itemType.calculationParameters?.employerRate || 10) / 100;
//             const mscCeiling = itemType.calculationParameters?.mscCeiling || 35000;
//             const msc = Math.min(baseAmount, mscCeiling);
//             const ec = baseAmount <= 14500 ? 10 : 30;
            
//             return (msc * employerRate) + ec;
            
//           case 'PHILHEALTH':
//             // PhilHealth employer is equal to employee (50-50 sharing)
//             return employeeAmount;
            
//           case 'PAGIBIG':
//             // PagIBIG employer is always 2%
//             const maxSalary = itemType.calculationParameters?.maxSalary || 10000;
//             const computationBase = Math.min(baseAmount, maxSalary);
//             const employerRate = (itemType.calculationParameters?.employerRate || 2) / 100;
            
//             return computationBase * employerRate;
//         }
//       }
      
//       // If no special case, use the employer formula if available
//       if (itemType.employerFormulaPercentage) {
//         const { result } = await this.evaluateFormula(
//           itemType.employerFormulaPercentage,
//           payroll,
//           { Amount: employeeAmount }
//         );
//         return result;
//       }
      
//       return 0;
//     } catch (error) {
//       this.logger.error(
//         `Failed to calculate employer share for ${itemType.name}: ${error.message}`, 
//         error.stack
//       );
//       return 0;
//     }
//   }
  
//   /**
//    * Update payroll totals based on a single payroll item
//    */
//   updatePayrollTotals(payroll: Payroll, item: PayrollItem): void {
//     const category = item.payrollItemType.category;
//     const amount = +item.amount;
    
//     // Update category totals
//     switch (category) {
//       case PayrollItemCategory.ALLOWANCE:
//         payroll.totalAllowances += amount;
//         payroll.grossPay += amount;
        
//         // Update taxable income if this allowance is taxable
//         if (item.isTaxable) {
//           payroll.taxableIncome += amount;
//         }
//         break;
        
//       case PayrollItemCategory.BONUS:
//         payroll.totalBonuses += amount;
//         payroll.grossPay += amount;
        
//         // Update taxable income if this bonus is taxable (some bonuses like 13th month up to 90k are non-taxable)
//         if (item.isTaxable) {
//           payroll.taxableIncome += amount;
//         }
//         break;
        
//       case PayrollItemCategory.BENEFIT:
//         payroll.totalBenefits += amount;
//         // Benefits typically aren't part of gross pay
//         break;
        
//       case PayrollItemCategory.DEDUCTION:
//         payroll.totalDeductions += amount;
//         // Deductions don't affect gross pay, only net pay
//         break;
        
//       case PayrollItemCategory.TAX:
//         payroll.totalTaxes += amount;
//         // Taxes don't affect taxable income
//         break;
        
//       case PayrollItemCategory.GOVERNMENT:
//         if (item.payrollItemType.isGovernmentMandated) {
//           payroll.totalGovernmentContributions += amount;
          
//           // Government contributions typically reduce taxable income
//           if (item.payrollItemType.isTaxDeductible) {
//             payroll.taxableIncome -= amount;
//           }
//         }
//         break;
        
//       default:
//         // For other categories like REIMBURSEMENT, COMMISSION, etc.
//         if (item.isTaxable) {
//           payroll.grossPay += amount;
//           payroll.taxableIncome += amount;
//         }
//         break;
//     }
    
//     // Ensure taxable income doesn't go negative
//     payroll.taxableIncome = Math.max(0, payroll.taxableIncome);
    
//     // Update net pay
//     payroll.netPay = payroll.grossPay - 
//                      payroll.totalDeductions - payroll.totalGovernmentContributions - 
//                      payroll.totalTaxes;
    
//     // Add benefits separately since they're not part of gross pay but included in net pay
//     payroll.netPay += payroll.totalBenefits;
//   }
// }