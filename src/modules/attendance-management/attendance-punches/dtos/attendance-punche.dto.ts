import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class AttendancePuncheDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the attendance-punche' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdateAttendancePuncheDto extends PartialType(AttendancePuncheDto) {}

export class GetAttendancePuncheDto extends createGetDto(AttendancePuncheDto) {}