import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIP, IsInt, IsOptional, Max, Min } from 'class-validator';
import { BiometricDeviceType } from '../entities/biometric-device.entity';

export class ConnectDeviceDto {
    @ApiProperty({
        description: 'Device IP address',
        example: '192.168.1.100'
    })
    @IsIP(4)
    ipAddress!: string;

    @ApiProperty({
        description: 'Device port number',
        example: 4370,
        default: 4370
    })
    @IsInt()
    @Min(1)
    @Max(65535)
    port: number = 4370;

    @ApiProperty({
        description: 'Device type/manufacturer',
        enum: BiometricDeviceType,
        default: BiometricDeviceType.ZKTECO,
        example: 'zkteco'
    })
    @IsEnum(BiometricDeviceType)
    @IsOptional()
    deviceType?: string;
}