import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DirectoryMetadata } from './directory-metadata.dto';
import { FileMetadata } from './file-meta-data.dto';

export class FileListResponseDto {
  @ApiProperty({ type: [FileMetadata], description: 'List of files' })
  files?: FileMetadata[];

  @ApiPropertyOptional({ type: [DirectoryMetadata], description: 'List of directories' })
  directories?: DirectoryMetadata[];

  @ApiProperty({ description: 'Total count of files in result' })
  count!: number;

  @ApiPropertyOptional({ description: 'Current directory/prefix' })
  prefix?: string;

  @ApiProperty({ description: 'Whether there are more results available' })
  hasMore!: boolean;

  @ApiPropertyOptional({ description: 'Pagination marker for next page' })
  nextMarker?: string;

  @ApiPropertyOptional({ description: 'Total size of all files in bytes' })
  totalSize?: number;

  @ApiPropertyOptional({ description: 'Parent directory path' })
  parentDir?: string;

  @ApiPropertyOptional({ description: 'Breadcrumb navigation path segments' })
  breadcrumbs?: Array<{ name: string, path: string }>;
}