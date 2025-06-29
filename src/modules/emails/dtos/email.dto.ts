import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class EmailDto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the email' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class UpdateEmailDto extends PartialType(EmailDto) {}

export class GetEmailDto extends createGetDto(EmailDto) {}