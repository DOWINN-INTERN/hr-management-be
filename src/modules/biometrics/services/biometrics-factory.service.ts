import { Inject, Injectable } from '@nestjs/common';
import { IBiometricService } from '../interfaces/biometric.interface';
import { BiometricDevicesService } from './biometric-devices.service';

@Injectable()
export class BiometricsFactoryService {
  constructor(
    @Inject('ZKTECO_SERVICE') private readonly zktecoService: IBiometricService,
    @Inject('ANVIZ_SERVICE') private readonly anvizService: IBiometricService,
    private readonly biometricDevicesService: BiometricDevicesService
  ) {}

  /**
   * Get the appropriate biometric service based on device type
   * @param deviceType Type of biometric device (zkteco or anviz)
   */
  getService(deviceType: string): IBiometricService {
    switch (deviceType.toLowerCase()) {
      case 'anviz':
        return this.anvizService;
      case 'zkteco':
      default:
        return this.zktecoService;
    }
  }

  /**
   * Get the appropriate biometric service for an existing device
   * @param deviceId Device identifier
   */
  async getServiceByDeviceId(deviceId: string): Promise<IBiometricService> {
    // Look up the device in the database
    const device = await this.biometricDevicesService.findOneBy({ id: deviceId });
    
    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }
    
    // Return the appropriate service based on the provider
    return this.getService(device.provider as 'zkteco' | 'anviz');
  }
}