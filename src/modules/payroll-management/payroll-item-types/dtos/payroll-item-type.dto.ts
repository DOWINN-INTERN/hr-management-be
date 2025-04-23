import { BaseDto } from "@/common/dtos/base.dto";
import { PayrollItemCategory } from '@/common/enums/payroll-item-category.enum';
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";

class ValidationRulesDto {
  @ApiProperty({ description: 'Minimum amount allowed', required: false, example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiProperty({ description: 'Maximum amount allowed', required: false, example: 10000 })
  @IsOptional()
  @IsNumber()
  @Max(1000000)
  maxAmount?: number;

  @ApiProperty({ description: 'Minimum salary required', required: false, example: 10000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @ApiProperty({ description: 'Maximum salary allowed', required: false, example: 100000 })
  @IsOptional()
  @IsNumber()
  @Max(10000000)
  maxSalary?: number;
}

export class PayrollItemTypeDto extends PartialType(BaseDto) {
  @ApiProperty({ description: 'Name of the payroll item type' })
  @IsNotEmpty()
  @IsString()
  name!: string;
  
  @ApiProperty({ description: 'Description of the payroll item type', required: false })
  @IsOptional()
  @IsString()
  description?: string;
  
  @ApiProperty({ 
    description: 'Category of the payroll item type',
    enum: PayrollItemCategory,
    example: Object.values(PayrollItemCategory)[0]
  })
  @IsEnum(PayrollItemCategory)
  @IsNotEmpty()
  category!: PayrollItemCategory;
  
  @ApiProperty({ description: 'Default occurrence of the payroll item', example: 'Monthly' })
  @IsNotEmpty()
  @IsString()
  defaultOccurrence!: string;
  
  @ApiProperty({ description: 'Unit of measurement for the payroll item', example: 'Hours' })
  @IsNotEmpty()
  @IsString()
  unit!: string;
  
  @ApiProperty({ description: 'Formula used for computation', example: 'baseRate * hours' })
  @IsNotEmpty()
  @IsString()
  computationFormula!: string;
  
  @ApiProperty({ 
    description: 'Default amount for the payroll item', 
    type: 'number',
    format: 'decimal',
    required: false,
    example: 1000.50
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  defaultAmount?: number;
  
  @ApiProperty({ description: 'Whether the payroll item is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
  
  @ApiProperty({ description: 'Whether the item is system generated', default: false })
  @IsBoolean()
  @IsOptional()
  isSystemGenerated?: boolean = false;
  
  @ApiProperty({ description: 'Whether the item is government mandated', default: false })
  @IsBoolean()
  @IsOptional()
  isGovernmentMandated?: boolean = false;
  
  @ApiProperty({ 
    description: 'Type of government contribution (SSS, PHILHEALTH, PAGIBIG, etc.)',
    required: false,
    example: 'SSS'
  })
  @IsOptional()
  @IsString()
  governmentContributionType?: string;
  
  @ApiProperty({ description: 'Whether the item has employer share', default: false })
  @IsBoolean()
  @IsOptional()
  hasEmployerShare?: boolean = false;
  
  @ApiProperty({ 
    description: 'Employer formula percentage', 
    required: false,
    example: '3.5%'
  })
  @IsOptional()
  @IsString()
  employerFormulaPercentage?: string;
  
  @ApiProperty({ description: 'Whether the item is part of tax calculation', default: false })
  @IsBoolean()
  @IsOptional()
  isPartOfTaxCalculation?: boolean = false;
  
  @ApiProperty({ description: 'Whether the item is taxable', default: true })
  @IsBoolean()
  @IsOptional()
  isTaxable?: boolean = true;
  
  @ApiProperty({ description: 'Whether the item is tax deductible', default: false })
  @IsBoolean()
  @IsOptional()
  isTaxDeductible?: boolean = false;
  
  @ApiProperty({ description: 'Whether the item is displayed in payslip', default: true })
  @IsBoolean()
  @IsOptional()
  isDisplayedInPayslip?: boolean = true;
  
  @ApiProperty({ 
    description: 'Which employee types this item applies to',
    required: false,
    isArray: true,
    example: ['Regular', 'Contractual']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableTo?: string[];
  
  @ApiProperty({ description: 'Whether the item is required', default: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean = true;
  
  @ApiProperty({ 
    description: 'Date when this item becomes effective',
    required: false,
    type: Date,
    example: '2023-01-01T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: Date;
  
  @ApiProperty({ 
    description: 'Date when this item expires',
    required: false,
    type: Date,
    example: '2024-12-31T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  effectiveTo?: Date;
  
  @ApiProperty({ 
    description: 'Additional parameters for calculation',
    required: false,
    example: {
      thresholds: [5000, 10000, 15000],
      rates: [0.05, 0.1, 0.15]
    }
  })
  @IsOptional()
  @IsObject()
  calculationParameters?: Record<string, any>;
  
  @ApiProperty({ 
    description: 'Validation rules for the payroll item',
    required: false,
    type: ValidationRulesDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ValidationRulesDto)
  validationRules?: ValidationRulesDto;
}

export class UpdatePayrollItemTypeDto extends PartialType(PayrollItemTypeDto) {}

export class GetPayrollItemTypeDto extends createGetDto(UpdatePayrollItemTypeDto, 'payroll item type') {}