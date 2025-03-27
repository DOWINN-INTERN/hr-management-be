import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { SuspendUserDto } from './suspend-user.dto';
import { Expose } from 'class-transformer';

export class UpdateUserDto extends SuspendUserDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The unique identifier of the user' })
    @IsString()
    @IsNotEmpty()
    @Expose()
    id!: string;

    @ApiProperty({ example: 'John', description: 'The first name of the user' })
    @IsString()
    @IsNotEmpty()
    @Expose()
    firstName!: string;

    @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
    @IsString()
    @IsNotEmpty()
    @Expose()
    lastName!: string;

    @ApiProperty({ example: '+1234567890', description: 'The phone number of the user', required: false })
    @IsOptional()
    @IsString()
    @Expose()
    phoneNumber?: string;

    @ApiProperty({ example: '123 Main St, Anytown, USA', description: 'The address of the user', required: false })
    @IsOptional()
    @IsString()
    @Expose()
    address?: string;

    @ApiProperty({ example: 'male', description: 'The gender of the user', required: false })
    @IsOptional()
    @IsString()
    @Expose()
    gender?: string;

    @ApiProperty({ example: 'https://example.com/profile.jpg', description: 'The URL of the user\'s profile picture', required: false })
    @IsOptional()
    @IsString()
    @Expose()
    profilePicture?: string;
  }
  