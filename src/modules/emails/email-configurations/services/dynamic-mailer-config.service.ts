import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Injectable } from '@nestjs/common';
import { EmailConfigurationsService } from '../email-configurations.service';

@Injectable()
export class DynamicMailerConfigService implements MailerOptionsFactory {
  constructor(private emailConfigService: EmailConfigurationsService) {}

  async createMailerOptions(): Promise<MailerOptions> {
    // Get default configuration from database
    const defaultConfig = await this.emailConfigService.getMailerOptions();

    return {
      transport: {
        host: defaultConfig.host,
        port: defaultConfig.port,
        secure: defaultConfig.secure,
        auth: {
          user: defaultConfig.username,
          pass: defaultConfig.password,
        },
        debug: process.env.NODE_ENV !== 'production', // Enable debug output
        logger: process.env.NODE_ENV !== 'production', // Log to console
      },
      defaults: {
        from: `"${defaultConfig.fromName || defaultConfig.fromEmail}" <${defaultConfig.fromEmail}>`,
      },
      template: {
        // We'll use in-memory templates instead of filesystem templates
        // since our templates are stored in the database
        adapter: new HandlebarsAdapter({
          // Global helpers can be added here
          formatDate: (value: string) => new Date(value).toLocaleDateString(),
          year: () => new Date().getFullYear(),
        }),
        options: {
          strict: true,
        },
      },
    };
  }
}

