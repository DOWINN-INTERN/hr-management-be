import { IsTimeString } from "@/common/decorators/is-time-string.decorator";
import { Day } from "@/common/enums/day.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class ShiftDayDto {
    @ApiProperty({ 
        description: 'Day of the week', 
        enum: Day,
        example: Day.MONDAY
    })
    @IsNotEmpty()
    @IsEnum(Day)
    day!: Day;
    
    @ApiProperty({ 
        description: 'Start time of the shift',
        example: '09:00:00',
        type: String,
        required: false,
    })
    @IsOptional()
    @IsTimeString()
    startTime?: string;
    
    @ApiProperty({ 
        description: 'End time of the shift',
        example: '18:00:00',
        type: String,
        required: false,
    })
    @IsOptional()
    @IsTimeString()
    endTime?: string;
    
    @ApiProperty({ 
        description: 'Break time in minutes',
        example: 60,
        required: false,
        type: Number
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    breakTime?: number;
    
    @ApiProperty({ 
        description: 'Duration of the shift in hours',
        example: 480,
        required: false,
        type: Number
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    duration?: number;
    
    @ApiProperty({ 
        description: 'Indicates if the shift runs overnight', 
        example: false,
        default: false,
        required: false,
        type: Boolean,
    })
    @IsOptional()
    @IsBoolean()
    isOvernight?: boolean;
    
    @ApiProperty({ 
        description: 'ID of the associated shift', 
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsString()
    shiftId!: string;
}