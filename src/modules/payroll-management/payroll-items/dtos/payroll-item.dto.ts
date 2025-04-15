import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class PayrollItemDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the payroll-item' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdatePayrollItemDto extends PartialType(PayrollItemDto) {}

export class GetPayrollItemDto extends createGetDto(PayrollItemDto) {}