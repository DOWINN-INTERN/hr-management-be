import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { Repository } from 'typeorm';
import { EmailConfiguration } from './entities/email-configuration.entity';

@Injectable()
export class EmailConfigurationsService extends BaseService<EmailConfiguration> {
    constructor(
        @InjectRepository(EmailConfiguration)
        private readonly emailConfigurationsRepository: Repository<EmailConfiguration>,
        protected readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) {
        super(emailConfigurationsRepository, usersService);
    }

    async findByName(name: string): Promise<EmailConfiguration> {
        const config = await this.emailConfigurationsRepository.findOne({ where: { name } });
        if (!config) {
          throw new NotFoundException(`Email configuration with name ${name} not found`);
        }
        return config;
    }

    async testConnection(config: EmailConfiguration): Promise<boolean> {
        try {
          const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
              user: config.username,
              pass: config.password,
            },
          });
          
          await transporter.verify();
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(`SMTP connection test failed: ${errorMessage}`);
          return false;
        }
      }

    async getMailerOptions(): Promise<Partial<EmailConfiguration>> {
        try {
            // First try to get default configuration from database
            return await this.getDefaultConfiguration();
        } catch (error) {
            // If no default config in database, fall back to environment variables
            return {
                host: this.configService.getOrThrow<string>('EMAIL_HOST'),
                port: this.configService.getOrThrow<number>('EMAIL_PORT'),
                secure: this.configService.getOrThrow<boolean>('EMAIL_SECURE'),
                username: this.configService.getOrThrow<string>('EMAIL_USERNAME'),
                password: this.configService.getOrThrow<string>('EMAIL_PASSWORD'),
                fromEmail: this.configService.getOrThrow<string>('EMAIL_FROM'),
                fromName: this.configService.getOrThrow<string>('EMAIL_FROM_NAME'),
            };
        }
    }

    async getDefaultConfiguration(): Promise<EmailConfiguration> {
        const config = await this.emailConfigurationsRepository.findOne({ 
            where: { isDefault: true, isDeleted: false },
            select: ['id', 'name', 'host', 'port', 'secure', 'username', 'password', 'fromEmail', 'fromName']
        });
        
        if (!config) {
            throw new NotFoundException('No default email configuration found');
        }
        
        return config;
    }

    async getDepartmentConfiguration(departmentId: string): Promise<EmailConfiguration> {
        const config = await this.emailConfigurationsRepository.findOne({ 
            where: { departmentId, isDeleted: false },
            select: ['id', 'name', 'host', 'port', 'secure', 'username', 'password', 'fromEmail', 'fromName']
        });
        
        if (!config) {
            return this.getDefaultConfiguration();
        }
        
        return config;
    }

    async getOrganizationConfiguration(organizationId: string): Promise<EmailConfiguration> {
        const config = await this.emailConfigurationsRepository.findOne({ 
            where: { organizationId, isDeleted: false },
            select: ['id', 'name', 'host', 'port', 'secure', 'username', 'password', 'fromEmail', 'fromName']
        });
        
        if (!config) {
            return this.getDefaultConfiguration();
        }
        
        return config;
    }

    async getBranchConfiguration(branchId: string): Promise<EmailConfiguration> {
        const config = await this.emailConfigurationsRepository.findOne({ 
            where: { branchId, isDeleted: false },
            select: ['id', 'name', 'host', 'port', 'secure', 'username', 'password', 'fromEmail', 'fromName']
        });
        
        if (!config) {
            return this.getDefaultConfiguration();
        }
        
        return config;
    }

    async setAsDefault(id: string): Promise<EmailConfiguration> {
        // First, remove default status from all configurations
        await this.emailConfigurationsRepository.update({}, { isDefault: false });
        
        // Then set the specified one as default
        await this.emailConfigurationsRepository.update(id, { isDefault: true });
        return this.findOneByOrFail({ id });
    }
}