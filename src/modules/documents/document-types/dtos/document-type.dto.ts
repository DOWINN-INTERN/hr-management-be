import { BaseDto } from '@/common/dtos/base.dto';
import { createGetDto } from '@/common/factories/create-get-dto.factory';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class DocumentTypeDto extends BaseDto {
    @ApiProperty({ description: 'Name of the document type', example: 'Contract' })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({ description: 'Description of the document type', required: false, example: 'Legal contract documents' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Indicates if the document type is active', example: true })
    @IsBoolean()
    active: boolean = false;

    @ApiProperty({ description: 'Indicates if the document type is required for applicants', example: true })
    @IsBoolean()
    requiredForApplicants: boolean = true;

    @ApiProperty({ description: 'Indicates if the document type is required for employees', example: true })
    @IsBoolean()
    requiredForEmployees: boolean = true;

    @ApiProperty({ description: 'Unique identifier for the parent document type', required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsOptional()
    @IsUUID()
    parentId?: string;
}

export class UpdateDocumentTypeDto extends PartialType(DocumentTypeDto) {}

export class GetDocumentTypeDto extends createGetDto(UpdateDocumentTypeDto) {}