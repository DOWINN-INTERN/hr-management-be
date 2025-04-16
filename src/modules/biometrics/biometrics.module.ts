import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../account-management/users/users.module';
import { BiometricsController } from './biometrics.controller';
import { BiometricDevice } from './entities/biometric-device.entity';
import { BiometricTemplate } from './entities/biometric-template.entity';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { BiometricDevicesService } from './services/biometric-devices.service';
import { BiometricsPollingService } from './services/biometrics-polling.service';
import { ZKTecoBiometricsService } from './services/zkteco-biometrics.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([BiometricDevice, BiometricTemplate]),
        EventEmitterModule.forRoot(),
        RouterModule.register([
            {
                path: 'biometrics',
                module: BiometricsModule,
            },
        ]),
        UsersModule,
    ],
    controllers: [BiometricsController],
    providers: [
        {
            provide: 'BIOMETRIC_SERVICE',
            useClass: ZKTecoBiometricsService,
        },
        {
            provide: TimeoutInterceptor,
            useFactory: () => new TimeoutInterceptor(30), // specify timeout in seconds
        },
        BiometricsPollingService,
        BiometricDevicesService
    ],
    exports: ['BIOMETRIC_SERVICE', BiometricDevicesService],
})
export class BiometricsModule {}