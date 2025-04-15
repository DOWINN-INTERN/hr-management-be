import { IsTimeString } from "@/common/decorators/is-time-string.decorator";
import { BaseDto } from "@/common/dtos/base.dto";
import { Day } from "@/common/enums/day.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, Min } from "class-validator";

export class ShiftDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Start time of the shift',
        example: '09:00:00',
        type: String
    })
    @IsNotEmpty()
    @IsTimeString()
    startTime!: string;
    
    @ApiProperty({ 
        description: 'End time of the shift',
        example: '17:00:00',
        type: String
    })
    @IsNotEmpty()
    @IsTimeString()
    endTime!: string;
    
    @ApiProperty({ 
        description: 'Break time in minutes',
        example: 60,
        required: false,
        type: Number
    })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    breakTime!: number;
    
    @ApiProperty({ 
        description: 'Duration of the shift in hours',
        example: 480,
        required: false,
        type: Number
    })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    duration!: number;
    
    @ApiProperty({ 
        description: 'Days when this shift is active',
        enum: Day,
        isArray: true,
        example: [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY]
    })
    @IsNotEmpty()
    @IsEnum(Day, { each: true })
    days!: Day[];
}

export class UpdateShiftDto extends PartialType(ShiftDto) {}

export class GetShiftDto extends createGetDto(UpdateShiftDto, 'shift') {}