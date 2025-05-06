import { AttendancePunch } from '@/modules/attendance-management/attendance-punches/entities/attendance-punch.entity';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiometricDevicesController } from './biometric-devices.controller';
import { BiometricsController } from './biometrics.controller';
import { BiometricDevice } from './entities/biometric-device.entity';
import { BiometricTemplate } from './entities/biometric-template.entity';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { AnvizBiometricsService } from './services/anvis-biometrics.service';
import { BiometricDevicesService } from './services/biometric-devices.service';
import { BiometricsFactoryService } from './services/biometrics-factory.service';
import { BiometricsPollingService } from './services/biometrics-polling.service';
import { ZKTecoBiometricsService } from './services/zkteco-biometrics.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([BiometricDevice, BiometricTemplate, AttendancePunch]),
        RouterModule.register([{
            path: 'biometrics',
            module: BiometricsModule,
        }]),
    ],
    controllers: [BiometricsController, BiometricDevicesController],
    providers: [
        // Register ZKTeco service
        {
            provide: 'ZKTECO_SERVICE',
            useClass: ZKTecoBiometricsService,
        },
        // Register Anviz service
        {
            provide: 'ANVIZ_SERVICE',
            useClass: AnvizBiometricsService,
        },
        // Register the legacy token for backward compatibility
        {
            provide: 'BIOMETRIC_SERVICE',
            useExisting: 'ZKTECO_SERVICE', // Default to ZKTeco for backward compatibility
        },
        {
            provide: TimeoutInterceptor,
            useFactory: () => new TimeoutInterceptor(30),
        },
        BiometricsPollingService,
        BiometricDevicesService,
        BiometricsFactoryService,
    ],
    exports: [
        'ZKTECO_SERVICE',
        'ANVIZ_SERVICE',
        'BIOMETRIC_SERVICE',
        BiometricDevicesService,
        BiometricsFactoryService,
    ],
})
export class BiometricsModule {}