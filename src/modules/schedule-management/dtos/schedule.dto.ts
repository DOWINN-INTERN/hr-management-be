import { BaseDto } from "@/common/dtos/base.dto";
import { ScheduleStatus } from "@/common/enums/schedule-status";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

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
    
    @ApiProperty({ description: 'ID of the associated shift', required: true, example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    shiftId!: string;
    
    @ApiProperty({ description: 'ID of the associated holiday', required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsOptional()
    @IsUUID()
    holidayId?: string;
}

export class UpdateScheduleDto extends PartialType(ScheduleDto) {}

export class GetScheduleDto extends createGetDto(UpdateScheduleDto, 'schedule') {}