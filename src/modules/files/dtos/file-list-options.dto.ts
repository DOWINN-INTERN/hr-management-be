import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export enum FileSortField {
  NAME = 'name',
  SIZE = 'size',
  DATE_CREATED = 'createdAt',
  DATE_MODIFIED = 'lastModified',
  TYPE = 'mimeType'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export class ScopeContext {
  @ApiPropertyOptional({
    description: 'Organization ID for filtering',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
    format: 'uuid'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Branch ID for filtering',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
    format: 'uuid'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ 
    description: 'Department ID for filtering',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ 
    description: 'User ID for filtering files owned by a specific user',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID()
  @IsString()
  userId?: string;
}

export class FileListOptionsDto {
  @ApiPropertyOptional({
    description: 'Scope context for filtering files',
    type: ScopeContext
  })
  @IsOptional()
  @Type(() => ScopeContext)
  scope?: ScopeContext;

  @ApiPropertyOptional({
    description: 'Additional folder path within the scope',
    example: 'invoices/2023',
    type: String
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ 
    description: 'Maximum number of items to return (1-1000)',
    minimum: 1,
    maximum: 1000,
    default: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;

  @ApiPropertyOptional({ 
    description: 'Include file URLs in response',
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  })
  @IsBoolean()
  includeUrls?: boolean = true;

  @ApiPropertyOptional({ 
    description: 'Include directories in results',
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  })
  @IsBoolean()
  includeDirs?: boolean = true;

  @ApiPropertyOptional({ 
    enum: FileSortField,
    description: 'Field to sort by',
    default: FileSortField.NAME
  })
  @IsOptional()
  @IsEnum(FileSortField)
  sortBy?: FileSortField;

  @ApiPropertyOptional({ 
    enum: SortDirection,
    description: 'Sort direction',
    default: SortDirection.ASC
  })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;

  @ApiPropertyOptional({ 
    description: 'Search term for filtering files by name',
    example: 'contract'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  searchTerm?: string;

  @ApiPropertyOptional({ 
    description: 'Show hidden files (starting with .)',
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  })
  @IsBoolean()
  showHidden?: boolean = false;
}