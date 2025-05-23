import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class MemorandumRecipientDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the memorandum-recipient' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdateMemorandumRecipientDto extends PartialType(MemorandumRecipientDto) {}

export class GetMemorandumRecipientDto extends createGetDto(UpdateMemorandumRecipientDto, 'memorandum recipient') {}