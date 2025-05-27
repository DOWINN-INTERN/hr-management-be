import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PolicyDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the policy' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdatePolicyDto extends PartialType(PolicyDto) {}

export class GetPolicyDto extends createGetDto(UpdatePolicyDto, 'policy') {}