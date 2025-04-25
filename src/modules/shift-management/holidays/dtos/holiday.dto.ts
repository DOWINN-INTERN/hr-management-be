import { BaseDto } from "@/common/dtos/base.dto";
import { Day } from "@/common/enums/day.enum";
import { HolidayType } from "@/common/enums/holiday-type.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class HolidayDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Name of the holiday',
        example: 'Christmas Day'
    })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    @ApiProperty({ 
        description: 'Description of the holiday',
        example: 'Annual celebration on December 25th',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;
    
    @ApiProperty({ 
        description: 'Type of holiday',
        enum: HolidayType,
        enumName: 'HolidayType',
        example: Object.values(HolidayType)[0]
    })
    @IsNotEmpty()
    @IsEnum(HolidayType, { message: 'Type must be a valid holiday type' })
    type!: HolidayType;

    @ApiProperty({ 
        description: 'Date of the holiday',
        example: '2023-12-25'
    })
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    date!: Date;

    @ApiProperty({ 
        description: 'Day of the week for the holiday',
        enum: Day,
        enumName: 'Day',
        example: Object.values(Day)[0]
    })
    @IsNotEmpty()
    @IsEnum(Day, { message: 'Day must be a valid day of the week' })
    day!: Day;
}

export class UpdateHolidayDto extends PartialType(HolidayDto) {}

export class GetHolidayDto extends createGetDto(UpdateHolidayDto, 'holiday') {}