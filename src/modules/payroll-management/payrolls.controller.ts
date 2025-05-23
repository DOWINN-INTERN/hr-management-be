import { Authorize } from '@/common/decorators/authorize.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GeneralResponseDto } from '@/common/dtos/generalresponse.dto';
import { Action } from '@/common/enums/action.enum';
import { createController } from '@/common/factories/create-controller.factory';
import { UtilityHelper } from '@/common/helpers/utility.helper';
import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Body, Get, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Queue } from 'bull';
import { Response } from 'express';
import { PayrollBatchProcessRequestDto, PayrollBatchProcessResponseDto } from './dtos/payroll-batch-process.dto';
import { GetPayrollDto, PayrollDto, UpdatePayrollDto } from "./dtos/payroll.dto";
import { RecalculateOptionsDto } from './dtos/recalculate-options.dto';
import { ReleasePayrollDto } from './dtos/release-payroll.dto';
import { Payroll } from "./entities/payroll.entity";
import { PayrollsService } from './payrolls.service';
import { generateMiniPayslipPdf } from './utils/payslip-pdf-generator';
export class PayrollsController extends createController(Payroll, PayrollsService, GetPayrollDto, PayrollDto, UpdatePayrollDto)
{
    constructor(
        protected baseService: PayrollsService,
        @InjectQueue('payroll-processing') private payrollQueue: Queue
    ) {
        super(baseService);
    }

    override async create(entityDto: PayrollDto, createdById: string): Promise<GetPayrollDto> {
        return await super.create(entityDto, createdById);
    }

