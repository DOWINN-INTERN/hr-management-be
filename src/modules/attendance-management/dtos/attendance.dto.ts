import { BaseDto } from "@/common/dtos/base.dto";
import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class AttendanceDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Employee ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    @IsNotEmpty()
    employeeId!: string;

    @ApiProperty({ 
        description: 'List of attendance statuses',
        type: [String],
        enum: AttendanceStatus,
        example: [AttendanceStatus.DEFAULT, AttendanceStatus.LATE]
    })
    @IsArray()
    @IsEnum(AttendanceStatus, { each: true })
    @IsNotEmpty()
    statuses!: AttendanceStatus[];

    @ApiProperty({ 
        description: 'Time when employee clocked in',
        example: '2023-01-01T09:00:00Z',
        type: Date
    })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    timeIn!: Date;

    @ApiProperty({ 
        description: 'Time when employee clocked out',
        example: '2023-01-01T17:00:00Z',
        type: Date,
        required: false,
        nullable: true
    })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    timeOut?: Date;

    @ApiProperty({ 
        description: 'Schedule ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    @IsNotEmpty()
    scheduleId!: string;
}

export class CreateAttendanceDto extends AttendanceDto {}

export class UpdateAttendanceDto extends PartialType(AttendanceDto) {}

export class GetAttendanceDto extends createGetDto(UpdateAttendanceDto, 'attendance') {}