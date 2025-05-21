import { BaseDto } from "@/common/dtos/base.dto";
import { ReferenceDto } from "@/common/dtos/reference.dto";
import { AttendanceStatus } from "@/common/enums/attendance-status.enum";
import { RequestStatus } from "@/common/enums/request-status.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { DayType } from "../../final-work-hours/entities/final-work-hour.entity";

export class WorkTimeRequestDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Employee reference',
        type: ReferenceDto
    })
    @ValidateNested()
    @Type(() => ReferenceDto)
    @IsNotEmpty()
    employee!: ReferenceDto;
    
    @ApiProperty({ 
        description: 'Type of attendance',
        enum: AttendanceStatus,
        example: AttendanceStatus.OVERTIME
    })
    @IsNotEmpty()
    @IsEnum(AttendanceStatus)
    type!: AttendanceStatus;
    
    @ApiPropertyOptional({ 
        description: 'Duration in minutes',
        example: 120,
    })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    duration?: number;
    
    @ApiProperty({ 
        description: 'Day type',
        enum: DayType,
        default: DayType.REGULAR_DAY,
        example: DayType.REGULAR_DAY
    })
    @IsNotEmpty()
    @IsEnum(DayType)
    dayType!: DayType;
    
    @ApiProperty({ 
        description: 'Attendance reference',
        type: ReferenceDto
    })
    @ValidateNested()
    @Type(() => ReferenceDto)
    @IsNotEmpty()
    attendance!: ReferenceDto;

    @ApiPropertyOptional({
        description: 'Documents associated with the work time request',
        type: [ReferenceDto],
        example: [
            { id: '123e4567-e89b-12d3-a456-426614174000' },
            { id: '123e4567-e89b-12d3-a456-426614174001' }
        ]
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ReferenceDto)
    documents?: ReferenceDto[];

    @ApiProperty({ 
        description: 'Reason for the request',
        example: 'Urgent project completion required overtime',
    })
    @IsNotEmpty()
    @IsString()
    reason!: string;
}

export class UpdateWorkTimeRequestDto extends PartialType(WorkTimeRequestDto) {}

export class GetWorkTimeRequestDto extends createGetDto(UpdateWorkTimeRequestDto, 'work time request') {
    @ApiPropertyOptional({ 
        description: 'Status of the work time request',
        enum: RequestStatus,
        example: RequestStatus.PENDING,
    })
    @IsOptional()
    @IsEnum(RequestStatus)
    status?: RequestStatus;
}