import { IsTimeString } from "@/common/decorators/is-time-string.decorator";
import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { ShiftDayDto } from "./shift-day.dto";

export class ShiftDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Name of the shift',
        example: 'Morning Shift',
        type: String
    })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    @ApiProperty({ 
        description: 'Description of the shift',
        example: 'Standard morning work schedule',
        required: false,
        type: String
    })
    @IsOptional()
    @IsString()
    description?: string;
    
    @ApiProperty({ 
        description: 'Default start time of the shift',
        example: '09:00:00',
        type: String
    })
    @IsNotEmpty()
    @IsTimeString()
    defaultStartTime!: string;
    
    @ApiProperty({ 
        description: 'Default end time of the shift',
        example: '18:00:00',
        type: String
    })
    @IsNotEmpty()
    @IsTimeString()
    defaultEndTime!: string;
    
    @ApiProperty({ 
        description: 'Default break time in minutes',
        example: 60,
        required: false,
        type: Number
    })
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    defaultBreakTime!: number;
    
    @ApiProperty({ 
        description: 'Default duration of the shift in hours (computed from start/end times)',
        example: 8,
        readOnly: true,
        type: Number
    })
    get defaultDuration(): number {
        if (!this.defaultStartTime || !this.defaultEndTime) {
            return 0;
        }
        
        // Parse times
        const [startHours, startMinutes] = this.defaultStartTime.split(':').map(Number);
        const [endHours, endMinutes] = this.defaultEndTime.split(':').map(Number);
        
        // Calculate duration in hours
        let durationHours = endHours - startHours;
        let durationMinutes = endMinutes - startMinutes;
        
        // Adjust for negative minutes
        if (durationMinutes < 0) {
            durationHours -= 1;
            durationMinutes += 60;
        }
        
        // Calculate break time in hours
        const breakHours = this.defaultBreakTime ? this.defaultBreakTime / 60 : 0;
        
        // Return duration minus break time
        return Math.max(0, durationHours + (durationMinutes / 60) - breakHours);
    }
    
    @ApiProperty({ 
        description: 'Shift details for specific days',
        type: [ShiftDayDto],
    })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ShiftDayDto)
    days!: ShiftDayDto[];
}

export class UpdateShiftDto extends PartialType(ShiftDto) {}

export class GetShiftDto extends createGetDto(UpdateShiftDto, 'shift') {}