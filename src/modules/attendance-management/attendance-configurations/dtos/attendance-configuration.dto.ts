import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from "class-validator";

export class AttendanceConfigurationDto extends PartialType(BaseDto) {
    @ApiPropertyOptional({
        description: 'ID of the organization this configuration belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsOptional()
    @IsUUID('4')
    organizationId?: string;

    @ApiPropertyOptional({
        description: 'Allow early check-ins',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    allowEarlyTime?: boolean;

    @ApiPropertyOptional({
        description: 'Allow late check-ins',
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    allowLate?: boolean;
    
    @ApiPropertyOptional({
        description: 'Allow early check-outs',
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    allowUnderTime?: boolean;
    
    @ApiPropertyOptional({
        description: 'Allow overtime check-outs',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    allowOvertime?: boolean;

    @ApiPropertyOptional({
        description: 'Minutes before which check-in is considered early',
        example: 15,
    })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    earlyTimeThresholdMinutes?: number;

    @ApiPropertyOptional({
        description: 'Minutes after which an attendance is considered late',
        example: 5,
    })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    gracePeriodMinutes?: number;
    
    @ApiPropertyOptional({
        description: 'Minutes before which check-out is considered under time',
        example: 0,
    })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    underTimeThresholdMinutes?: number;
    
    @ApiPropertyOptional({
        description: 'Minutes after which check-out is considered overtime',
        example: 30,
    })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    overtimeThresholdMinutes?: number;

    @ApiPropertyOptional({
        description: 'Round down early time to nearest specified minutes',
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    roundDownEarlyTime?: boolean;

    @ApiPropertyOptional({
        description: 'Minutes to round down early time to',
        example: 30,
    })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    roundDownEarlyTimeMinutes?: number;
    
    @ApiPropertyOptional({
        description: 'Round up late time to nearest specified minutes',
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    roundUpLate?: boolean;
    
    @ApiPropertyOptional({
        description: 'Minutes to round up late time to',
        example: 30,
    })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    roundUpLateMinutes?: number;
    
    @ApiPropertyOptional({
        description: 'Round down under time to nearest specified minutes',
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    roundDownUnderTime?: boolean;
    
    @ApiPropertyOptional({
        description: 'Minutes to round down under time to',
        example: 30,
    })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    roundDownUnderTimeMinutes?: number;
    
    @ApiPropertyOptional({
        description: 'Round up overtime to nearest specified minutes',
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    roundUpOvertime?: boolean;
    
    @ApiPropertyOptional({
        description: 'Minutes to round up overtime to',
        example: 30,
    })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    roundUpOvertimeMinutes?: number;

    @ApiPropertyOptional({
        description: 'Apply deduction for missing time in',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    noTimeInDeduction?: boolean;
    
    @ApiPropertyOptional({
        description: 'Apply deduction for missing time out',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    noTimeOutDeduction?: boolean;
    
    @ApiPropertyOptional({
        description: 'Minutes to deduct for missing time in',
        example: 60,
    })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    noTimeInDeductionMinutes?: number;
    
    @ApiPropertyOptional({
        description: 'Minutes to deduct for missing time out',
        example: 60,
    })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @IsOptional()
    noTimeOutDeductionMinutes?: number;
}

export class UpdateAttendanceConfigurationDto extends PartialType(AttendanceConfigurationDto) {}

export class GetAttendanceConfigurationDto extends createGetDto(UpdateAttendanceConfigurationDto, 'attendance configuration') {}