import { BaseDto } from "@/common/dtos/base.dto";
import { ReferenceDto } from "@/common/dtos/reference.dto";
import { RequestStatus } from '@/common/enums/request-status.enum';
import { ScheduleChangeRequestType } from '@/common/enums/schedule-change-request-type.enum';
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
export class AlternativeScheduleDto {
    @ApiProperty({ 
        description: 'Date of the alternative schedule',
        example: '2023-06-15',
        type: String,
        format: 'date'
    })
    @IsNotEmpty()
    date!: string;

    @ApiProperty({ 
        description: 'Start time of the alternative schedule',
        example: '09:00:00',
        type: String
    })
    @IsNotEmpty()
    startTime!: string;

    @ApiProperty({ 
        description: 'End time of the alternative schedule',
        example: '17:00:00',
        type: String
    })
    @IsNotEmpty()
    endTime!: string;

    @ApiPropertyOptional({ 
        description: 'Break time in minutes for the alternative schedule',
        example: 60
    })
    @IsOptional()
    breakTime?: number;

    @ApiPropertyOptional({ 
        description: 'Notes for this alternative schedule',
        example: 'Working from home this day'
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class ScheduleChangeRequestDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Reason for the schedule change request',
        example: 'Medical appointment'
    })
    @IsNotEmpty()
    @IsString()
    description!: string;

    @ApiProperty({ 
        description: 'Type of schedule change request',
        enum: ScheduleChangeRequestType,
        example: ScheduleChangeRequestType.SICK_LEAVE
    })
    @IsEnum(ScheduleChangeRequestType)
    @IsNotEmpty()
    type!: ScheduleChangeRequestType;

    @ApiProperty({ 
        description: 'Original schedules that need to be changed',
        type: [ReferenceDto],
        example: [
            { id: '123e4567-e89b-12d3-a456-426614174000' },
            { id: '123e4567-e89b-12d3-a456-426614174001' }
        ]
    })
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ReferenceDto)
    originalSchedules!: ReferenceDto[];

    @ApiProperty({
        description: 'Alternative schedules to replace the originals',
        type: [AlternativeScheduleDto]
    })
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => AlternativeScheduleDto)
    alternativeSchedules!: AlternativeScheduleDto[];

    @ApiPropertyOptional({
        description: 'Documents associated with the schedule change request',
        type: [ReferenceDto],
        example: [
            { id: '123e4567-e89b-12d3-a456-426614174000' }
        ]
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ReferenceDto)
    documents?: ReferenceDto[];
}

export class UpdateScheduleChangeRequestDto extends PartialType(ScheduleChangeRequestDto) {}

export class GetScheduleChangeRequestDto extends createGetDto(UpdateScheduleChangeRequestDto, 'schedule change request') {
    @ApiPropertyOptional({ 
        description: 'Status of the request',
        enum: RequestStatus,
        default: RequestStatus.PENDING,
        example: RequestStatus.PENDING
    })
    @IsEnum(RequestStatus)
    @IsOptional()
    status?: RequestStatus;
}