import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class ComplianceDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the compliance' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdateComplianceDto extends PartialType(ComplianceDto) {}

export class GetComplianceDto extends createGetDto(ComplianceDto) {}