import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SyncUsersDto {
  @ApiProperty({
    description: 'Source device ID to copy users from',
    example: '192.168.1.100:4370'
  })
  @IsNotEmpty()
  @IsString()
  sourceDeviceId!: string;

  @ApiProperty({
    description: 'Target device ID to copy users to',
    example: '192.168.1.101:4370'
  })
  @IsNotEmpty()
  @IsString()
  targetDeviceId!: string;
}