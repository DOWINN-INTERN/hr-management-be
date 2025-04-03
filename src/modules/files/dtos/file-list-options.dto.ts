import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

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

export class DateRangeFilter {
  @ApiPropertyOptional({ description: 'Start date for range filter' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'End date for range filter' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class SizeRangeFilter {
  @ApiPropertyOptional({ description: 'Minimum file size in bytes' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  min?: number;

  @ApiPropertyOptional({ description: 'Maximum file size in bytes' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  max?: number;
}

export class FileListOptions {
    @ApiPropertyOptional({ description: 'Directory path to list files from' })
    @IsOptional()
    @IsString()
    prefix?: string;

    @ApiPropertyOptional({ description: 'Maximum number of items to return' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number;

    @ApiPropertyOptional({ description: 'Pagination marker/cursor' })
    @IsOptional()
    @IsString()
    marker?: string;

    @ApiPropertyOptional({ description: 'Whether to include file URLs in response' })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    includeUrls?: boolean;

    @ApiPropertyOptional({ description: 'Whether to include directories in results' })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    includeDirs?: boolean = true;

    @ApiPropertyOptional({ description: 'Whether to include file sizes in response' })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    includeSizes?: boolean = true;

    @ApiPropertyOptional({ description: 'Whether to recursively traverse directories' })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    recursive?: boolean = false;

    @ApiPropertyOptional({ 
        enum: FileSortField,
        description: 'Field to sort by' 
    })
    @IsOptional()
    @IsEnum(FileSortField)
    sortBy?: FileSortField;

    @ApiPropertyOptional({ 
        enum: SortDirection,
        description: 'Sort direction' 
    })
    @IsOptional()
    @IsEnum(SortDirection)
    sortDirection?: SortDirection = SortDirection.ASC;

    @ApiPropertyOptional({ description: 'Search term for filename' })
    @IsOptional()
    @IsString()
    searchTerm?: string;

    @ApiPropertyOptional({ description: 'File extensions to filter by (comma-separated)' })
    @IsOptional()
    @IsString()
    extensions?: string;

    @ApiPropertyOptional({ description: 'Filter by file size' })
    @IsOptional()
    @ValidateNested()
    @Type(() => SizeRangeFilter)
    size?: SizeRangeFilter;

    @ApiPropertyOptional({ description: 'Filter by creation date' })
    @IsOptional()
    @ValidateNested()
    @Type(() => DateRangeFilter)
    createdAt?: DateRangeFilter;

    @ApiPropertyOptional({ description: 'Filter by modification date' })
    @IsOptional()
    @ValidateNested()
    @Type(() => DateRangeFilter)
    modifiedAt?: DateRangeFilter;

    @ApiPropertyOptional({ description: 'Filter by MIME type' })
    @IsOptional()
    @IsString()
    mimeType?: string;
}