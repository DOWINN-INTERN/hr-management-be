import { BaseDto } from "@/common/dtos/base.dto";
import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class FileUploadDto extends PartialType(BaseDto) {
    @ApiPropertyOptional({
        description: 'The folder path where the file will be uploaded',
        example: 'documents/reports',
        maxLength: 255
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    folder?: string;
}