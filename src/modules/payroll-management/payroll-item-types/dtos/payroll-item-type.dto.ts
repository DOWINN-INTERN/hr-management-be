import { BaseDto } from "@/common/dtos/base.dto";
import { Occurrence } from "@/common/enums/occurrence.enum";
import { GovernmentMandatedType } from "@/common/enums/payroll/government-contribution-type.enum";
import { PayrollItemCategory } from "@/common/enums/payroll/payroll-item-category.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class PayrollItemTypeDto extends PartialType(BaseDto) {
  @ApiProperty({
    description: 'Name of the payroll item type',
    example: 'Basic Salary'
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Description of the payroll item type',
    example: 'Basic monthly salary for employees',
    nullable: true
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Group of the payroll item type',
    example: 'Salary',
    nullable: true
  })
  @IsString()
  @IsOptional()
  group?: string;

  @ApiPropertyOptional({
    description: 'Whether the payroll item type has an amount',
    default: false,
    example: false,
    nullable: true
  })
  @IsBoolean()
  @IsOptional()
  hasAmount?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the payroll item type has a percentage',
    default: false,
    example: false,
    nullable: true
  })
  @IsBoolean()
  @IsOptional()
  hasPercentage?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the payroll item type has an effectivity date',
    default: false,
    example: false,
    nullable: true
  })
  @IsBoolean()
  @IsOptional()
  hasEffectivity?: boolean;

  @ApiPropertyOptional({
    description: 'Image or icon representing the payroll item type (file key, url, or icon)',
    example: 'https://example.com/icon.png',
    nullable: true
  })
  @IsString()
  @IsOptional()
  imageOrIcon?: string;

  @ApiProperty({
    description: 'Category of the payroll item type',
    enum: PayrollItemCategory,
    example: PayrollItemCategory.COMPENSATION
  })
  @IsEnum(PayrollItemCategory)
  @IsNotEmpty()
  category!: PayrollItemCategory;

  @ApiProperty({
    description: 'Default occurrence of the payroll item',
    enum: Occurrence,
    default: Occurrence.MONTHLY,
    example: Occurrence.MONTHLY
  })
  @IsEnum(Occurrence)
  @IsNotEmpty()
  defaultOccurrence!: Occurrence;

  @ApiProperty({
    description: 'Type of payroll item calculation',
    enum: ['fixed', 'formula'],
    example: 'fixed'
  })
  @IsString()
  @IsNotEmpty()
  type!: 'fixed' | 'formula';

  @ApiPropertyOptional({
    description: 'Default amount for fixed payroll items',
    example: 5000.00,
    nullable: true
  })
  @IsNumber()
  @IsOptional()
  defaultAmount?: number;

  @ApiProperty({
    description: 'Whether the payroll item type is active',
    default: true,
    example: true
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;

  @ApiPropertyOptional({
    description: 'Type of government mandated contribution',
    enum: GovernmentMandatedType,
    nullable: true,
    example: GovernmentMandatedType.SSS
  })
  @IsEnum(GovernmentMandatedType)
  @IsOptional()
  governmentMandatedType?: GovernmentMandatedType;

  @ApiProperty({
    description: 'Whether the payroll item is required',
    default: true,
    example: true
  })
  @IsBoolean()
  @IsNotEmpty()
  isRequired!: boolean;

  @ApiPropertyOptional({
    description: 'Date from which the payroll item is effective',
    type: Date,
    nullable: true,
    example: '2023-01-01T00:00:00Z'
  })
  @IsDate()
  @IsOptional()
  effectiveFrom?: Date;

  @ApiPropertyOptional({
    description: 'Date until which the payroll item is effective',
    type: Date,
    nullable: true,
    example: '2024-12-31T00:00:00Z'
  })
  @IsDate()
  @IsOptional()
  effectiveTo?: Date;

  @ApiPropertyOptional({
    description: 'Percentage value for percentage-based calculations',
    example: 10.5,
    nullable: true
  })
  @IsNumber()
  @IsOptional()
  percentage?: number;

  @ApiPropertyOptional({
    description: 'Processing period for the payroll item in a month (e.g., 1 for the first cutoff period of the month)',
    example: 1,
    nullable: true
  })
  @IsNumber()
  @IsOptional()
  processEvery?: 1 | 2;

  @ApiPropertyOptional({
    description: 'Employer contribution percentage',
    example: 5.5,
    nullable: true
  })
  @IsNumber()
  @IsOptional()
  employerPercentage?: number;

  @ApiProperty({
    description: 'Whether to include in payroll item processing',
    default: true,
    example: true
  })
  @IsBoolean()
  @IsNotEmpty()
  includeInPayrollItemsProcessing!: boolean;

  @ApiProperty({
    description: 'Whether the payroll item is taxable',
    default: false,
    example: false
  })
  @IsBoolean()
  @IsNotEmpty()
  isTaxable!: boolean;

  @ApiProperty({
    description: 'Whether the payroll item is tax deductible',
    default: false,
    example: false
  })
  @IsBoolean()
  @IsNotEmpty()
  isTaxDeductible!: boolean;

  @ApiPropertyOptional({
    description: 'Tax exemption amount',
    example: 2000.00,
    nullable: true
  })
  @IsNumber()
  @IsOptional()
  taxExemptionAmount?: number;

  @ApiPropertyOptional({
    description: 'Minimum amount for calculation',
    example: 1000.00,
    nullable: true
  })
  @IsNumber()
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum amount for calculation',
    example: 10000.00,
    nullable: true
  })
  @IsNumber()
  @IsOptional()
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Minimum additional amount',
    example: 500.00,
    nullable: true
  })
  @IsNumber()
  @IsOptional()
  minAdditionalAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum additional amount',
    example: 1500.00,
    nullable: true
  })
  @IsNumber()
  @IsOptional()
  maxAdditionalAmount?: number;

  @ApiPropertyOptional({
    description: 'Minimum contribution amount',
    example: 200.00,
    nullable: true
  })
  @IsNumber()
  @IsOptional()
  minContribution?: number;

  @ApiPropertyOptional({
    description: 'Maximum contribution amount',
    example: 2000.00,
    nullable: true
  })
  @IsNumber()
  @IsOptional()
  maxContribution?: number;
}

export class UpdatePayrollItemTypeDto extends PartialType(PayrollItemTypeDto) {}

export class GetPayrollItemTypeDto extends createGetDto(UpdatePayrollItemTypeDto, 'payroll item type') {}