import { BaseDto } from "@/common/dtos/base.dto";
import { EmploymentCondition } from "@/common/enums/employment/employment-condition.enum";
import { EmploymentStatus } from "@/common/enums/employment/employment-status.enum";
import { EmploymentType } from "@/common/enums/employment/employment-type.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class EmployeeDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Unique employee number' })
    @IsNotEmpty()
    @IsString()
    employeeNumber!: string;

    @ApiProperty({
        description: 'Employment status of the employee',
        enum: EmploymentStatus,
        default: EmploymentStatus.PENDING,
    })
    @IsEnum(EmploymentStatus)
    @IsOptional()
    employmentStatus?: EmploymentStatus;

    @ApiProperty({
        description: 'Employment condition of the employee',
        enum: EmploymentCondition,
        default: EmploymentCondition.PROBATIONARY,
    })
    @IsEnum(EmploymentCondition)
    @IsOptional()
    employmentCondition?: EmploymentCondition;

    @ApiProperty({
        description: 'Employment type of the employee',
        enum: EmploymentType,
        default: EmploymentType.FULL_TIME,
    })
    @IsEnum(EmploymentType)
    @IsOptional()
    employmentType?: EmploymentType;

    @ApiProperty({
        description: 'Date when employee commenced work',
        required: false,
        type: Date,
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    commencementDate?: Date;

    @ApiProperty({
        description: 'Available leave credits',
        required: false,
        default: 0,
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    leaveCredits?: number;

    @ApiProperty({
        description: 'IDs of roles assigned to the employee',
        type: [String],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    roleIds?: string[];
}

export class UpdateEmployeeDto extends PartialType(EmployeeDto) {}

export class GetEmployeeDto extends createGetDto(EmployeeDto) {}