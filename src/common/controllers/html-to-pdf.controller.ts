import { Authorize } from '@/common/decorators/authorize.decorator';
import { Action } from '@/common/enums/action.enum';
import {
    Body,
    Controller,
    HttpStatus,
    Logger,
    Post,
    Res,
    ValidationPipe
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiProperty, ApiPropertyOptional, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Response } from 'express';
import { HtmlToPdfService } from '../services/html-to-pdf.service';

export class MarginOptions {
    @ApiPropertyOptional({
        description: 'Top margin (e.g., "10mm", "1cm", "1in")',
        example: '10mm',
        type: String,
    })
    @IsOptional()
    @IsString()
    top?: string;

    @ApiPropertyOptional({
        description: 'Right margin (e.g., "10mm", "1cm", "1in")',
        example: '10mm',
        type: String,
    })
    @IsOptional()
    @IsString()
    right?: string;

    @ApiPropertyOptional({
        description: 'Bottom margin (e.g., "10mm", "1cm", "1in")',
        example: '10mm',
        type: String,
    })
    @IsOptional()
    @IsString()
    bottom?: string;

    @ApiPropertyOptional({
        description: 'Left margin (e.g., "10mm", "1cm", "1in")',
        example: '10mm',
        type: String,
    })
    @IsOptional()
    @IsString()
    left?: string;
}

export class HtmlToPdfDto {
    @ApiProperty({
        description: 'HTML content to convert to PDF',
        example: '<html><body><h1>Hello World</h1></body></html>',
        type: String,
    })
    @IsString()
    html!: string;

    @ApiPropertyOptional({
        description: 'Name of the generated PDF file',
        example: 'output.pdf',
        type: String,
    })
    @IsOptional()
    @IsString()
    fileName?: string;

    @ApiPropertyOptional({
        description: 'HTML template for the page header',
        example: '<div style="text-align: center;">Page Header</div>',
        type: String,
    })
    @IsOptional()
    @IsString()
    headerTemplate?: string;

    @ApiPropertyOptional({
        description: 'HTML template for the page footer',
        example: '<div style="text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
        type: String,
    })
    @IsOptional()
    @IsString()
    footerTemplate?: string;

    @ApiPropertyOptional({
        description: 'Page margin options',
        type: MarginOptions,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => MarginOptions)
    margins?: MarginOptions;

    @ApiPropertyOptional({
        description: 'Whether to generate PDF in landscape orientation',
        example: false,
        default: false,
        type: Boolean,
    })
    @IsOptional()
    @IsBoolean()
    landscape?: boolean;
}

export class UrlToPdfDto {
    @ApiProperty({
        description: 'URL to convert to PDF',
        example: 'https://example.com',
        type: String,
    })
    @IsUrl()
    url!: string;

    @ApiPropertyOptional({
        description: 'Name of the generated PDF file',
        example: 'output.pdf',
        type: String,
    })
    @IsOptional()
    @IsString()
    fileName?: string;

    @ApiPropertyOptional({
        description: 'Page margin options',
        type: MarginOptions,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => MarginOptions)
    margins?: MarginOptions;
    
    @ApiPropertyOptional({
        description: 'Whether to generate PDF in landscape orientation',
        example: false,
        default: false,
        type: Boolean,
    })
    @IsOptional()
    @IsBoolean()
    landscape?: boolean;
}

export class TemplateToPdfDto {
    @ApiProperty({
        description: 'Template name or content to convert to PDF',
        example: 'invoice-template',
        type: String,
    })
    @IsString()
    template!: string;

    @ApiProperty({
        description: 'Data to be injected into the template',
        example: { name: 'John Doe', items: [{ name: 'Item 1', price: 10 }] },
        type: Object,
    })
    @IsObject()
    data!: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Name of the generated PDF file',
        example: 'output.pdf',
        type: String,
    })
    @IsOptional()
    @IsString()
    fileName?: string;

    @ApiPropertyOptional({
        description: 'HTML template for the page header',
        example: '<div style="text-align: center;">Page Header</div>',
        type: String,
    })
    @IsOptional()
    @IsString()
    headerTemplate?: string;

    @ApiPropertyOptional({
        description: 'HTML template for the page footer',
        example: '<div style="text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
        type: String,
    })
    @IsOptional()
    @IsString()
    footerTemplate?: string;

    @ApiPropertyOptional({
        description: 'Page margin options',
        type: MarginOptions,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => MarginOptions)
    margins?: MarginOptions;
    
    @ApiPropertyOptional({
        description: 'Whether to generate PDF in landscape orientation',
        example: false,
        default: false,
        type: Boolean,
    })
    @IsOptional()
    @IsBoolean()
    landscape?: boolean;
}

@ApiTags('PDF Utilities')
@Controller('utils/pdf')
export class PdfUtilsController {
    private readonly logger = new Logger(PdfUtilsController.name);

