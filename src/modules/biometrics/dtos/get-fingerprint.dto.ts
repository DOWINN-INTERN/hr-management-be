import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetFingerprintDto {
  @ApiProperty({ description: 'Device identifier' })
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @ApiProperty({ description: 'User ID', example: '1001' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiPropertyOptional({ 
    description: 'Finger ID (0-9)', 
    example: 0,
    default: 0,
    minimum: 0,
    maximum: 9
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9)
  @Type(() => Number)
  fingerId?: number;
}