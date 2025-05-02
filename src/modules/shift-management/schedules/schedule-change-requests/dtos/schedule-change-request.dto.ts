import { BaseDto } from "@/common/dtos/base.dto";
import { RequestStatus } from '@/common/enums/request-status.enum';
import { ScheduleChangeRequestType } from '@/common/enums/schedule-change-request-type.enum';
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class ScheduleChangeRequestDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Reason for the schedule change request',
        example: 'Medical appointment'
    })
    @IsNotEmpty()
    @IsString()
    description!: string;
    
    @ApiProperty({ 
        description: 'Status of the request',
        enum: RequestStatus,
        default: RequestStatus.PENDING,
        example: RequestStatus.PENDING
    })
    @IsEnum(RequestStatus)
    @IsOptional()
    status?: RequestStatus;

    @ApiProperty({ 
        description: 'Type of schedule change request',
        enum: ScheduleChangeRequestType,
        example: ScheduleChangeRequestType.SICK_LEAVE // Assuming this is one of the enum values
    })
    @IsEnum(ScheduleChangeRequestType)
    @IsNotEmpty()
    type!: ScheduleChangeRequestType;

    @ApiProperty({ 
        description: 'ID of the schedule this request is associated with',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    @IsNotEmpty()
    scheduleId!: string;

    @ApiProperty({ 
        description: 'ID of the schedule change response if exists',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false
    })
    @IsUUID()
    @IsOptional()
    scheduleChangeResponseId?: string;
}

export class UpdateScheduleChangeRequestDto extends PartialType(ScheduleChangeRequestDto) {}

export class GetScheduleChangeRequestDto extends createGetDto(UpdateScheduleChangeRequestDto, 'schedule change request') {}