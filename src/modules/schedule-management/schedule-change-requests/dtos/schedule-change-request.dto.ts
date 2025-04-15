import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class ScheduleChangeRequestDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the schedule-change-request' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdateScheduleChangeRequestDto extends PartialType(ScheduleChangeRequestDto) {}

export class GetScheduleChangeRequestDto extends createGetDto(ScheduleChangeRequestDto) {}