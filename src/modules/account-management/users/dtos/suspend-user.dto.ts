import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsEmail, IsNotEmpty, IsDate, IsBoolean } from 'class-validator';

export class SuspendUserDto {
    @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
    @IsEmail()
    @IsNotEmpty()
    @Expose()
    email!: string;

    @ApiProperty({ example: true, description: 'Indicates if the user account is active' })
    @IsBoolean()
    @IsNotEmpty()
    @Expose()
    isActive!: boolean;

    @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'The start time of account suspension', required: false })
    @IsOptional()
    @IsDate()
    @Expose()
    suspensionStart?: Date;

    @ApiProperty({ example: '2023-01-02T00:00:00Z', description: 'The end time of account suspension', required: false })
    @IsOptional()
    @IsDate()
    @Expose()
    suspensionEnd?: Date;
  }
  