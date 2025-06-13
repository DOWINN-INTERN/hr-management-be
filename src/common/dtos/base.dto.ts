import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class BaseDto {
  @ApiPropertyOptional({
    description: 'Organization ID - Identifies the organization that owns or scopes this resource. Used for multi-tenant access control and resource partitioning.',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true
  })
  @IsOptional()
  @IsUUID()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Branch ID - Specifies the organizational branch that owns or scopes this resource. Represents a subdivision within the parent organization.',
    required: false,
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001',
    nullable: true
  })
  @IsOptional()
  @IsUUID()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({
    description: 'Department ID - Indicates the specific department that owns or scopes this resource. Used for departmental-level access control and resource organization.',
    type: String, 
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174002',
    nullable: true
  })
  @IsOptional()
  @IsUUID()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'User ID - Identifies the specific user who owns or has primary responsibility for this resource. Used for user-level permissions and audit trails.',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174003',
    nullable: true
  })
  @IsOptional()
  @IsUUID()
  @IsString()
  userId?: string;
}