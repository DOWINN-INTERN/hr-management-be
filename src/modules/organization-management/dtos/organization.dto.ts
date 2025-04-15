import { createGetDto } from '@/common/factories/create-get-dto.factory';
import { AddressDto } from '@/modules/addresses/dtos/address.dto';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class OrganizationDto {
    @ApiProperty({
        description: 'The name of the organization',
        example: 'Acme Corporation',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @ApiPropertyOptional({
        description: 'Description of the organization',
        example: 'Leading provider of innovative solutions',
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({
        description: 'URL or path to the organization logo',
        example: 'https://example.com/logo.png',
    })
    @IsString()
    @IsOptional()
    logo?: string;

    @ApiProperty({
        description: 'Unique alias/slug for the organization',
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

export class UpdateOrganizationDto extends PartialType(OrganizationDto) {}

export class GetOrganizationDto extends createGetDto(UpdateOrganizationDto, 'organization') {}