    constructor(private readonly htmlToPdfService: HtmlToPdfService) {}

   // Fix for urlToPdf method - remove passthrough and handle response consistently
@Post('from-url')
@ApiOperation({ summary: 'Convert a URL to PDF' })
@ApiBody({ type: UrlToPdfDto })
@ApiResponse({ status: 200, description: 'PDF file' })
@ApiResponse({ status: 400, description: 'Invalid input' })
@ApiResponse({ status: 500, description: 'PDF generation error' })
@Authorize({ endpointType: Action.CREATE })
async urlToPdf(
    @Body(ValidationPipe) dto: UrlToPdfDto,
    @Res() res: Response
) {
    let page = null;
    try {
        // Use Puppeteer to navigate to URL and generate PDF
        const browser = await this.htmlToPdfService.getBrowser();
        page = await browser.newPage();
        
        await page.goto(dto.url, { 
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: dto.margins || {
                top: '30mm',
                right: '20mm',
                bottom: '30mm',
                left: '20mm'
            },
            landscape: dto.landscape || false
        });
        
        const filename = dto.fileName || `webpage_${Date.now()}.pdf`;
        const safeFilename = encodeURIComponent(filename.replace(/\s/g, '_'));
        
        // DON'T use return here - just send the response
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeFilename}"`,
            'Content-Length': pdfBuffer.length.toString(),
        });
        res.send(pdfBuffer);
    } catch (error: any) {
        // Only send error if headers haven't been sent yet
        if (!res.headersSent) {
            this.logger.error(`URL to PDF error: ${error.message}`, error.stack);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: `Failed to generate PDF from URL: ${error.message}`
            });
        } else {
            this.logger.error(`URL to PDF error after headers sent: ${error.message}`, error.stack);
        }
    } finally {
        // Ensure page is closed even if there's an error
        if (page) {
            await page.close().catch(e => 
                this.logger.error(`Error closing page: ${e.message}`)
            );
        }
    }
}

private replacePlaceholders(template: string, data: Record<string, any>): string {
        let result = template;
        
        // Replace simple placeholders like {{name}}
        Object.entries(data).forEach(([key, value]) => {
            const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            result = result.replace(placeholder, String(value ?? ''));
        });
        
        // Handle nested objects with dot notation (e.g., {{employee.firstName}})
        const nestedPlaceholderRegex = /{{([^{}]+)}}/g;
        let match;
        
        while ((match = nestedPlaceholderRegex.exec(result)) !== null) {
            const placeholder = match[0];
            const path = match[1].trim();
            
            try {
                const value = path.split('.').reduce((obj, prop) => obj?.[prop], data);
                if (value !== undefined) {
                    result = result.replace(placeholder, String(value));
                }
            } catch (e) {
                // Leave placeholder if path doesn't exist
            }
        }
        
        return result;
    }

// Fix for templateToPdf method - use consistent response handling
@Post('from-template')
@ApiOperation({ summary: 'Convert a template with data to PDF' })
@ApiBody({ type: TemplateToPdfDto })
@ApiResponse({ status: 200, description: 'PDF file' })
@ApiResponse({ status: 400, description: 'Invalid input' })
@ApiResponse({ status: 500, description: 'PDF generation error' })
@Authorize({ endpointType: Action.CREATE })
async templateToPdf(
    @Body(ValidationPipe) dto: TemplateToPdfDto,
    @Res() res: Response
) {
    try {
        // Replace placeholders in template
        const renderedHtml = this.replacePlaceholders(dto.template, dto.data);
        
        const pdfBuffer = await this.htmlToPdfService.generatePdf(
            renderedHtml, {
                fileName: dto.fileName,
                headerTemplate: dto.headerTemplate,
                footerTemplate: dto.footerTemplate,
                margins: dto.margins,
                landscape: dto.landscape
            }
        );
        
        const filename = dto.fileName || `document_${Date.now()}.pdf`;
        const safeFilename = encodeURIComponent(filename.replace(/\s/g, '_'));
        
        // DON'T use return here
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeFilename}"`,
            'Content-Length': pdfBuffer.length.toString(),
        });
        res.send(pdfBuffer);
    } catch (error: any) {
        // Only send error if headers haven't been sent yet
        if (!res.headersSent) {
            this.logger.error(`Template to PDF error: ${error.message}`, error.stack);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: `Failed to generate PDF from template: ${error.message}`
            });
        } else {
            this.logger.error(`Template to PDF error after headers sent: ${error.message}`, error.stack);
        }
    }
}
}