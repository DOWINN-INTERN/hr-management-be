import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length, Min } from 'class-validator';

export class GetBiometricUserDto {
  @ApiProperty({
    description: 'Target device ID',
    type: String
  })
  
  @IsString({ message: 'Device ID must be a string' })
  @IsNotEmpty({ message: 'Device ID is required and cannot be empty' })
  deviceId!: string;

  @ApiProperty({ 
    description: 'User ID in the biometric device',
    type: Number
  })
  @IsNotEmpty({ message: 'Biometric user ID is required and cannot be empty' })
  @IsPositive({ message: 'Biometric user ID must be a positive number' })
  @IsNumber({}, { message: 'Biometric user ID must be a valid number' })
  biometricUserId!: number;
}

export class BiometricUserDto extends GetBiometricUserDto {
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 24, { message: 'Name must be between 1 and 24 characters' })
  name!: string;

  @ApiPropertyOptional({ 
    description: 'User password (if applicable)', 
    example: 123456 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Password must be a number' })
  @Min(0, { message: 'Password must be a non-negative number' })
  password?: number;

  @ApiPropertyOptional({ 
    description: 'User card number (if applicable)', 
    example: 1234567890 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Card number must be a number' })
  @Min(0, { message: 'Card number must be a non-negative number' })
  cardNumber?: number;
}