import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class GroupDto extends PartialType(BaseDto) {
    @ApiProperty({ 
        description: 'Name of the group',
        example: 'Morning Shift Team'
    })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    @ApiProperty({ 
        description: 'Description of the group',
        example: 'Team responsible for morning operations',
        required: false,
        nullable: true 
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'ID of the shift this group is assigned to',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false
    })
    @IsOptional()
    @IsUUID()
    shiftId?: string;
}

export class UpdateGroupDto extends PartialType(GroupDto) {}

export class GetGroupDto extends createGetDto(UpdateGroupDto, "group") {}