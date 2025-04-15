import { BaseDto } from '@/common/dtos/base.dto';
import { createGetDto } from '@/common/factories/create-get-dto.factory';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
    // filepath: /home/dowinn/Desktop/System/neststarter/src/modules/documents/dtos/document.dto.ts
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class DocumentDto extends BaseDto {
    @ApiProperty({ description: 'Name of the document', example: 'Contract.pdf' })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({ description: 'Description of the document', required: false, example: 'Legal contract document' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'File key for storage reference', example: 'documents/contract.pdf' })
    @IsNotEmpty()
    @IsString()
    fileKey!: string;

    @ApiProperty({ description: 'Size of the document in bytes', example: 102400 })
    @IsNotEmpty()
    @IsNumber()
    size!: number;

    @ApiProperty({ description: 'MIME type of the document', example: 'application/pdf' })
    @IsNotEmpty()
    @IsString()
    mimeType!: string;

    @ApiProperty({ description: 'User ID associated with the document', required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsOptional()
    @IsUUID()
    userId?: string;

    @ApiProperty({ description: 'Document type ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsNotEmpty()
    @IsUUID()
    documentTypeId!: string;
}

export class UpdateDocumentDto extends PartialType(DocumentDto) {}

export class GetDocumentDto extends createGetDto(UpdateDocumentDto, 'document') { }