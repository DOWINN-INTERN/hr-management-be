import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailConfigurationsModule } from './email-configurations/email-configurations.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { Email } from './entities/email.entity';
import { EmailSeederService } from './services/email-seeder.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Email]),
        RouterModule.register([
            {
                path: 'emails',
                module: EmailsModule,
            },
        ]),
        EmailTemplatesModule,
        EmailConfigurationsModule,
    ],
    providers: [EmailSeederService, EmailsService],
    exports: [
        EmailsService,
        EmailTemplatesModule,
        EmailConfigurationsModule,
    ],
    controllers: [EmailsController],
})
export class EmailsModule {}