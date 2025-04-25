import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplatesController } from './email-templates.controller';
import { EmailTemplatesService } from './email-templates.service';
import { EmailTemplate } from './entities/email-template.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([EmailTemplate]),
    ],
    providers: [EmailTemplatesService],
    exports: [EmailTemplatesService],
    controllers: [EmailTemplatesController],
})
export class EmailTemplatesModule {}