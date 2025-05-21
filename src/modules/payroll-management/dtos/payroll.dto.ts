import { BaseDto } from "@/common/dtos/base.dto";
import { PayrollState } from "@/common/enums/payroll/payroll-state.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min, ValidateNested
} from "class-validator";

export class ContributionDto {
  @ApiProperty({ description: 'Employee contribution amount', example: 500.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  employee!: number;

  @ApiPropertyOptional({ description: 'Employer contribution amount', example: 500.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  employer?: number;

  @ApiPropertyOptional({ description: 'Total contribution amount', example: 1000.00 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  total?: number;
}

export class SignificantChangeDto {
  @ApiProperty({ description: 'Field that changed significantly', example: 'basicPay' })
  @IsString()
  @IsNotEmpty()
  field!: string;

  @ApiProperty({ description: 'Previous value', example: 5000 })
  @IsNumber()
  @IsNotEmpty()
  previousValue!: number;

  @ApiProperty({ description: 'Current value', example: 5500 })
  @IsNumber()
  @IsNotEmpty()
  currentValue!: number;

  @ApiProperty({ description: 'Percentage change', example: 10 })
  @IsNumber()
  @IsNotEmpty()
  percentageChange!: number;
}

export class ComparisonDto {
  @ApiProperty({ description: 'ID of the previous payroll', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  previousPayrollId!: string;

  @ApiProperty({ description: 'Difference in net pay', example: 500 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  netPayDifference!: number;

  @ApiProperty({ description: 'Difference in gross pay', example: 700 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  grossPayDifference!: number;

  @ApiPropertyOptional({ description: 'Significant changes in the payroll', type: [SignificantChangeDto] })
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => SignificantChangeDto)
  significantChanges?: SignificantChangeDto[];
}

export class StateHistoryItemDto {
  @ApiProperty({ description: 'Previous state', enum: PayrollState })
  @IsEnum(PayrollState)
  @IsNotEmpty()
  from!: PayrollState;

  @ApiProperty({ description: 'New state', enum: PayrollState })
  @IsEnum(PayrollState)
  @IsNotEmpty()
  to!: PayrollState;

  @ApiProperty({ description: 'Timestamp of state change', example: '2023-01-01T00:00:00Z' })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  timestamp!: Date;

  @ApiPropertyOptional({ description: 'Optional note about state change', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({ description: 'Additional details about state change', required: false })
  @IsOptional()
  @IsObject()
  details?: any;
}

export class PayrollDto extends PartialType(BaseDto) {
  @ApiProperty({ description: 'ID of the related employee', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  employeeId!: string;

  @ApiProperty({ description: 'ID of the related cutoff period', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  cutoffId!: string;

  @ApiProperty({ description: 'Monthly rate of the employee', example: 20000.00 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  monthlyRate!: number;

  @ApiProperty({ description: 'Daily rate of the employee', example: 950.00 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  dailyRate!: number;

  @ApiProperty({ description: 'Hourly rate of the employee', example: 118.75 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  hourlyRate!: number;

  // Deduction hours
  @ApiProperty({ description: 'Total hours with no time in', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalNoTimeInHours!: number;

  @ApiProperty({ description: 'Total hours with no time out', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalNoTimeOutHours!: number;

  @ApiProperty({ description: 'Total absent hours', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalAbsentHours!: number;

  @ApiProperty({ description: 'Total tardiness hours', example: 0.5 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalTardinessHours!: number;

  @ApiProperty({ description: 'Total undertime hours', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalUndertimeHours!: number;

  // Work hours summary
  @ApiProperty({ description: 'Total regular work hours', example: 80 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalRegularHours!: number;

  @ApiProperty({ description: 'Total holiday work hours', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalHolidayHours!: number;

  @ApiProperty({ description: 'Total special holiday work hours', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalSpecialHolidayHours!: number;

  @ApiProperty({ description: 'Total rest day work hours', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalRestDayHours!: number;

  @ApiProperty({ description: 'Total overtime hours', example: 4 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalOvertimeHours!: number;

  @ApiProperty({ description: 'Total holiday overtime hours', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalHolidayOvertimeHours!: number;

  @ApiProperty({ description: 'Total special holiday overtime hours', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalSpecialHolidayOvertimeHours!: number;

  @ApiProperty({ description: 'Total rest day overtime hours', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalRestDayOvertimeHours!: number;

  @ApiProperty({ description: 'Total night differential hours', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalNightDifferentialHours!: number;

  @ApiProperty({ description: 'Total work hours', example: 84 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalHours!: number;

  // Pay components
  @ApiProperty({ description: 'Basic pay amount', example: 9500.00 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  basicPay!: number;

  @ApiProperty({ description: 'Overtime pay amount', example: 594.00 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  overtimePay!: number;

  @ApiProperty({ description: 'Holiday pay amount', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  holidayPay!: number;

  @ApiProperty({ description: 'Holiday overtime pay amount', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  holidayOvertimePay!: number;

  @ApiProperty({ description: 'Special holiday pay amount', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  specialHolidayPay!: number;

  @ApiProperty({ description: 'Special holiday overtime pay amount', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  specialHolidayOvertimePay!: number;

  @ApiProperty({ description: 'Rest day pay amount', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  restDayPay!: number;

  @ApiProperty({ description: 'Rest day overtime pay amount', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  restDayOvertimePay!: number;

  @ApiProperty({ description: 'Night differential pay amount', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  nightDifferentialPay!: number;

  // Deductions
  @ApiProperty({ description: 'Absences deduction amount', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  absences!: number;

  @ApiProperty({ description: 'Tardiness deduction amount', example: 59.38 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  tardiness!: number;

  @ApiProperty({ description: 'Undertime deduction amount', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  undertime!: number;

  @ApiProperty({ description: 'No time in deduction amount', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  noTimeIn!: number;

  @ApiProperty({ description: 'No time out deduction amount', example: 0 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  noTimeOut!: number;

  @ApiProperty({ description: 'Total basic deductions amount', example: 59.38 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalBasicDeductions!: number;

  @ApiProperty({ description: 'Comparison with previous payroll', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ComparisonDto)
  comparisonWithPreviousPayroll?: ComparisonDto;

  @ApiProperty({ description: 'Currency code', example: 'PHP', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Exchange rate', example: 1.0, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  exchangeRate?: number;

  // Summarized pay components
  @ApiProperty({ description: 'Total allowances amount', example: 1000.00 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalAllowances!: number;

  @ApiProperty({ description: 'Total deductions amount', example: 1559.38 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  totalDeductions!: number;

  // Payment totals
  @ApiProperty({ description: 'Gross pay amount', example: 11094.00 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  grossPay!: number;

  @ApiProperty({ description: 'Taxable income amount', example: 9534.62 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  taxableIncome!: number;

  @ApiProperty({ description: 'Net pay amount', example: 8534.62 })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  netPay!: number;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'First payroll of the month', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdatePayrollDto extends PartialType(PayrollDto) {}

export class GetPayrollDto extends createGetDto(UpdatePayrollDto, 'payroll') {
    // Payment information
    @ApiProperty({ description: 'Payment method', example: 'Bank Transfer', required: false })
    @IsOptional()
    @IsString()
    paymentMethod?: string;

    @ApiProperty({ description: 'Bank account number', example: '1234567890', required: false })
    @IsOptional()
    @IsString()
    bankAccount?: string;

    @ApiProperty({ description: 'Bank reference number', example: 'REF12345', required: false })
    @IsOptional()
    @IsString()
    bankReferenceNumber?: string;

    @ApiProperty({ description: 'Check number', example: 'CK001234', required: false })
    @IsOptional()
    @IsString()
    checkNumber?: string;

    @ApiProperty({ description: 'Payment date', required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    paymentDate?: Date;

    @ApiProperty({ description: 'Batch ID', example: 'BATCH20231015', required: false })
    @IsOptional()
    @IsString()
    batchId?: string;

    // State machine status
    @ApiProperty({ description: 'Current state of the payroll', enum: PayrollState, default: PayrollState.DRAFT })
    @IsEnum(PayrollState)
    @IsNotEmpty()
    state!: PayrollState;

    @ApiPropertyOptional({ description: 'History of state changes', type: [StateHistoryItemDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StateHistoryItemDto)
    stateHistory?: StateHistoryItemDto[];

    @ApiProperty({ description: 'Processed timestamp', required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    processedAt?: Date;

    @ApiProperty({ description: 'ID of the user who processed the payroll', required: false })
    @IsOptional()
    @IsUUID()
    processedBy?: string;

    @ApiProperty({ description: 'Approved timestamp', required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    approvedAt?: Date;

    @ApiProperty({ description: 'ID of the user who approved the payroll', required: false })
    @IsOptional()
    @IsUUID()
    approvedBy?: string;

    @ApiProperty({ description: 'Rejected timestamp', required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    rejectedAt?: Date;

    @ApiProperty({ description: 'ID of the user who rejected the payroll', required: false })
    @IsOptional()
    @IsUUID()
    rejectedBy?: string;

    @ApiProperty({ description: 'Reason for rejection', example: 'Incorrect calculations', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    rejectionReason?: string;

    @ApiProperty({ description: 'Released timestamp', required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    releasedAt?: Date;

    @ApiProperty({ description: 'ID of the user who released the payroll', required: false })
    @IsOptional()
    @IsUUID()
    releasedBy?: string;

    @ApiProperty({ description: 'Voided timestamp', required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    voidedAt?: Date;

    @ApiProperty({ description: 'ID of the user who voided the payroll', required: false })
    @IsOptional()
    @IsUUID()
    voidedBy?: string;

    @ApiProperty({ description: 'Count of reprocessing attempts', default: 0 })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    reprocessedCount!: number;
}