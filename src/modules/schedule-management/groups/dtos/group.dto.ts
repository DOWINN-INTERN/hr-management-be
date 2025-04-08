import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class GroupDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the group' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdateGroupDto extends PartialType(GroupDto) {}

export class GetGroupDto extends createGetDto(GroupDto) {}