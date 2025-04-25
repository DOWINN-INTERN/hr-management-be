import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailConfigurationsController } from './email-configurations.controller';
import { EmailConfigurationsService } from './email-configurations.service';
import { EmailConfiguration } from './entities/email-configuration.entity';
import { DynamicMailerConfigService } from './services/dynamic-mailer-config.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([EmailConfiguration]),
        MailerModule.forRootAsync({
            imports: [EmailConfigurationsModule], // Import the module that provides the service
            useClass: DynamicMailerConfigService, // Use useExisting instead of useClass
        }),
    ],
    providers: [EmailConfigurationsService, DynamicMailerConfigService],
    exports: [EmailConfigurationsService, DynamicMailerConfigService],
    controllers: [EmailConfigurationsController],
})

export class EmailConfigurationsModule {}

