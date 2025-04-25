import { EmailStatus } from '@/common/enums/email-status.enum';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailConfigurationsService } from './email-configurations/email-configurations.service';
import { EmailConfiguration } from './email-configurations/entities/email-configuration.entity';
import { EmailTemplatesService } from './email-templates/email-templates.service';
import { Email } from './entities/email.entity';

export interface EmailSendOptions {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
    templateName?: string;
    templateContext?: Record<string, any>;
    attachments?: Array<{
      filename: string;
      content?: any;
      path?: string;
      contentType?: string;
      cid?: string;
    }>;
    from?: string;
    // Configuration selectors (prioritized in this order)
    configId?: string;
    configName?: string;
    department?: string;
    organization?: string;
    branch?: string;
  }

@Injectable()
export class EmailsService extends BaseService<Email> {
    
    constructor(
        @InjectRepository(Email)
        private readonly emailsRepository: Repository<Email>,
        protected readonly usersService: UsersService,
        private readonly emailConfigService: EmailConfigurationsService,
        private readonly emailTemplateService: EmailTemplatesService,
        private readonly mailerService: MailerService,
    ) {
        super(emailsRepository, usersService);
    }

    /**
     * Send an email with complete flexibility for sender configuration
     */
    async send(options: EmailSendOptions): Promise<boolean> {
        // Create a database record immediately with PENDING status
        const emailRecord = new Email({});
        emailRecord.to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
        emailRecord.cc = Array.isArray(options.cc) ? options.cc.join(', ') : options.cc;
        emailRecord.bcc = Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc;
        emailRecord.subject = options.subject || '';
        emailRecord.templateName = options.templateName;
        emailRecord.status = EmailStatus.PENDING;
        emailRecord.sentAt = new Date();
        
        try {
            // Determine which email configuration to use
            let emailConfig: EmailConfiguration;
            
            if (options.configId) {
                emailConfig = await this.emailConfigService.findOneByOrFail({ id: options.configId });
            } else if (options.configName) {
                emailConfig = await this.emailConfigService.findByName(options.configName);
            } else if (options.department) {
                emailConfig = await this.emailConfigService.getDepartmentConfiguration(options.department);
            } else if (options.organization) {
                emailConfig = await this.emailConfigService.getOrganizationConfiguration(options.organization);
            } else if (options.branch) {
                emailConfig = await this.emailConfigService.getBranchConfiguration(options.branch);
            } else {
                emailConfig = await this.emailConfigService.getDefaultConfiguration();
            }

            // Set the email configuration relationship
            emailRecord.emailConfiguration = emailConfig;

            // test connection first before sending
            const testConnection = await this.emailConfigService.testConnection(emailConfig);

            if (!testConnection) {
                this.logger.error(`Failed to connect to email server for configuration: ${emailConfig.name}`);
                return false;
            }
            
            // Prepare email content
            let subject = options.subject;
            let html = options.html;
            let text = options.text;

            // If using a template
            if (options.templateName) {
                const validation = await this.emailTemplateService.validateContext(
                options.templateName, 
                options.templateContext || {}
                );
                
                if (!validation.isValid) {
                    const errorMsg = `Missing required variables for template ${options.templateName}: ${validation.missingVariables.join(', ')}`;
                    this.logger.error(errorMsg);

                    // Update the email record with FAILED status
                    emailRecord.status = EmailStatus.FAILED;
                    emailRecord.error = errorMsg;
                    await this.emailsRepository.save(emailRecord);

                    return false;
                }

                const rendered = await this.emailTemplateService.renderTemplate(
                    options.templateName,
                    options.templateContext || {},
                    options.department
                );
                
                subject = rendered.subject;
                html = rendered.html;
                text = rendered.text;
            }

            // Update email record with content
            emailRecord.subject = subject || '';
            emailRecord.htmlContent = html;
            emailRecord.textContent = text;

            // Create a unique transporter name based on the configuration
            const transporterName = `config_${emailConfig.id}`;
                
            // Add or update the transporter for this configuration
            this.mailerService.addTransporter(transporterName, {
                host: emailConfig.host,
                port: emailConfig.port,
                secure: emailConfig.secure,
                auth: {
                    user: emailConfig.username,
                    pass: emailConfig.password,
                },
            });

            // Send the email using the specific transporter
            const mailOptions = {
                to: options.to,
                cc: options.cc,
                bcc: options.bcc,
                subject,
                text,
                html,
                attachments: options.attachments,
                from: options.from || `"${emailConfig.fromName || emailConfig.fromEmail}" <${emailConfig.fromEmail}>`,
                transporterName: transporterName, // Use the transporter we just added
            };

            await this.mailerService.sendMail(mailOptions);

            // You can also send the email to the platform emails for the recipients in here
            //

            /// Update the email record with SENT status
            emailRecord.status = EmailStatus.SENT;
            await this.emailsRepository.save(emailRecord);

            this.logger.log(`Email sent to ${options.to}, subject: ${subject}, using config: ${emailConfig.name}`);
            return true;
        } catch (error: unknown) {
            const errorMessage = `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`;
            this.logger.error(errorMessage, error instanceof Error ? error.stack : undefined);
            
            // Update the email record with FAILED status and error details
            emailRecord.status = EmailStatus.FAILED;
            emailRecord.error = errorMessage;
            await this.emailsRepository.save(emailRecord);
            
            return false;
        }
    }

