import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class AttendancePunchDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Attendance associated with this punch',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsUUID(4)
    attendanceId!: string;

    @ApiProperty({ 
        description: 'Biometric Device associated with this punch',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsUUID(4)
    biometricDeviceId!: string;
    
    @ApiProperty({ 
        description: 'Type of attendance punch',
        example: "1"
    })
    @IsNotEmpty()
    @IsString()
    punchType!: string;
    
    @ApiProperty({ 
        description: 'Timestamp of the punch',
        example: '2023-07-21T08:30:00Z' 
    })
    @IsNotEmpty()
    @IsDateString()
    time!: string;
    
    @ApiProperty({ 
        description: 'Location information (optional)',
        example: 'Main Office',
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    employeeNumber!: number;
}

export class UpdateAttendancePunchDto extends PartialType(AttendancePunchDto) {}

export class GetAttendancePunchDto extends createGetDto(UpdateAttendancePunchDto, 'attendance punch') {}