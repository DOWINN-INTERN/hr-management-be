import { RoleScopeType } from '@/common/enums/role-scope-type.enum';
import { createGetDto } from '@/common/utils/create-get-dto';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class RoleDto {
  @ApiProperty({
    description: 'The name of the role',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @MinLength(3)
  name!: string;

  @ApiPropertyOptional({
    description: 'Description of the role',
    example: 'Administrator with full access',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  @MinLength(3)
  description?: string;

  @ApiPropertyOptional({
    description: 'The scope of the role',
    enum: RoleScopeType,
    default: RoleScopeType.OWNED,
  })
  @IsEnum(RoleScopeType)
  @IsNotEmpty()
  scope: RoleScopeType = RoleScopeType.OWNED;

  @ApiPropertyOptional({
    description: 'List of permission IDs to associate with this role',
    type: [String],
    example: ['uuid1', 'uuid2'],
  })
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];

  @ApiPropertyOptional({
    description: 'List of user IDs to assign this role to',
    type: [String],
    example: ['uuid1', 'uuid2'],
  })
  @IsUUID('4', { each: true })
  @IsOptional()
  userIds?: string[];
}

export class UpdateRoleDto extends PartialType(RoleDto) {}

export class GetRoleDto extends createGetDto(RoleDto) {}