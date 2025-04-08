import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class EnrollUserDto {
  @ApiProperty({
    description: 'ID of the device to enroll the user on',
    example: '192.168.1.100:4370'
  })
  @IsNotEmpty()
  @IsString()
  deviceId!: string;

  @ApiProperty({
    description: 'User ID to enroll',
    example: 'user123'
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiProperty({
    description: 'Finger ID (0-9)',
    example: 0,
    minimum: 0,
    maximum: 9
  })
  @IsInt()
  @Min(0)
  @Max(9)
  fingerId!: number;
}