    override async update(id: string, entityDto: UpdatePayrollDto, updatedById: string): Promise<GetPayrollDto> {
        return await this.baseService.update(id, entityDto, updatedById);
    }

    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }

    override async softDelete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return await super.softDelete(id, deletedBy);
    }

    override async findOne(fieldsString: string, relations?: string, select?: string): Promise<GetPayrollDto> {
        return await super.findOne(fieldsString, relations, select);
    }
    
    @Post('process/employee/:employeeId/cutoff/:cutoffId')
    @Authorize({ endpointType: Action.CREATE })
    @ApiOperation({
        summary: 'Process payroll for a specific employee and cutoff',
        description: 'Generates and calculates a complete payroll for an employee for a given cutoff period'
    })
    @ApiParam({
        name: 'employeeId',
        description: 'ID of the employee to process payroll for',
        required: true
    })
    @ApiParam({
        name: 'cutoffId',
        description: 'ID of the cutoff period to process',
        required: true
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payroll successfully processed',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid request or payroll already processed',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Employee or cutoff not found'
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
        type: GeneralResponseDto
    })
    async processPayrollForEmployee(
        @Param('employeeId', ParseUUIDPipe) employeeId: string,
        @Param('cutoffId', ParseUUIDPipe) cutoffId: string,
        @CurrentUser('sub') userId: string
    ): Promise<Partial<GeneralResponseDto>> {
        const payroll = await this.baseService.processPayrollForEmployee(employeeId, cutoffId, userId);
        return {
            message: `Payroll processed successfully for employee ${employeeId} in cutoff ${cutoffId}`,
        }
    }

    @Patch(':id/archive')
    @Authorize({ endpointType: Action.UPDATE })
    @ApiOperation({
        summary: 'Archive a payroll',
        description: 'Moves payroll to archived state for long-term storage'
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the payroll to archive',
        required: true
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payroll archived successfully',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Payroll not found',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Payroll cannot be archived (invalid status)',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
        type: GeneralResponseDto
    })
    async archivePayroll(
        @Param('id', ParseUUIDPipe) id: string
    ): Promise<Partial<GeneralResponseDto>> {
        const payroll = await this.baseService.findOneByOrFail({ id });
        
        const success = this.baseService.stateMachine.archive(payroll);
        
        if (!success) {
            throw new BadRequestException(
                `Cannot archive payroll ${id} in state: ${payroll.state}`
            );
        }
        
        await this.baseService.getRepository().save(payroll);
        
        return {
            message: `Payroll ${id} archived successfully`
        };
    }

    @Patch(':id/void')
    @Authorize({ endpointType: Action.UPDATE })
    @ApiOperation({
        summary: 'Void a payroll',
        description: 'Marks a payroll as voided, indicating it is no longer valid'
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the payroll to void',
        required: true
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payroll voided successfully',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Payroll not found',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Payroll cannot be voided (invalid status)',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
        type: GeneralResponseDto
    })
    async voidPayroll(
        @Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') userId: string
    ): Promise<Partial<GeneralResponseDto>> {
        const payroll = await this.baseService.findOneByOrFail({ id });
        
        const success = this.baseService.stateMachine.void(payroll, userId);
        
        if (!success) {
            throw new BadRequestException(
                `Cannot void payroll ${id} in state: ${payroll.state}`
            );
        }
        
        await this.baseService.getRepository().save(payroll);
        
        return {
            message: `Payroll ${id} voided successfully`
        };
    }

    // @Put('process/cutoff/:cutoffId')
    // @Authorize({ endpointType: Action.CREATE })
    // @ApiOperation({
    //     summary: 'Process payroll for all employees in a cutoff',
    //     description: 'Batch process payrolls for all eligible employees in a specified cutoff period'
    // })
    // @ApiParam({
    //     name: 'cutoffId',
    //     description: 'ID of the cutoff period to process payrolls for',
    //     required: true
    // })
    // @ApiResponse({
    //     status: HttpStatus.CREATED,
    //     description: 'Payrolls successfully processed',
    //     type: [GetPayrollDto]
    // })
    // @ApiResponse({
    //     status: HttpStatus.BAD_REQUEST,
    //     description: 'Invalid request, cutoff not active, or no eligible employees'
    // })
    // async processPayrollForCutoff(
    //     @Param('cutoffId') cutoffId: string,
    //     @CurrentUser('sub') userId: string
    // ): Promise<GetPayrollDto[]> {
    //     const payrolls = await this.baseService.processPayrollForCutoff(cutoffId, userId);
    //     return payrolls as GetPayrollDto[];
    // }

    @Get(':id/payslip')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({
        summary: 'Get payslip data',
        description: 'Generates structured payslip data for an existing payroll'
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the payroll to generate payslip for',
        required: true
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payslip data generated successfully',
        type: 'any'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Payroll not found'
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
        type: GeneralResponseDto
    })
    async generatePayslipData(
        @Param('id', ParseUUIDPipe) id: string
    ): Promise<any> {
        return await this.baseService.generatePayslipData(id);
    }

    @Get(':id/payslip/download')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({
        summary: 'Download payslip as PDF',
        description: 'Generates and downloads a PDF payslip for the specified payroll'
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the payroll to generate PDF payslip for',
        required: true
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'PDF generated and downloaded successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Payroll not found'
    })
    async downloadPayslip(
        @Param('id') id: string,
        @Res() res: Response
    ): Promise<void> {
        const payroll = await this.baseService.findOneByOrFail({ id });
        const employee = payroll.employee;
        const payslipData = await this.baseService.generatePayslipData(id);
        // log
        
        // Generate PDF using the custom generator
        const pdfBuffer = await generateMiniPayslipPdf(payslipData);
        
        const fileName = `Payslip_${employee.employeeNumber}_${UtilityHelper.ensureDate(payroll.cutoff.startDate).toISOString().slice(0, 10)}.pdf`;
        
        // Set appropriate headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        // Send the PDF
        res.send(pdfBuffer);
    }

    @Patch(':id/approve')
    @Authorize({ endpointType: Action.MANAGE })
    @ApiOperation({
        summary: 'Approve a payroll',
        description: 'Changes the status of a payroll to APPROVED'
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the payroll to approve',
        required: true
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payroll approved successfully',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Payroll not found',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Payroll cannot be approved (invalid status)',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
        type: GeneralResponseDto
    })
    async approvePayroll(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser('sub') userId: string
    ): Promise<Partial<GeneralResponseDto>> {
        // Get the full payroll entity
        const payroll = await this.baseService.findOneByOrFail({ id });
        
        // Use the state machine to perform transition with validation
        const success = this.baseService.stateMachine.approve(payroll, userId);
        
        if (!success) {
            throw new BadRequestException(
                `Cannot approve payroll ${id} in current state: ${payroll.state}`
            );
        }
        
        // Save the updated payroll with history
        await this.baseService.getRepository().save(payroll);
        
        return {
            message: `Payroll ${id} approved successfully`
        };
    }

    @Patch(':id/release')
    @Authorize({ endpointType: Action.UPDATE })
    @ApiOperation({
        summary: 'Release a payroll',
        description: 'Marks a payroll as RELEASED, indicating it has been sent for payment'
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the payroll to release',
        required: true
    })
    @ApiBody({
        type: ReleasePayrollDto,
        description: 'Details for releasing the payroll'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payroll released successfully',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Payroll not found',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Payroll cannot be released (invalid status)',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
        type: GeneralResponseDto
    })
    async releasePayroll(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() releaseData: ReleasePayrollDto,
        @CurrentUser('sub') userId: string
    ): Promise<Partial<GeneralResponseDto>> {
        const payroll = await this.baseService.findOneByOrFail({ id });
        
        // Use markPaid instead of direct update
        const success = this.baseService.stateMachine.markPaid(payroll, userId, {
            paymentMethod: releaseData.paymentMethod,
            paymentDate: releaseData.paymentDate || new Date(),
            bankReferenceNumber: releaseData.bankReferenceNumber,
            bankAccount: releaseData.bankAccount,
            checkNumber: releaseData.checkNumber
        });
        
        if (!success) {
            throw new BadRequestException(
                `Cannot release payroll ${id} in current state: ${payroll.state}`
            );
        }
        
        // Additional payment details
        payroll.paymentMethod = releaseData.paymentMethod;
        payroll.paymentDate = releaseData.paymentDate || new Date();
        payroll.bankReferenceNumber = releaseData.bankReferenceNumber;
        payroll.bankAccount = releaseData.bankAccount;
        payroll.checkNumber = releaseData.checkNumber;
        
        await this.baseService.getRepository().save(payroll);
        
        return {
            message: `Payroll ${id} released successfully`
        };
    }

    @Patch(':id/reject')
    @Authorize({ endpointType: Action.UPDATE })
    @ApiOperation({
        summary: 'Reject a payroll',
        description: 'Marks a payroll as REJECTED'
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the payroll to reject',
        required: true
    })
    @ApiQuery({
        name: 'reason',
        required: true,
        description: 'Reason for rejection'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payroll rejected successfully',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Payroll not found',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Payroll cannot be rejected (invalid status)',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
        type: GeneralResponseDto
    })
    async rejectPayroll(
        @Param('id', ParseUUIDPipe) id: string,
        @Query('reason') reason: string,
        @CurrentUser('sub') userId: string
    ): Promise<Partial<GeneralResponseDto>> {
        // Get the full payroll entity
        const payroll = await this.baseService.findOneByOrFail({ id });
        
        // Use the state machine to perform transition with validation
        const success = this.baseService.stateMachine.reject(payroll, userId, reason);
        
        if (!success) {
            throw new BadRequestException(
                `Cannot reject payroll ${id} in current state: ${payroll.state}`
            );
        }
        
        // Save the updated payroll with history
        await this.baseService.getRepository().save(payroll);
        
        return {
            message: `Payroll ${id} approved successfully`
        };
    }

    @Post('process/batch')
    @Authorize({ endpointType: Action.CREATE })
    @ApiOperation({
        summary: 'Process payrolls in batch mode',
        description: 'Divides employees into batches and queues them for asynchronous processing'
    })
    @ApiBody({
        type: PayrollBatchProcessRequestDto,
        description: 'Request body for batch payroll processing'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Batch payroll processing initiated successfully',
        type: PayrollBatchProcessResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid request or cutoff not active',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Cutoff not found',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
        type: GeneralResponseDto
    })
    async processBatchPayroll(
        @Body() data: PayrollBatchProcessRequestDto,
        @CurrentUser('sub') userId: string
    ): Promise<PayrollBatchProcessResponseDto> {
        const batches = await this.baseService.createProcessingBatches(data.cutoffId, data.batchSize);
        
        // log
        this.logger.log(`Processing ${batches.length} batches for cutoff ${data.cutoffId}`);

        // Queue each batch for processing
        for (const batch of batches) {
            await this.payrollQueue.add('process-batch-payroll', {
                cutoffId: data.cutoffId,
                userId,
                batchId: batch.batchId
            });
        }
        
        // Estimate completion time (3 seconds per employee as a rough estimate)
        let estimatedCompletionTime;
        const totalEmployees = batches.reduce((sum, batch) => sum + batch.employeeCount, 0);
        try {
        
        // Prevent division by zero
        if (batches.length === 0) {
            estimatedCompletionTime = new Date().toISOString();
        } else {
            const estimatedSeconds = Math.ceil((totalEmployees * 2) / batches.length);
            
            // Add a safety limit to prevent extremely large values
            const safeSeconds = Math.min(estimatedSeconds, 86400); // Max 24 hours
            estimatedCompletionTime = new Date(Date.now() + safeSeconds * 1000).toISOString();
        }
        } catch (error) {
        // Fallback to current time if any calculation fails
        estimatedCompletionTime = new Date().toISOString();
        }

        return {
            cutoffId: data.cutoffId,
            batchSize: data.batchSize,
            message: `Processing started for ${totalEmployees} employees in ${batches.length} batches`,
            batchCount: batches.length,
            batches,
            estimatedCompletionTime
        };
    }

    @Put('retry-failed')
    @Authorize({ endpointType: Action.UPDATE })
    @ApiOperation({
        summary: 'Retry failed payroll processing',
        description: 'Attempts to reprocess failed payrolls with smart retry logic'
    })
    async retryFailedPayrolls(
        @Body() data: { 
            cutoffId: string, 
            maxRetries?: number, 
            specificIds?: string[] 
    },
        @CurrentUser('sub') userId: string
    ): Promise<{
        message: string,
        successful: number,
        failed: number,
        skipped: number
    }> {
        const result = await this.baseService.retryFailedPayrolls(
            data.cutoffId,
            userId,
            {
                maxRetries: data.maxRetries,
                onlySpecificIds: data.specificIds
            }
        );
        
        return {
            message: `Retry process completed`,
            successful: result.successful,
            failed: result.failed,
            skipped: result.skipped
        };
    }

    @Get('batch-status/:cutoffId')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({
        summary: 'Check batch processing status',
        description: 'Returns the current status of batch payroll processing'
    })
    async getBatchProcessingStatus(
        @Param('cutoffId', ParseUUIDPipe) cutoffId: string
    ): Promise<{
        status: string,
        processed: number,
        pending: number,
        failed: number,
        total: number,
        percentComplete: number,
        batchStatuses: Array<{
            batchId: string,
            status: string,
            processedCount: number,
            pendingCount: number,
            failedCount: number
    }>
    }> {
        // Implement a method in your service to get batch processing statistics
        return this.baseService.getBatchProcessingStatus(cutoffId);
    }

