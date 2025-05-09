import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Handlebars from 'handlebars';
import { Repository } from 'typeorm';
import { EmailTemplate } from './entities/email-template.entity';

@Injectable()
export class EmailTemplatesService extends BaseService<EmailTemplate> {
    constructor(
        @InjectRepository(EmailTemplate)
        private readonly emailTemplatesRepository: Repository<EmailTemplate>,
        protected readonly usersService: UsersService
    ) {
        super(emailTemplatesRepository, usersService);
    }

    async findByName(name: string): Promise<EmailTemplate> {
        const template = await this.emailTemplatesRepository.findOne({ where: { name, isActive: true } });
        if (!template) {
          throw new NotFoundException(`Email template with name ${name} not found`);
        }
        return template;
      }
    
      async findDepartmentTemplate(name: string, departmentId: string): Promise<EmailTemplate> {
        const template = await this.emailTemplatesRepository.findOne({ 
          // maybe error here
          where: { name, departmentId, isActive: true } 
        });
        
        if (!template) {
          // Fall back to general template if department-specific not found
          return this.findByName(name);
        }
        
        return template;
      }

    async renderTemplate(name: string, context: Record<string, any>, department?: string): Promise<{ subject: string; html: string; text?: string; }> {
        // Get the appropriate template based on department or default
        const template = department 
          ? await this.findDepartmentTemplate(name, department).catch(() => this.findByName(name))
          : await this.findByName(name);
        
        // Compile the templates
        const compiledSubject = Handlebars.compile(template.subject);
        const compiledHtml = Handlebars.compile(template.htmlContent);
        const compiledText = template.textContent ? Handlebars.compile(template.textContent) : null;
        
        // Render with provided context
        return {
          subject: compiledSubject(context),
          html: compiledHtml(context),
          text: compiledText ? compiledText(context) : undefined,
        };
      }
    
      async validateContext(templateName: string, context: Record<string, any>): Promise<{isValid: boolean; missingVariables: string[]}> {
        const template = await this.findByName(templateName);
        const missingVariables = [];
        
        if (template.requiredVariables) {
          for (const variable of template.requiredVariables) {
            if (context[variable] === undefined) {
              missingVariables.push(variable);
            }
          }
        }
        
        return {
          isValid: missingVariables.length === 0,
          missingVariables
        };
      }
}