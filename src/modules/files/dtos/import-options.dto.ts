import { FileFormat } from '@/common/enums/file-format';
import { BaseEntity } from '@/database/entities/base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional, IsString
} from 'class-validator';

export class ImportOptionsDto<T extends BaseEntity<T>> {
  @ApiProperty({
    enum: FileFormat,
    description: 'Format of the import file',
    example: FileFormat.CSV
  })
  @IsEnum(FileFormat)
  @IsNotEmpty()
  format!: FileFormat;
  
  @ApiPropertyOptional({
    description: 'Field mapping from external field names to internal entity properties',
    example: { name: 'Full Name', email: 'Email Address' }
  })
  @IsOptional()
  @IsObject()
  fieldMap?: Record<string, string>;
  
  @ApiPropertyOptional({
    description: 'Field used to identify existing records for updates',
    example: 'id',
    type: String,
  })
  @IsOptional()
  @IsString()
  identifierField?: keyof T;
  
  @ApiPropertyOptional({
    description: 'Size of batches for processing large imports',
    minimum: 1,
    default: 100,
    example: 500
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  batchSize?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of records to import',
    example: 5000
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxRecords?: number;
  
  @ApiPropertyOptional({
    description: 'Perform validation without saving changes to database',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}