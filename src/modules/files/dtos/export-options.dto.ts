import { FileFormat } from '@/common/enums/file-format';
import { RoleScopeType } from '@/common/enums/role-scope-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class DocumentMetadata {
  @ApiPropertyOptional({
    description: 'Document title',
    example: 'Monthly Sales Report'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Document subtitle',
    example: 'Q1 2025'
  })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({
    description: 'Author name',
    example: 'System Administrator'
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({
    description: 'Company/organization name',
    example: 'ACME Corp.'
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({
    description: 'Custom filename',
    example: 'sales-report-2025-q1'
  })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({
    description: 'Document description',
    example: 'Quarterly sales data for all regions'
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ExportOptionsDto<T> {
  /**
   * Format of the export file
   */
  @ApiProperty({ 
    enum: FileFormat,
    description: 'Format of the export file',
    example: FileFormat.CSV
  })
  @IsEnum(FileFormat)
  @IsNotEmpty()
  format!: FileFormat;
  
  /**
   * Maximum number of records to export
   */
  @ApiPropertyOptional({
    description: 'Maximum number of records to export',
    type: Number,
    example: 1000
  })
  @IsOptional()
  @IsInt()
  maxRecords?: number;
  
  /**
   * Filter criteria
   */
  @ApiPropertyOptional({
    description: 'Filter criteria',
    example: { status: 'active', createdAt: { gte: '2023-01-01' } }
  })
  @IsOptional()
  @IsObject()
  filter?: Record<string, any>;
  
  /**
   * Relations to include
   * Can be a string array ["user", "profile"] or an object { user: true, profile: false }
   */
  @ApiPropertyOptional({
    description: 'Relations to include',
    example: { user: true, profile: false },
  })
  @IsOptional()
  relations?: Record<string, boolean> | string[];
  
  /**
   * Fields to select
   */
  @ApiPropertyOptional({
    type: [String],
    description: 'Fields to select',
    example: ['id', 'name', 'email']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  select?: string[];
  
  /**
   * Sort order
   */
  @ApiPropertyOptional({
    example: { createdAt: 'DESC' },
    description: 'Sort order',
    examples: [
      { createdAt: 'DESC' },
      { name: 'ASC' }
    ]
  })
  @IsOptional()
  @IsObject()
  sort?: Record<string, 'ASC' | 'DESC'>;
  
  /**
   * Scope for data access
   */
  @ApiPropertyOptional({
    enum: RoleScopeType,
    description: 'Scope for data access',
    example: RoleScopeType.BRANCH
  })
  @IsOptional()
  @IsEnum(RoleScopeType)
  scope?: RoleScopeType;
  
  /**
   * Field mapping from internal field names to external names
   * { internalField: 'External Field Name' }
   */
  @ApiPropertyOptional({
    description: 'Field mapping from internal field names to external names',
    example: { id: 'ID', name: 'Full Name', email: 'Email Address' }
  })
  @IsOptional()
  @IsObject()
  fieldMap?: Record<string, string>;

  /**
   * Custom data transformer function
   */
  // @ApiPropertyOptional({ 
  //   description: 'Custom data transformer function',
  //   example: '(entity) => ({ id: entity.id, name: entity.name })'
  // })
  // @IsOptional()
  // transformer?: (entity: T) => any;
  
  /**
   * Custom headers for the export file
   */
  @ApiPropertyOptional({
    description: 'Custom headers for the export file',
    example: { Region :"North America", Period: "Q1 2025" }
  })
  @IsOptional()
  customHeaders?: Record<string, string>;
  
  /**
   * Document metadata for PDF, XLSX and other formats
   */
  @ApiPropertyOptional({
    description: 'Document metadata',
    type: DocumentMetadata
  })
  @IsOptional()
  metadata?: DocumentMetadata;
  
  /**
   * Include column totals for numeric fields
   */
  // @ApiPropertyOptional({
  //   description: 'Include column totals for numeric fields',
  //   example: true
  // })
  // @IsOptional()
  // @IsBoolean()
  // includeTotals?: boolean;
}