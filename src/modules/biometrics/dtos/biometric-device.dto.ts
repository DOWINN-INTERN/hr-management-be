import { BaseDto } from "@/common/dtos/base.dto";
import { BiometricDeviceType } from "@/common/enums/biometrics-device-type.enum";
import { createGetDto } from "@/common/factories/create-get-dto.factory";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsEnum, IsIP, IsNotEmpty, IsNumber, IsOptional, IsPort, IsString, MaxLength } from "class-validator";

export class BiometricDeviceDto extends PartialType(BaseDto) {
  @ApiProperty({
    description: 'Name of the biometric device',
    example: 'Main Entrance Scanner',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Unique identifier for the device (assigned by manufacturer)',
    example: 'ZK-123456',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @ApiProperty({
    description: 'IP address of the biometric device',
    example: '192.168.1.100',
    required: true
  })
  @IsIP()
  @IsNotEmpty()
  ipAddress!: string;

  @ApiProperty({
    description: 'Port number the device is accessible on',
    example: 4370,
    required: true
  })
  @IsNumber()
  @IsPort()
  port!: number;

  @ApiProperty({
    description: 'Model of the biometric device',
    example: 'F18',
    required: false,
    nullable: true
  })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({
    description: 'Serial number of the device',
    example: 'SN12345678',
    required: false,
    nullable: true
  })
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @ApiProperty({
    description: 'Provider/manufacturer of the biometric device',
    enum: BiometricDeviceType,
    default: BiometricDeviceType.ZKTECO,
    example: BiometricDeviceType.ZKTECO
  })
  @IsEnum(BiometricDeviceType)
  provider!: BiometricDeviceType;

  @ApiProperty({
    description: 'Firmware version of the device',
    example: '1.2.5',
    required: false,
    nullable: true
  })
  @IsString()
  @IsOptional()
  firmware?: string;

  @ApiProperty({
    description: 'Platform information of the device',
    example: 'ZKTeco Biometric Platform',
    required: false,
    nullable: true
  })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiProperty({
    description: 'Version of the device',
    example: 'V1.0',
    required: false,
    nullable: true
  })
  @IsString()
  @IsOptional()
  deviceVersion?: string;

  @ApiProperty({
    description: 'Operating system of the device',
    example: 'Linux Embedded',
    required: false,
    nullable: true
  })
  @IsString()
  @IsOptional()
  os?: string;

  @ApiProperty({
    description: 'Whether the device is currently connected',
    example: false,
    default: false
  })
  @IsBoolean()
  isConnected!: boolean;

  @ApiProperty({
    description: 'Whether the device is in offline mode',
    example: false,
    required: true
  })
  @IsBoolean()
  isOffline!: boolean;

  @ApiProperty({
    description: 'Date and time of the last synchronization',
    example: '2023-09-15T10:30:00Z',
    required: false,
    nullable: true
  })
  @IsDateString()
  @IsOptional()
  lastSync?: Date;
}

export class UpdateBiometricDeviceDto extends PartialType(BiometricDeviceDto) {}

export class GetBiometricDeviceDto extends createGetDto(UpdateBiometricDeviceDto, 'biometric device') {}