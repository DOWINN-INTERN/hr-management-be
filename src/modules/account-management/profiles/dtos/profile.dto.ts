import { createGetDto } from '@/common/factories/create-get-dto.factory';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional, IsString, IsUUID,
  ValidateNested
} from 'class-validator';
import { AddressDto } from '../../../addresses/dtos/address.dto';

export class ProfileDto {
  @ApiProperty({ description: 'User ID associated with the profile' })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: 'First name of the profile', example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @ApiProperty({ description: 'Middle name of the profile', required: false })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ description: 'Last name of the profile' })
  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @ApiProperty({ description: 'Suffix (Jr., Sr., etc.)', required: false })
  @IsOptional()
  @IsString()
  suffix?: string;

  @ApiProperty({ description: 'Gender of the profile', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ description: 'Sex of the profile', required: false })
  @IsOptional()
  @IsString()
  sex?: string;

  @ApiProperty({ description: 'Profile picture URL', required: false })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiProperty({ description: 'Birth date of the profile', required: false, type: Date, example: '1990-01-01' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthDate?: Date;

  @ApiProperty({ description: 'Civil status of the profile', required: false })
  @IsOptional()
  @IsString()
  civilStatus?: string;

  @ApiProperty({ description: 'Citizenship of the profile', required: false})
  @IsOptional()
  @IsString()
  citizenship?: string;

  @ApiProperty({ description: 'Nationality of the profile', required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({ description: 'Religion of the profile', required: false })
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiProperty({ description: 'Address information', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

export class UpdateProfileDto extends PartialType(ProfileDto) {}

export class GetProfileDto extends createGetDto(ProfileDto) {}
