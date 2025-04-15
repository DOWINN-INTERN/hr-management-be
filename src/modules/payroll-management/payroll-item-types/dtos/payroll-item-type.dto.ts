import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class PayrollItemTypeDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the payroll-item-type' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdatePayrollItemTypeDto extends PartialType(PayrollItemTypeDto) {}

export class GetPayrollItemTypeDto extends createGetDto(PayrollItemTypeDto) {}