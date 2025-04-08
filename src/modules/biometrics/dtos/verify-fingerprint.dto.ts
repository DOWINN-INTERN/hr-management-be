import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { IBiometricTemplate } from '../interfaces/biometric.interface';

export class VerifyFingerprintDto {
  @ApiProperty({
    description: 'ID of the device to perform verification on',
    example: '192.168.1.100:4370'
  })
  @IsNotEmpty()
  @IsString()
  deviceId!: string;

  @ApiProperty({
    description: 'Biometric template to verify',
    example: {
      id: 'user123-0',
      userId: 'user123',
      fingerId: 0,
      template: '<base64-encoded-template>',
      provider: 'zkteco'
    }
  })
  @IsObject()
  template!: IBiometricTemplate;
}