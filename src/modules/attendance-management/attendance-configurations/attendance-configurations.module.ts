import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceConfigurationsController } from './attendance-configurations.controller';
import { AttendanceConfigurationsService } from './attendance-configurations.service';
import { AttendanceConfiguration } from './entities/attendance-configuration.entity';
import { AttendanceConfigurationSeederService } from './services/attendance-configuration-seeder.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([AttendanceConfiguration]),
    ],
    providers: [AttendanceConfigurationsService, AttendanceConfigurationSeederService],
    exports: [AttendanceConfigurationsService],
    controllers: [AttendanceConfigurationsController],
})
export class AttendanceConfigurationsModule {}