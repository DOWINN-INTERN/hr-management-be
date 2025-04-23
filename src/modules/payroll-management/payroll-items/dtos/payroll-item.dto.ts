import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsDecimal, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from "class-validator";

export class PayrollItemDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Employee ID associated with this payroll item',
        type: String 
    })
    @IsUUID()
    @IsNotEmpty()
    employeeId!: string;

    @ApiProperty({ 
        description: 'Payroll item type ID',
        type: String 
    })
    @IsUUID()
    @IsNotEmpty()
    payrollItemTypeId!: string;

    @ApiProperty({ 
        description: 'Payroll ID (optional)',
        type: String,
        required: false
    })
    @IsUUID()
    @IsOptional()
    payrollId?: string;

    @ApiProperty({ 
        description: 'Amount of the payroll item',
        example: 1000.00,
        type: Number
    })
    @IsDecimal({ decimal_digits: '0,2' })
    @IsNotEmpty()
    amount!: number;

    @ApiProperty({ 
        description: 'Employer contribution amount (if applicable)',
        example: 100.00,
        type: Number,
        required: false
    })
    @IsDecimal({ decimal_digits: '0,2' })
    @IsOptional()
    employerAmount?: number;

    @ApiProperty({ 
        description: 'Additional parameters for the payroll item calculation',
        example: { rate: 0.05, basis: 'gross_salary' },
        type: Object,
        required: false
    })
    @IsObject()
    @IsOptional()
    parameters?: Record<string, any>;

    @ApiProperty({ 
        description: 'How often the item is applied (ONCE, DAILY, WEEKLY, MONTHLY, etc.)',
        example: 'MONTHLY',
        default: 'MONTHLY'
    })
    @IsString()
    @IsNotEmpty()
    occurrence!: string;

    @ApiProperty({ 
        description: 'Whether the payroll item is active',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ 
        description: 'Whether the payroll item is taxable',
        example: true,
        default: true
    })
    @IsBoolean()
    @IsOptional()
    isTaxable?: boolean;

    @ApiProperty({ 
        description: 'Date from which the payroll item is effective',
        type: Date,
        required: false
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    effectiveFrom?: Date;

    @ApiProperty({ 
        description: 'Date until which the payroll item is effective',
        type: Date,
        required: false
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    effectiveTo?: Date;

    @ApiProperty({ 
        description: 'Reference information for the payroll item',
        example: 'REF-2023-001',
        required: false
    })
    @IsString()
    @IsOptional()
    reference?: string;

    @ApiProperty({ 
        description: 'Government reference number for tax reporting and verification',
        example: 'GVT-1234567',
        required: false
    })
    @IsString()
    @IsOptional()
    governmentReferenceNumber?: string;

    @ApiProperty({ 
        description: 'Calculation details including formula, inputs, steps, and result',
        type: Object,
        required: false,
        example: {
            formula: 'base_salary * 0.05',
            inputs: { base_salary: 50000 },
            steps: ['Multiply base_salary by rate'],
            result: 2500
        }
    })
    @IsObject()
    @IsOptional()
    calculationDetails?: {
        formula: string;
        inputs: Record<string, any>;
        steps?: string[];
        result: number;
    };
}

export class UpdatePayrollItemDto extends PartialType(PayrollItemDto) {}

export class GetPayrollItemDto extends createGetDto(UpdatePayrollItemDto, 'payroll item') {}