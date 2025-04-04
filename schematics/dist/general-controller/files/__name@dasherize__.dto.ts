import { BaseDto } from "@/common/dtos/base.dto";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/swagger";

export class <%= classify(entityName) %>Dto extends PartialType(BaseDto) {
    @ApiProperty({ description: 'Name of the <%= entityName %>' })
    @IsNotEmpty()
    @IsString()
    name!: string;
    
    // Add your DTO fields here
}

export class Update<%= classify(entityName) %>Dto extends PartialType(<%= classify(entityName) %>Dto) {}

export class Get<%= classify(entityName) %>Dto extends createGetDto(<%= classify(entityName) %>Dto) {}