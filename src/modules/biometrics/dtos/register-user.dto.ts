import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ description: 'Target device ID' })
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @ApiProperty({ description: 'User ID', example: '1001' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 24, { message: 'Name must be between 1 and 24 characters' })
  name!: string;

  @ApiPropertyOptional({ description: 'User password (max 8 characters)', example: '1234' })
  @IsString()
  @IsOptional()
  @Length(0, 8, { message: 'Password must be less than 8 characters' })
  password?: string;

  @ApiPropertyOptional({ description: 'Card number', example: '7654321' })
  @IsString()
  @IsOptional()
  cardNumber?: string;

  @ApiPropertyOptional({ 
    description: 'User role (0 = normal user, 14 = admin)', 
    example: 0,
    minimum: 0,
    maximum: 14
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(14)
  role?: number;
}