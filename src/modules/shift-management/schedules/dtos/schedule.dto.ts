import { IsTimeString } from "@/common/decorators/is-time-string.decorator";
import { BaseDto } from "@/common/dtos/base.dto";
import { ScheduleStatus } from "@/common/enums/schedule-status";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class ScheduleDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Date of the schedule', example: '2023-01-01' })
    @IsNotEmpty()
    @IsDateString()
    date!: Date;
    
    @ApiProperty({ description: 'Notes about the schedule', required: false, example: 'Special schedule for holiday season' })
    @IsOptional()
    @IsString()
    notes?: string;
    
    @ApiProperty({ 
        description: 'Status of the schedule', 
        enum: ScheduleStatus, 
        default: ScheduleStatus.DEFAULT,
        example: ScheduleStatus.DEFAULT 
    })
    @IsOptional()
    @IsEnum(ScheduleStatus)
    status?: ScheduleStatus;

    @ApiProperty({ description: 'Start time of the schedule', required: false, example: '09:00:00' })
    @IsOptional()
    @IsTimeString()
    startTime?: string;
    
    @ApiProperty({ description: 'End time of the schedule', required: false, example: '17:00:00' })
    @IsOptional()
    @IsTimeString()
    endTime?: string;
    
    @ApiProperty({ description: 'Break time in minutes', required: false, example: 60 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    breakTime?: number;
    
    @ApiProperty({ description: 'Duration in hours', required: false, example: 8 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    duration?: number;
    
    @ApiProperty({ description: 'ID of the associated shift', required: true, example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    shiftId!: string;
    
    @ApiProperty({ description: 'ID of the associated holiday', required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsOptional()
    @IsUUID()
    holidayId?: string;
    
    @ApiProperty({ description: 'ID of the associated employee', required: true, example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    employeeId!: string;
    
    @ApiProperty({ description: 'ID of the associated cutoff', required: true, example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    cutoffId!: string;
}

export class UpdateScheduleDto extends PartialType(ScheduleDto) {}

export class GetScheduleDto extends createGetDto(UpdateScheduleDto, 'schedule') {}