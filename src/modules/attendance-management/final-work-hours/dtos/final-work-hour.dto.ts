import { BaseDto } from "@/common/dtos/base.dto";
import { ReferenceDto } from "@/common/dtos/reference.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsDecimal, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { DayType } from "../entities/final-work-hour.entity";

export class FinalWorkHourDto extends PartialType(BaseDto) {
    @ApiProperty({ type: () => ReferenceDto, description: 'Employee reference' })
    @ValidateNested()
    @IsNotEmpty()
    @Type(() => ReferenceDto)
    employee!: ReferenceDto;

    @ApiProperty({ type: () => ReferenceDto, description: 'Attendance reference' })
    @ValidateNested()
    @IsNotEmpty()
    @Type(() => ReferenceDto)
    attendance!: ReferenceDto;

    @ApiProperty({ type: () => ReferenceDto, description: 'Cutoff reference' })
    @ValidateNested()
    @IsNotEmpty()
    @Type(() => ReferenceDto)
    cutoff!: ReferenceDto;

    @ApiPropertyOptional({ description: 'Time in', type: Date })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    timeIn?: Date;

    @ApiPropertyOptional({ description: 'Time out', type: Date })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    timeOut?: Date;

    @ApiPropertyOptional({ description: 'Overtime out', type: Date })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    overTimeOut?: Date;

    @ApiPropertyOptional({ description: 'No time in hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    noTimeInHours?: number;

    @ApiPropertyOptional({ description: 'No time out hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    noTimeOutHours?: number;

    @ApiPropertyOptional({ description: 'Absent hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    absentHours?: number;

    @ApiPropertyOptional({ description: 'Tardiness hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    tardinessHours?: number;

    @ApiPropertyOptional({ description: 'Undertime hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    undertimeHours?: number;

    @ApiPropertyOptional({ description: 'Regular day hours', example: 8.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    regularDayHours?: number;

    @ApiPropertyOptional({ description: 'Rest day hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsOptional()
    @IsNumber()
    restDayHours?: number;

    @ApiPropertyOptional({ description: 'Special holiday hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    specialHolidayHours?: number;

    @ApiPropertyOptional({ description: 'Regular holiday hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    regularHolidayHours?: number;

    @ApiPropertyOptional({ description: 'Overtime regular day hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    overtimeRegularDayHours?: number;

    @ApiPropertyOptional({ description: 'Overtime rest day hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    overtimeRestDayHours?: number;

    @ApiPropertyOptional({ description: 'Overtime special holiday hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    overtimeSpecialHolidayHours?: number;

    @ApiPropertyOptional({ description: 'Overtime regular holiday hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    overtimeRegularHolidayHours?: number;

    @ApiPropertyOptional({ description: 'Night differential hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    nightDifferentialHours?: number;

    @ApiPropertyOptional({ description: 'Overtime night differential hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsOptional()
    nightDifferentialOvertimeHours?: number;

    @ApiProperty({ 
        description: 'Day type', 
        enum: DayType, 
        example: DayType.REGULAR_DAY 
    })
    @IsNotEmpty()
    @IsEnum(DayType)
    dayType!: DayType;

    @ApiProperty({ description: 'Work date', type: Date })
    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    workDate!: Date;

    @ApiPropertyOptional({ description: 'Notes' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateFinalWorkHourDto extends PartialType(FinalWorkHourDto) {
    @ApiPropertyOptional({ description: 'Is approved', example: false })
    @IsBoolean()
    @IsOptional()
    isApproved?: boolean;

    @ApiPropertyOptional({ description: 'Is processed', example: true })
    @IsBoolean()
    @IsOptional()
    isProcessed?: boolean;
}

export class GetFinalWorkHourDto extends createGetDto(UpdateFinalWorkHourDto, 'final work hour') {
    @ApiPropertyOptional({ description: 'Batch ID'  })
    @IsUUID('4')
    @IsString()
    @IsOptional()
    payrollBatchId?: string;

    @ApiProperty({ description: 'Batch ID' })
    @IsNotEmpty()
    @IsUUID('4')
    @IsString()
    batchId!: string;
    
    @ApiProperty({ description: 'Total regular hours', example: 8.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    totalRegularHours!: number;

    @ApiProperty({ description: 'Total overtime hours', example: 1.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    totalOvertimeHours!: number;

    @ApiProperty({ description: 'Total hours', example: 9.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    totalHours!: number;
}