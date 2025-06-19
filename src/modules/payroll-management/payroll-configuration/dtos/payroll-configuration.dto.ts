import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PayrollConfigurationDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the payroll-configuration' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdatePayrollConfigurationDto extends PartialType(PayrollConfigurationDto) {}

export class GetPayrollConfigurationDto extends createGetDto(UpdatePayrollConfigurationDto, 'payroll configuration') {}