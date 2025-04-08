import { ApiProperty } from '@nestjs/swagger';
import { IsIP, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class ConnectDeviceDto {
  @ApiProperty({
    description: 'IP address of the biometric device',
    example: '192.168.1.100'
  })
  @IsNotEmpty()
  @IsIP(4, { message: 'IP address must be a valid IPv4 address' })
  ipAddress!: string;

  @ApiProperty({
    description: 'Port number of the biometric device',
    example: 4370,
    minimum: 1,
    maximum: 65535
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(65535)
  port!: number;
}