// @Get('audit/:payrollId')
// @Authorize({ endpointType: Action.READ })
// @ApiOperation({
//   summary: 'Get payroll audit trail',
//   description: 'Returns detailed audit information for a payroll record'
// })
// async getPayrollAudit(
//   @Param('payrollId') payrollId: string
// ): Promise<{
//   payrollId: string,
//   stateHistory: any[],
//   calculations: any,
//   changes: any[]
// }> {
//   return this.baseService.getPayrollAudit(payrollId);
// }

    @Put(':id/recalculate')
    @Authorize({ endpointType: Action.UPDATE })
    @ApiOperation({
        summary: 'Recalculate a specific payroll',
        description: 'Forces recalculation of an existing payroll with option to preserve or reset state'
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the payroll to recalculate',
        required: true
    })
    @ApiBody({
        type: RecalculateOptionsDto,
        description: 'Options for recalculation'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payroll recalculated successfully',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Payroll not found',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Payroll cannot be recalculated (invalid status)',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
        type: GeneralResponseDto
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
        type: GeneralResponseDto
    })
    async recalculatePayroll(
    @Param('id', ParseUUIDPipe) id: string,
        @Body() options: RecalculateOptionsDto,
        @CurrentUser('sub') userId: string
    ): Promise<Partial<GeneralResponseDto>> {
        await this.baseService.recalculatePayroll(id, options, userId);

        return {
            message: `Payroll ${id} recalculated successfully`
        }
    }
}