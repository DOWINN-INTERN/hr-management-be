import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SetUserDto {
  @ApiProperty({
    description: 'Unique numeric ID for the user',
    example: 1
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  uid!: number;

  @ApiProperty({
    description: 'User ID string',
    example: 'user123'
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe'
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'User password (optional)',
    example: 'password123',
    required: false
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'User role (0=normal, 14=admin)',
    example: 0,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  role?: number;

  @ApiProperty({
    description: 'Card number (optional)',
    example: 12345,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  cardno?: number;
}