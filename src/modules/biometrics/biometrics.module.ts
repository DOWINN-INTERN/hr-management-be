import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiometricsController } from './biometrics.controller';
import { BiometricDevice } from './entities/biometric-device.entity';
import { BiometricTemplate } from './entities/biometric-template.entity';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
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
    ],
    controllers: [BiometricsController],
    providers: [
        {
            provide: 'BIOMETRIC_SERVICE',
            useClass: ZKTecoBiometricsService,
        },
        // Add this provider for the interceptor
        {
            provide: TimeoutInterceptor,
            useFactory: () => new TimeoutInterceptor(30), // specify timeout in seconds
        },
        BiometricsPollingService,
    ],
    exports: ['BIOMETRIC_SERVICE'],
})
export class BiometricsModule {}