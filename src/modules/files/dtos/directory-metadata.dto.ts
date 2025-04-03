import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DirectoryMetadata {
  @ApiProperty({ description: 'Directory path/key' })
  key!: string;

  @ApiProperty({ description: 'Directory name' })
  name!: string;

  @ApiPropertyOptional({ description: 'Directory creation date' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Last modified date' })
  lastModified?: Date;

  @ApiPropertyOptional({ description: 'Item count in directory' })
  itemCount?: number;

  @ApiPropertyOptional({ description: 'Total size of all files in directory' })
  size?: number;

  @ApiPropertyOptional({ description: 'Whether this is a parent directory link' })
  isParent?: boolean;
}