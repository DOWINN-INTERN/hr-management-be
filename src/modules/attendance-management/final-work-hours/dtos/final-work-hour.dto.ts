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

    @ApiProperty({ description: 'No time in hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNumber()
    @IsNotEmpty()
    noTimeInHours!: number;

    @ApiProperty({ description: 'No time out hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    noTimeOutHours!: number;

    @ApiProperty({ description: 'Absent hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    absentHours!: number;

    @ApiProperty({ description: 'Tardiness hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    tardinessHours!: number;

    @ApiProperty({ description: 'Undertime hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    undertimeHours!: number;

    @ApiProperty({ description: 'Regular day hours', example: 8.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    regularDayHours!: number;

    @ApiProperty({ description: 'Rest day hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    restDayHours!: number;

    @ApiProperty({ description: 'Special holiday hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    specialHolidayHours!: number;

    @ApiProperty({ description: 'Regular holiday hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    regularHolidayHours!: number;

    @ApiProperty({ description: 'Overtime regular day hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    overtimeRegularDayHours!: number;

    @ApiProperty({ description: 'Overtime rest day hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    overtimeRestDayHours!: number;

    @ApiProperty({ description: 'Overtime special holiday hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    overtimeSpecialHolidayHours!: number;

    @ApiProperty({ description: 'Overtime regular holiday hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    overtimeRegularHolidayHours!: number;

    @ApiProperty({ description: 'Night differential hours', example: 0.00 })
    @IsDecimal({ decimal_digits: '2' })
    @IsNotEmpty()
    @IsNumber()
    nightDifferentialHours!: number;

    @ApiProperty({ 
        description: 'Day type', 
        enum: DayType, 
        example: DayType.REGULAR_DAY 
    })
    @IsNotEmpty()
    @IsEnum(DayType)
    dayType!: DayType;

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

    @ApiPropertyOptional({ description: 'Is approved', example: false })
    @IsBoolean()
    @IsOptional()
    isApproved?: boolean;

    @ApiProperty({ description: 'Batch ID' })
    @IsNotEmpty()
    @IsUUID('4')
    @IsString()
    batchId!: string;

    @ApiPropertyOptional({ description: 'Is processed', example: true })
    @IsBoolean()
    @IsOptional()
    isProcessed?: boolean;

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

export class UpdateFinalWorkHourDto extends PartialType(FinalWorkHourDto) {}

export class GetFinalWorkHourDto extends createGetDto(UpdateFinalWorkHourDto, 'final work hour') {}