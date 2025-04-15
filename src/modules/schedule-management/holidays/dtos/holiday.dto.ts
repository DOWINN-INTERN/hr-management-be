import { BaseDto } from "@/common/dtos/base.dto";
import { HolidayType } from "@/common/enums/holiday-type.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

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
        description: 'ID of the associated schedule',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false
    })
    @IsOptional()
    @IsUUID(4, { message: 'Schedule ID must be a valid UUID' })
    scheduleId?: string;
}

export class CreateHolidayDto extends HolidayDto {}

export class UpdateHolidayDto extends PartialType(HolidayDto) {}

export class GetHolidayDto extends createGetDto(UpdateHolidayDto, 'holiday') {}