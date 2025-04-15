import { BaseDto } from '@/common/dtos/base.dto';
import { ReferenceDto } from '@/common/dtos/reference.dto';
import { RoleScopeType } from '@/common/enums/role-scope-type.enum';
import { createGetDto } from '@/common/factories/create-get-dto.factory';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

export class RoleDto extends PartialType(BaseDto) {
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

  @ApiProperty({ 
    description: 'List of permissions assigned to this role', 
    type: [ReferenceDto],
    required: false 
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReferenceDto)
  permissions?: ReferenceDto[];

  @ApiPropertyOptional({ 
    description: 'Employees associated with this role',
    type: [ReferenceDto]
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReferenceDto)
  employees?: ReferenceDto[];
}

export class UpdateRoleDto extends PartialType(RoleDto) {}

export class GetRoleDto extends createGetDto(UpdateRoleDto, 'role') {}