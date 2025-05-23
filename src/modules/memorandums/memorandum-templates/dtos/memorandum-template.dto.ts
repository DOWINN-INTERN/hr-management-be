import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class MemorandumTemplateDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the memorandum-template' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdateMemorandumTemplateDto extends PartialType(MemorandumTemplateDto) {}

export class GetMemorandumTemplateDto extends createGetDto(MemorandumTemplateDto) {}