import { IsTimeString } from "@/common/decorators/is-time-string.decorator";
import { BaseDto } from "@/common/dtos/base.dto";
import { ReferenceDto } from "@/common/dtos/reference.dto";
import { ScheduleStatus } from "@/common/enums/schedule-status";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from "class-validator";

export class ScheduleDto extends PartialType(BaseDto) {
    @ApiProperty({ 
      description: 'Date of the schedule', 
      example: '2023-01-01',
      type: String,
      format: 'date'
    })
    @IsNotEmpty()
    @IsDateString()
    date!: Date;
    
    @ApiPropertyOptional({ 
      description: 'Notes about the schedule', 
      example: 'Special schedule for holiday season'
    })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ 
      description: 'Color of the schedule', 
      example: '#000000'
    })
    @IsOptional()
    @IsString()
    color?: string;
    
    @ApiPropertyOptional({ 
      description: 'Indicates if this is a rest day', 
      default: false,
      example: false
    })
    @IsOptional()
    @IsBoolean()
    restDay?: boolean;

    @ApiPropertyOptional({ 
      description: 'Start time of the schedule', 
      example: '09:00:00',
      format: 'time'
    })
    @IsOptional()
    @IsTimeString()
    startTime?: string;
    
    @ApiPropertyOptional({ 
      description: 'End time of the schedule',
      example: '17:00:00',
      format: 'time'
    })
    @IsOptional()
    @IsTimeString()
    endTime?: string;
    
    @ApiPropertyOptional({ 
      description: 'Break time in minutes',
      example: 60,
      minimum: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    breakTime?: number;
    
    @ApiPropertyOptional({ 
      description: 'Employee owns this schedule',
      type: ReferenceDto
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ReferenceDto)
    employee?: ReferenceDto;
}

export class UpdateScheduleDto extends PartialType(ScheduleDto) {}

export class GetScheduleDto extends createGetDto(UpdateScheduleDto, 'schedule') {
      @ApiPropertyOptional({ 
      description: 'Cutoff this schedule belongs to',
      type: ReferenceDto
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ReferenceDto)
    cutoff?: ReferenceDto;

        @ApiPropertyOptional({ 
      description: 'Shift this schedule is based',
      type: ReferenceDto
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ReferenceDto)
    shift?: ReferenceDto;

  // This should be a full object of holiday
    @ApiPropertyOptional({ 
      description: 'Associated holiday reference',
      type: ReferenceDto
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ReferenceDto)
    holiday?: ReferenceDto;

    @ApiPropertyOptional({ 
        description: 'Status of the schedule', 
        enum: ScheduleStatus, 
        default: ScheduleStatus.DEFAULT,
        example: ScheduleStatus.DEFAULT 
    })
    @IsOptional()
    @IsEnum(ScheduleStatus)
    status?: ScheduleStatus;

    @ApiPropertyOptional({ 
      description: 'Duration in hours',
      example: 8,
      minimum: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    duration?: number;

    @ApiPropertyOptional({
        description: 'Attendance for this schedule',
        type: ReferenceDto
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ReferenceDto)
    attendance?: ReferenceDto;
}