import { createGetDto } from '@/common/factories/create-get-dto.factory';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class AddressDto {
    @ApiProperty({
        description: 'Street name, building and house number',
        example: '123 Main St, Building A'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    streetNameBuildingHouseNumber!: string;

    @ApiProperty({
        description: 'Barangay name',
        example: 'Barangay 123'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    barangay!: string;

    @ApiProperty({
        description: 'City or municipality name',
        example: 'Manila'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    cityOrMunicipality!: string;

    @ApiProperty({
        description: 'Province name',
        example: 'Metro Manila'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    province!: string;

    @ApiProperty({
        description: 'Region name',
        example: 'NCR'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    region!: string;

    @ApiProperty({
        description: 'Postal code',
        example: 1000,
        type: Number
    })
    @IsNotEmpty()
    @IsNumber()
    postalCode!: number;
}

export class UpdateAddressDto extends PartialType(AddressDto) {}
export class GetAddressDto extends createGetDto(AddressDto) {}