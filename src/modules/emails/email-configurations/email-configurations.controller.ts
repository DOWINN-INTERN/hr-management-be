import { createController } from '@/common/factories/create-controller.factory';
import { EmailConfigurationDto, GetEmailConfigurationDto, UpdateEmailConfigurationDto } from './dtos/email-configuration.dto';
import { EmailConfigurationsService } from './email-configurations.service';
import { EmailConfiguration } from './entities/email-configuration.entity';

export class EmailConfigurationsController extends createController(EmailConfiguration, EmailConfigurationsService, GetEmailConfigurationDto, EmailConfigurationDto, UpdateEmailConfigurationDto)
{

}