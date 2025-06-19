import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollConfiguration } from './entities/payroll-configuration.entity';
import { PayrollConfigurationController } from './payroll-configuration.controller';
import { PayrollConfigurationService } from './payroll-configuration.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([PayrollConfiguration]),
    ],
    providers: [PayrollConfigurationService],
    exports: [PayrollConfigurationService],
    controllers: [PayrollConfigurationController],
})
export class PayrollConfigurationModule {}