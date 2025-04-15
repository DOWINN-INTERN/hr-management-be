import { createGetDto } from '@/common/factories/create-get-dto.factory';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsInt, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateNested } from 'class-validator';
import { ProfileDto } from '../../profiles/dtos/profile.dto';

export class UserDto {
    @ApiProperty({
        description: 'The email address of the user',
        example: 'user@example.com'
    })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsOptional()
    email?: string;

    @ApiProperty({
        description: 'User password',
        example: 'StrongP@ssw0rd',
        minLength: 8
    })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password!: string;

    @ApiProperty({
        description: 'Unique username',
        example: 'john_doe'
    })
    @IsString()
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    userName!: string;

    @ApiPropertyOptional({
        description: 'User\'s phone number',
        example: '+1234567890'
    })
    @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
    @IsOptional()
    phoneNumber?: string;

    @ApiPropertyOptional({
        description: 'Whether the email has been verified',
        default: false
    })
    @IsBoolean()
    @IsOptional()
    emailVerified?: boolean;

    @ApiPropertyOptional({
        description: 'Whether the phone number has been verified',
        default: false
    })
    @IsBoolean()
    @IsOptional()
    phoneNumberVerified?: boolean;

    @ApiPropertyOptional({
        description: 'Number of failed access attempts',
        default: 0
    })
    @IsInt()
    @IsOptional()
    accessFailedCount?: number;

    @ApiPropertyOptional({
        description: 'Whether lockout is enabled for this user',
        default: false
    })
    @IsBoolean()
    @IsOptional()
    lockoutEnabled?: boolean;

    @ApiPropertyOptional({
        description: 'Whether the user is currently locked out',
        default: false
    })
    @IsBoolean()
    @IsOptional()
    lockedOut?: boolean;

    @ApiPropertyOptional({
        description: 'The timestamp when lockout started',
        example: '2023-01-01T00:00:00Z'
    })
    @IsDate()
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    lockOutStart?: Date;

    @ApiPropertyOptional({
        description: 'The timestamp when lockout ends',
        example: '2023-01-02T00:00:00Z'
    })
    @IsDate()
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    lockOutEnd?: Date;

    @ApiProperty({ description: 'Profile information', required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => ProfileDto)
    profile?: ProfileDto;
}

export class UpdateUserDto extends PartialType(UserDto) {}

export class GetUserDto extends createGetDto(UpdateUserDto, 'user') {}