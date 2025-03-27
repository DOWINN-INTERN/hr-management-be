import { Action } from "@/common/enums/action.enum";
import { createGetDto } from "@/common/utils/create-get-dto";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class PermissionDto {
    @Expose()
    @ApiProperty({ description: 'Permission name', required: false })
    name?: string;
    
    @Expose()
    @ApiProperty({ description: 'Permission description', required: false })
    description?: string;
    
    @Expose()
    @ApiProperty({ 
        description: 'The action this permission grants', 
        enum: Action,
        enumName: 'Action'
    })
    action!: Action;
    
    @Expose()
    @ApiProperty({ description: 'The subject this permission applies to' })
    subject!: string;
}

export class GetPermissionDto extends createGetDto(PermissionDto){}