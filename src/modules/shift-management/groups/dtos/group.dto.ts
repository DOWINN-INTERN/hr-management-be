import { BaseDto } from "@/common/dtos/base.dto";
import { ReferenceDto } from "@/common/dtos/reference.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

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

    @ApiPropertyOptional({
        description: 'Shift assigned to this group',
        type: ReferenceDto,
        required: false
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ReferenceDto)
    shift?: ReferenceDto;

    @ApiPropertyOptional({ 
        description: 'Employees assigned to this group',
        type: [ReferenceDto]
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ReferenceDto)
    employees?: ReferenceDto[];
}

export class UpdateGroupDto extends PartialType(GroupDto) {}

export class GetGroupDto extends createGetDto(UpdateGroupDto, "group") {}