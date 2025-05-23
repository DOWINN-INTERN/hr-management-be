import { BaseDto } from "@/common/dtos/base.dto";
import { ReferenceDto } from "@/common/dtos/reference.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class ScheduleChangeResponseDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Whether the schedule change request is approved',
        example: true
    })
    @IsNotEmpty()
    @IsBoolean()
    approved!: boolean;
    
    @ApiProperty({ 
        description: 'Response message for the schedule change request',
        example: 'Your schedule change has been approved.'
    })
    @IsNotEmpty()
    @IsString()
    message!: string;

    @ApiProperty({ 
        description: 'ID of the associated schedule change request',
        type: ReferenceDto,
    })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => ReferenceDto)
    scheduleChangeRequest!: ReferenceDto;
}

export class UpdateScheduleChangeResponseDto extends PartialType(ScheduleChangeResponseDto) {}

export class GetScheduleChangeResponseDto extends createGetDto(UpdateScheduleChangeResponseDto, 'schedule change response') {}