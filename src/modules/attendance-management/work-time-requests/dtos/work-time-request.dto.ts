import { BaseDto } from "@/common/dtos/base.dto";
import { AttendanceStatus } from "@/common/enums/attendance-status.enum";
import { RequestStatus } from "@/common/enums/request-status.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";

export class WorkTimeRequestDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Status of the work time request',
        enum: RequestStatus,
        default: RequestStatus.PENDING,
        example: RequestStatus.PENDING
    })
    @IsNotEmpty()
    @IsEnum(RequestStatus)
    status!: RequestStatus;
    
    @ApiProperty({ 
        description: 'Type of attendance',
        enum: AttendanceStatus,
        example: AttendanceStatus.OVERTIME
    })
    @IsNotEmpty()
    @IsEnum(AttendanceStatus)
    type!: AttendanceStatus;
    
    @ApiProperty({ 
        description: 'ID of the linked attendance record',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsUUID()
    attendanceId!: string;
}

export class UpdateWorkTimeRequestDto extends PartialType(WorkTimeRequestDto) {}

export class GetWorkTimeRequestDto extends createGetDto(UpdateWorkTimeRequestDto, 'work time request') {}