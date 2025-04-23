import { Authorize } from '@/common/decorators/authorize.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GeneralResponseDto } from '@/common/dtos/generalresponse.dto';
import { Action } from '@/common/enums/action.enum';
import { createController } from "@/common/factories/create-controller.factory";
import { Body, Get, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { GetPayrollDto, PayrollDto, UpdatePayrollDto } from "./dtos/payroll.dto";
import { Payroll } from "./entities/payroll.entity";
import { PayrollsService } from "./payrolls.service";

export class PayrollsController extends createController<
    Payroll,
    GetPayrollDto,
    PayrollDto,
    UpdatePayrollDto
>(
    'Payrolls',       // Entity name for Swagger documentation
    PayrollsService,  // The service handling Payroll-related operations
    GetPayrollDto,    // DTO for retrieving Payrolls
    PayrollDto,       // DTO for creating Payrolls
    UpdatePayrollDto, // DTO for updating Payrolls
) {
    constructor(private readonly payrollsService: PayrollsService) {
        super(payrollsService);
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
        status: HttpStatus.CREATED,
        description: 'Payroll successfully processed',
        type: GetPayrollDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid request or payroll already processed'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Employee or cutoff not found'
    })
    async processPayrollForEmployee(
        @Param('employeeId') employeeId: string,
        @Param('cutoffId') cutoffId: string,
        @CurrentUser('sub') userId: string
    ): Promise<GetPayrollDto> {
        const payroll = await this.payrollsService.processPayrollForEmployee(employeeId, cutoffId, userId);
        return payroll as GetPayrollDto;
    }

    @Post('process/cutoff/:cutoffId')
    @Authorize({ endpointType: Action.CREATE })
    @ApiOperation({
        summary: 'Process payroll for all employees in a cutoff',
        description: 'Batch process payrolls for all eligible employees in a specified cutoff period'
    })
    @ApiParam({
        name: 'cutoffId',
        description: 'ID of the cutoff period to process payrolls for',
        required: true
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Payrolls successfully processed',
        type: [GetPayrollDto]
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid request, cutoff not active, or no eligible employees'
    })
    async processPayrollForCutoff(
        @Param('cutoffId') cutoffId: string,
        @CurrentUser('sub') userId: string
    ): Promise<GetPayrollDto[]> {
        const payrolls = await this.payrollsService.processPayrollForCutoff(cutoffId, userId);
        return payrolls as GetPayrollDto[];
    }

    @Get(':id/details')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({
        summary: 'Get detailed payroll information',
        description: 'Retrieves comprehensive payroll details including all calculated components'
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the payroll to get details for',
        required: true
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payroll details retrieved successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Payroll not found'
    })
    async getPayrollDetails(
        @Param('id') id: string
    ): Promise<any> {
        return await this.payrollsService.getPayrollDetails(id);
    }

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
        description: 'Payslip data generated successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Payroll not found'
    })
    async generatePayslipData(
        @Param('id') id: string
    ): Promise<any> {
        return await this.payrollsService.generatePayslipData(id);
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
        const payroll = await this.payrollsService.findOneByOrFail({ id });
        const employee = payroll.employee;
        const payslipData = await this.payrollsService.generatePayslipData(id);
        
        // You would need to implement PDF generation logic here
        // For example: const pdfBuffer = await generatePayslipPdf(payslipData);
        
        const fileName = `Payslip_${employee.employeeNumber}_${payroll.cutoff.startDate.toISOString().slice(0, 10)}.pdf`;
        
        // Set headers and send file
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        // res.send(pdfBuffer);
        
        // For now, just return JSON as placeholder
        res.json({
            message: 'PDF generation to be implemented',
            payslipData,
            fileName
        });
    }

    @Post(':id/approve')
    @Authorize({ endpointType: Action.UPDATE })
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
        description: 'Payroll not found'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Payroll cannot be approved (invalid status)'
    })
    async approvePayroll(
        @Param('id') id: string,
        @CurrentUser('sub') userId: string
    ): Promise<Partial<GeneralResponseDto>> {
        await this.payrollsService.update(id, {
            status: 'APPROVED',
            approvedAt: new Date(),
            approvedBy: userId
        } as any, userId);
        
        return {
            message: 'Payroll approved successfully'
        };
    }

    @Post(':id/release')
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
        schema: {
            properties: {
                paymentMethod: { type: 'string' },
                paymentDate: { type: 'string', format: 'date-time' },
                bankReferenceNumber: { type: 'string' }
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payroll released successfully',
        type: GeneralResponseDto
    })
    async releasePayroll(
        @Param('id') id: string,
        @Body() releaseData: {
            paymentMethod: string;
            paymentDate?: Date;
            bankReferenceNumber?: string;
            bankAccount?: string;
            checkNumber?: string;
        },
        @CurrentUser('sub') userId: string
    ): Promise<Partial<GeneralResponseDto>> {
        await this.payrollsService.update(id, {
            status: 'RELEASED',
            releasedAt: new Date(),
            releasedBy: userId,
            paymentMethod: releaseData.paymentMethod,
            paymentDate: releaseData.paymentDate || new Date(),
            bankReferenceNumber: releaseData.bankReferenceNumber,
            bankAccount: releaseData.bankAccount,
            checkNumber: releaseData.checkNumber
        } as any, userId);
        
        return {
            message: 'Payroll released successfully'
        };
    }

    @Post(':id/reject')
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
    async rejectPayroll(
        @Param('id') id: string,
        @Query('reason') reason: string,
        @CurrentUser('sub') userId: string
    ): Promise<Partial<GeneralResponseDto>> {
        await this.payrollsService.update(id, {
            status: 'REJECTED',
            notes: `Rejected: ${reason}`,
            updatedBy: userId
        } as any, userId);
        
        return {
            message: 'Payroll rejected successfully'
        };
    }

    @Get('employee/:employeeId')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({
        summary: 'Get all payrolls for an employee',
        description: 'Retrieves all payrolls for a specific employee'
    })
    @ApiParam({
        name: 'employeeId',
        description: 'ID of the employee',
        required: true
    })
    @ApiQuery({
        name: 'year',
        required: false,
        description: 'Filter by year'
    })
    @ApiQuery({
        name: 'month',
        required: false,
        description: 'Filter by month (1-12)'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Employee payrolls retrieved successfully',
        type: [GetPayrollDto]
    })
    async getEmployeePayrolls(
        @Param('employeeId') employeeId: string,
        @Query('year') year?: number,
        @Query('month') month?: number
    ): Promise<GetPayrollDto[]> {
        // Build filter criteria
        const criteria: any = { 
            employee: { id: employeeId }
        };
        
        // Convert month and year to cutoff date range if provided
        if (year || month) {
            criteria.cutoff = {};
            
            if (year && month) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);
                criteria.cutoff.startDate = { gte: startDate };
                criteria.cutoff.endDate = { lte: endDate };
            } else if (year) {
                const startDate = new Date(year, 0, 1);
                const endDate = new Date(year, 11, 31);
                criteria.cutoff.startDate = { gte: startDate };
                criteria.cutoff.endDate = { lte: endDate };
            }
        }
        
        const payrolls = await this.payrollsService.getRepository().findBy({ ...criteria,
            relations: {
                cutoff: true
            },
            order: {
                cutoff: {
                    startDate: 'DESC'
                }
            }
        });
        
        return plainToInstance(GetPayrollDto, payrolls);
    }
}