    /**
     * Send a templated email with simpler options
     */
    async sendTemplatedEmail(
        to: string | string[],
        templateName: string,
        context: Record<string, any>,
        options: {
            cc?: string | string[];
            bcc?: string | string[];
            department?: string;
            organization?: string;
            branch?: string;
            attachments?: any[];
        } = {},
    ): Promise<boolean> {
        return this.send({
            to,
            cc: options.cc,
            bcc: options.bcc,
            templateName,
            templateContext: context,
            department: options.department,
            organization: options.organization,
            branch: options.branch,
            attachments: options.attachments,
        });
    }

    /**
     * Send a direct email without a template
     */
    async sendDirectEmail(
            to: string | string[],
            subject: string,
            content: { html?: string; text?: string },
            options: {
            cc?: string | string[];
            bcc?: string | string[];
            department?: string;
            organization?: string;
            branch?: string;
            attachments?: any[];
        } = {},
    ): Promise<boolean> {
        return this.send({
            to,
            cc: options.cc,
            bcc: options.bcc,
            subject,
            html: content.html,
            text: content.text,
            department: options.department,
            organization: options.organization,
            branch: options.branch,
            attachments: options.attachments,
        });
    }

    /**
     * Send a notification to multiple recipients
     */
    async sendBulkNotification(
        recipients: string[],
        subject: string,
        content: { html?: string; text?: string } | { templateName: string; context: Record<string, any> },
        options: {
        department?: string;
        organization?: string;
        batchSize?: number;
        } = {},
    ): Promise<{ success: number; failed: number }> {
        const batchSize = options.batchSize || 50;
        let success = 0;
        let failed = 0;

        // Process in batches to avoid overwhelming the email server
        for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        for (const recipient of batch) {
            let result: boolean;
            
            if ('templateName' in content) {
            result = await this.sendTemplatedEmail(
                recipient,
                content.templateName,
                content.context,
                {
                department: options.department,
                organization: options.organization,
                }
            );
            } else {
            result = await this.sendDirectEmail(
                recipient,
                subject,
                { html: content.html, text: content.text },
                {
                department: options.department,
                organization: options.organization,
                }
            );
            }
            
            if (result) {
            success++;
            } else {
            failed++;
            }
        }
        
        // Add a small delay between batches
        if (i + batchSize < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        }
        
        return { success, failed };
    }
}