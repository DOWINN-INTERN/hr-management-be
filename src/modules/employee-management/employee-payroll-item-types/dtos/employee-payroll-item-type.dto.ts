import { BaseDto } from "@/common/dtos/base.dto";
import { ReferenceDto } from "@/common/dtos/reference.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";

export class EmployeePayrollItemTypeDto extends PartialType(BaseDto) {
    @ApiProperty({
        description: 'Employee reference',
        required: true
    })
    @ValidateNested()
    @Type(() => ReferenceDto)
    @IsNotEmpty()
    employee!: ReferenceDto;

    @ApiProperty({
        description: 'Payroll item type reference',
        required: true
    })
    @ValidateNested()
    @Type(() => ReferenceDto)
    @IsNotEmpty()
    payrollItemType!: ReferenceDto;

  @ApiProperty({
    description: 'Reference number for this payroll item type',
    example: 'REF-12345',
    required: false
  })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiProperty({
    description: 'Whether this payroll item type is active',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Whether this payroll item type is exempted',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  exempted?: boolean;

  @ApiProperty({
    description: 'Amount value for this payroll item type',
    example: 1000.50,
    required: false,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'Accrual amount for this payroll item type',
    example: 500.25,
    required: false,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  accrualAmount?: number;

  @ApiProperty({
    description: 'Accrual count for this payroll item type',
    example: 5,
    required: false,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  accrualCount?: number;

  @ApiProperty({
    description: 'Percentage value for this payroll item type',
    example: 15.5,
    required: false,
    type: Number,
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  percentage?: number;

  @ApiProperty({
    description: 'Fee amount for this payroll item type',
    example: 25.99,
    required: false,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  fee?: number;

  @ApiProperty({
    description: 'Term information for this payroll item type',
    example: 'Monthly',
    required: false
  })
  @IsString()
  @IsOptional()
  term?: string;
}

export class UpdateEmployeePayrollItemTypeDto extends PartialType(EmployeePayrollItemTypeDto) {}

export class GetEmployeePayrollItemTypeDto extends createGetDto(UpdateEmployeePayrollItemTypeDto, 'employee payroll item type') {}