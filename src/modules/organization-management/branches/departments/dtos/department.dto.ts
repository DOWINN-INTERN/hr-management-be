import { createGetDto } from '@/common/factories/create-get-dto.factory';
import { AddressDto } from '@/modules/addresses/dtos/address.dto';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';

export class DepartmentDto {
  @ApiProperty({ description: 'Branch ID associated with the branch' })
  @IsNotEmpty()
  @IsUUID()
  branchId!: string;

  @ApiProperty({
    description: 'The name of the Department',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    description: 'Description of the Department',
    example: 'Leading provider of innovative solutions',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'URL or path to the Department logo',
    example: 'https://example.com/logo.png',
  })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({
    description: 'Unique alias/slug for the Department',
    example: 'acme-corp',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  alias!: string;

  @ApiProperty({ description: 'Address information', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

export class UpdateDepartmentDto extends PartialType(DepartmentDto) {}

export class GetDepartmentDto extends createGetDto(UpdateDepartmentDto) {}
