import { Action } from "@/common/enums/action.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";

export class PermissionDto {
    @ApiProperty({ description: 'Permission name', required: false })
    name?: string;
    
    @ApiProperty({ description: 'Permission description', required: false })
    description?: string;
    
    @ApiProperty({ 
        description: 'The action this permission grants', 
        enum: Action,
        enumName: 'Action'
    })
    action!: Action;
    
    @ApiProperty({ description: 'The subject this permission applies to' })
    subject!: string;
}

export class UpdatePermissionDto extends PartialType(PermissionDto) {}

export class GetPermissionDto extends createGetDto(UpdatePermissionDto, 'permission'){}