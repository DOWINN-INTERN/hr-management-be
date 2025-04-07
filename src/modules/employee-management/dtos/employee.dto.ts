import { BaseDto } from "@/common/dtos/base.dto";
import { ReferenceDto } from "@/common/dtos/reference.dto";
import { EmploymentCondition } from "@/common/enums/employment/employment-condition.enum";
import { EmploymentStatus } from "@/common/enums/employment/employment-status.enum";
import { EmploymentType } from "@/common/enums/employment/employment-type.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator";

export class EmployeeDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'User ID associated with the employee' })
    @IsNotEmpty()
    @IsUUID()
    userId!: string;

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

    @ApiPropertyOptional({ 
        description: 'Roles associated with this employee',
        type: [ReferenceDto]
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ReferenceDto)
    roles?: ReferenceDto[];
}

export class UpdateEmployeeDto extends PartialType(EmployeeDto) {}

export class GetEmployeeDto extends createGetDto(UpdateEmployeeDto, "employee") {}