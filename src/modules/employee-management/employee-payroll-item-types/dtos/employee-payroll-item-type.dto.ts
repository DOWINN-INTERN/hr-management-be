import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class EmployeePayrollItemTypeDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the employee-payroll-item-type' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdateEmployeePayrollItemTypeDto extends PartialType(EmployeePayrollItemTypeDto) {}

export class GetEmployeePayrollItemTypeDto extends createGetDto(UpdateEmployeePayrollItemTypeDto, 'employee payroll item type') {}