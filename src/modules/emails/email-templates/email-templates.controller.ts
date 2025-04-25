import { createController } from "@/common/factories/create-controller.factory";
import { Body, Post } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { GetEmailTemplateDto, UpdateEmailTemplateDto } from "./dtos/email-template.dto";
import { EmailTemplatesService } from "./email-templates.service";
import { EmailTemplate } from "./entities/email-template.entity";

export class EmailTemplatesController extends createController(EmailTemplate, EmailTemplatesService, GetEmailTemplateDto, EmailTemplate, UpdateEmailTemplateDto)
{
    @Post('templates/preview')
    @ApiOperation({ summary: 'Preview rendered email template' })
    async previewTemplate(
        @Body() body: { templateName: string; context: Record<string, any>; department?: string }
    ): Promise<{ subject: string; html: string; text?: string }> {
        return this.baseService.renderTemplate(
            body.templateName,
            body.context,
            body.department
        );
  }
}