import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailConfigurationsService } from '../email-configurations/email-configurations.service';
import { EmailTemplatesService } from '../email-templates/email-templates.service';

@Injectable()
export class EmailSeederService implements OnModuleInit {
  private readonly logger = new Logger(EmailSeederService.name);

  constructor(
    private readonly emailConfigService: EmailConfigurationsService,
    private readonly emailTemplatesService: EmailTemplatesService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultEmailConfiguration();
    await this.seedDefaultEmailTemplates();
  }

  async seedDefaultEmailConfiguration() {
    try {
      // Check if a default configuration already exists
      try {
        await this.emailConfigService.getDefaultConfiguration();
        // this.logger.log('Default email configuration already exists, skipping seeder');
        return;
      } catch (error) {
        // No default config exists, proceed with seeding
        // this.logger.log('Creating default email configuration...');
      }

      // Create default email configuration using environment variables
      const defaultConfig = await this.emailConfigService.create({
        name: 'Default System Email',
        description: 'Default email configuration for system emails like verification, password reset, etc.',
        host: this.configService.getOrThrow<string>('EMAIL_HOST'),
        port: this.configService.getOrThrow<number>('EMAIL_PORT'),
        secure: this.configService.getOrThrow<boolean>('EMAIL_SECURE'),
        username: this.configService.getOrThrow<string>('EMAIL_USERNAME'),
        password: this.configService.getOrThrow<string>('EMAIL_PASSWORD'),
        fromEmail: this.configService.getOrThrow<string>('EMAIL_FROM'),
        fromName: this.configService.getOrThrow<string>('EMAIL_FROM_NAME'),
        isDefault: true,
      });

      // this.logger.log(`Default email configuration created: ${defaultConfig.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to seed default email configuration: ${errorMessage}`);
    }
  }

  async seedDefaultEmailTemplates() {
    try {
      // Define default templates to seed
      const templates = [
        {
          name: 'email-verification',
          subject: 'Verify Your Email Address',
          description: 'Email sent to users to verify their email address',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Verify Your Email Address</h2>
              <p>Hello {{firstName}},</p>
              <p>Thank you for registering. Please click the button below to verify your email address:</p>
              <p style="text-align: center;">
                <a href="{{verificationUrl}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Verify Email
                </a>
              </p>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p>{{verificationUrl}}</p>
              <p>This link will expire in {{expiry}} hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p>Thanks,<br>The Team</p>
            </div>
          `,
          textContent: `
            Verify Your Email Address
            
            Hello {{firstName}},
            
            Thank you for registering. Please click the link below to verify your email address:
            
            {{verificationUrl}}
            
            This link will expire in {{expiry}} hours.
            
            If you didn't create an account, you can safely ignore this email.
            
            Thanks,
            The Team
          `,
          requiredVariables: ['firstName', 'verificationUrl', 'expiry'],
          optionalVariables: ['lastName'],
          isActive: true,
        },
        {
          name: 'password-reset',
          subject: 'Reset Your Password',
          description: 'Email sent to users to reset their password',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Reset Your Password</h2>
              <p>Hello {{firstName}},</p>
              <p>We received a request to reset your password. Click the button below to set a new password:</p>
              <p style="text-align: center;">
                <a href="{{resetUrl}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Reset Password
                </a>
              </p>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p>{{resetUrl}}</p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
              <p>Thanks,<br>The Team</p>
            </div>
          `,
          textContent: `
            Reset Your Password
            
            Hello {{firstName}},
            
            We received a request to reset your password. Click the link below to set a new password:
            
            {{resetUrl}}
            
            This link will expire in 1 hour.
            
            If you didn't request a password reset, you can safely ignore this email.
            
            Thanks,
            The Team
          `,
          requiredVariables: ['firstName', 'resetUrl'],
          optionalVariables: ['lastName'],
          isActive: true,
        },
        {
          name: 'welcome',
          subject: 'Welcome to {{appName}}',
          description: 'Welcome email sent to users after registration',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to {{appName}}!</h2>
              <p>Hello {{firstName}},</p>
              <p>Thank you for joining us. We're excited to have you as a member of our community.</p>
              <p>Here are a few things you can do to get started:</p>
              <ul>
                <li>Complete your profile</li>
                <li>Explore our features</li>
                <li>Connect with other members</li>
              </ul>
              <p>If you have any questions, feel free to reply to this email.</p>
              <p>Best regards,<br>The {{appName}} Team</p>
            </div>
          `,
          textContent: `
            Welcome to {{appName}}!
            
            Hello {{firstName}},
            
            Thank you for joining us. We're excited to have you as a member of our community.
            
            Here are a few things you can do to get started:
            - Complete your profile
            - Explore our features
            - Connect with other members
            
            If you have any questions, feel free to reply to this email.
            
            Best regards,
            The {{appName}} Team
          `,
          requiredVariables: ['firstName', 'appName'],
          optionalVariables: ['lastName'],
          isActive: true,
        }
      ];

      // Seed each template if it doesn't exist
      for (const template of templates) {
        // Check if template already exists
        try {
          await this.emailTemplatesService.findByName(template.name);
          // this.logger.log(`Email template '${template.name}' already exists, skipping`);
        } catch (error) {
          // Template doesn't exist, create it
          const createdTemplate = await this.emailTemplatesService.create(template);
          // this.logger.log(`Created email template: ${template.name} (${createdTemplate.id})`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to seed email templates: ${errorMessage}`);
    }
  }
}