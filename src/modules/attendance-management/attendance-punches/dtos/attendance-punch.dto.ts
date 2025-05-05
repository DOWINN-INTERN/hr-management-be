import { BaseDto } from "@/common/dtos/base.dto";
import { PunchMethod } from "@/common/enums/punch-method.enum";
import { PunchType } from "@/common/enums/punch-type.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsUUID } from "class-validator";

export class AttendancePunchDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Attendance record this punch is associated with',
        example: '123e4567-e89b-12d3-a456-426614174000',
        type: String
    })
    @IsNotEmpty()
    @IsUUID(4)
    attendanceId!: string;

    @ApiProperty({ 
        description: 'Biometric device used for this punch',
        example: '123e4567-e89b-12d3-a456-426614174000',
        type: String
    })
    @IsNotEmpty()
    @IsUUID(4)
    biometricDeviceId!: string;
    
    @ApiProperty({ 
        description: 'Type of attendance punch (IN/OUT)',
        enum: PunchType,
        enumName: 'PunchType'
    })
    @IsNotEmpty()
    @IsEnum(PunchType)
    punchType!: PunchType;
    
    @ApiProperty({ 
        description: 'Method used for punch (FINGERPRINT/MANUAL/etc)',
        enum: PunchMethod,
        enumName: 'PunchMethod'
    })
    @IsNotEmpty()
    @IsEnum(PunchMethod)
    punchMethod!: PunchMethod;
    
    @ApiProperty({ 
        description: 'Timestamp of the punch',
        example: '2023-07-21T08:30:00Z',
        type: Date
    })
    @IsNotEmpty()
    @IsDateString()
    @Type(() => Date)
    time!: Date;
    
    @ApiProperty({ 
        description: 'Employee identification number',
        example: 12345,
        type: Number
    })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    employeeNumber!: number;
}

export class UpdateAttendancePunchDto extends PartialType(AttendancePunchDto) {}

export class GetAttendancePunchDto extends createGetDto(UpdateAttendancePunchDto, 'attendance punch') {}