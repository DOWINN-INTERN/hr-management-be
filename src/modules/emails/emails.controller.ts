import { createController } from "@/common/factories/create-controller.factory";
import { Body, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { EmailDto, GetEmailDto, UpdateEmailDto } from "./dtos/email.dto";
import { EmailsService } from "./emails.service";
import { Email } from "./entities/email.entity";

export class EmailsController extends createController(Email, EmailsService, GetEmailDto, EmailDto, UpdateEmailDto)
{
  // // Email sending endpoints
  // @Post('send')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Send an email' })
  // @ApiResponse({ status: HttpStatus.OK, description: 'Email sent successfully' })
  // async sendEmail(@Body() sendEmailDto: EmailDto): Promise<{ success: boolean; message: string }> {
  //   const result = await this.baseService.send(sendEmailDto);
    
  //   return {
  //     success: result,
  //     message: result 
  //       ? 'Email sent successfully' 
  //       : 'Failed to send email',
  //   };
  // }

  @Post('send-template')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a templated email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email sent successfully' })
  async sendTemplatedEmail(
    @Body() body: { 
      to: string | string[];
      templateName: string;
      context: Record<string, any>;
      cc?: string | string[];
      bcc?: string | string[];
      department?: string;
      organization?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.baseService.sendTemplatedEmail(
      body.to,
      body.templateName,
      body.context,
      {
        cc: body.cc,
        bcc: body.bcc,
        department: body.department,
        organization: body.organization,
      }
    );
    
    return {
      success: result,
      message: result 
        ? 'Templated email sent successfully' 
        : 'Failed to send templated email',
    };
  }
}