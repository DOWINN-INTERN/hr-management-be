import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { DirectoryMetadata } from './directory-metadata.dto';
import { ScopeContext } from './file-list-options.dto';
import { FileMetadata } from './file-meta-data.dto';

export class FilePaginationDto {
  @ApiProperty({ 
    description: 'Current page number',
    example: 1,
    minimum: 1
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  page!: number;

  @ApiProperty({ 
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit!: number;

  @ApiProperty({ 
    description: 'Total number of items',
    example: 150,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalCount!: number;

  @ApiProperty({ 
    description: 'Total number of pages',
    example: 15,
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalPages!: number;

  @ApiProperty({ 
    description: 'Whether there is a next page available',
    example: true
  })
  @IsNotEmpty()
  @IsBoolean()
  hasNextPage!: boolean;

  @ApiProperty({ 
    description: 'Whether there is a previous page available',
    example: false
  })
  @IsBoolean()
  @IsNotEmpty()
  hasPreviousPage!: boolean;

  @ApiPropertyOptional({ 
    description: 'Next page number if available',
    example: 2,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  nextPage?: number;

  @ApiPropertyOptional({ 
    description: 'Previous page number if available',
    example: null,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  previousPage?: number;

  @ApiProperty({ 
    description: 'Items per page (alias for limit)',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  itemsPerPage!: number;
}

export class FileListResponseDto {
  @ApiProperty({ type: [FileMetadata], description: 'List of files' })
  files?: FileMetadata[];

  @ApiPropertyOptional({ type: [DirectoryMetadata], description: 'List of directories' })
  directories?: DirectoryMetadata[];

  @ApiProperty({
    description: 'Pagination information',
    type: FilePaginationDto
  })
  pagination!: FilePaginationDto;

  @ApiPropertyOptional({ description: 'Parent directory path' })
  parentDir?: string;

  @ApiPropertyOptional({
    description: 'Breadcrumb navigation path segments',
    type: [Object],
    example: [{ name: 'Home', path: '/' }, { name: 'Documents', path: '/documents' }]
  })
  breadcrumbs?: Array<{ name: string, path: string }>;

  @ApiPropertyOptional({
    description: 'Scope context for filtering files',
    type: ScopeContext
  })
  @IsOptional()
  @Type(() => ScopeContext)
  scope?: ScopeContext;
}