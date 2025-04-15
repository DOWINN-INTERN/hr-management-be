import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class PayrollDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the payroll' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdatePayrollDto extends PartialType(PayrollDto) {}

export class GetPayrollDto extends createGetDto(PayrollDto) {}