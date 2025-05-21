import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bull';
import { PayrollsService } from '../payrolls.service';

export interface EmployeePayrollJobData {
  employeeId: string;
  cutoffId: string;
  userId: string;
}

export interface CutoffPayrollJobData {
  cutoffId: string;
  userId: string;
  batchId: string;
}

@Processor('payroll-processing')
export class PayrollProcessorService {
  private readonly logger = new Logger(PayrollProcessorService.name);

  constructor(
    private readonly payrollsService: PayrollsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Process('process-employee-payroll')
  async processEmployeePayroll(job: Job<EmployeePayrollJobData>) {
    this.logger.log(`Processing payroll for employee ${job.data.employeeId} (${job.id})`);
    
    try {
      const payroll = await this.payrollsService.processPayrollForEmployee(
        job.data.employeeId,
        job.data.cutoffId,
        job.data.userId,
      );
      
      return payroll;
    } catch (error) {
      this.logger.error(`Failed to process payroll for employee ${job.data.employeeId}`, error);
      throw error;
    }
  }

  @Process('process-batch-payroll')
  async processBatchPayroll(job: Job<CutoffPayrollJobData>) {
    this.logger.log(`Processing batch payroll for cutoff ${job.data.cutoffId} (Batch: ${job.data.batchId})`);
    
    try {
      const payrolls = await this.payrollsService.processPayrollBatch(
        job.data.cutoffId,
        job.data.userId,
        job.data.batchId
      );
      
      return payrolls;
    } catch (error) {
      this.logger.error(`Failed to process batch payroll for cutoff ${job.data.cutoffId}`, error);
      throw error;
    }
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack
    );
    
    this.eventEmitter.emit('payroll.processing.failed', {
      jobId: job.id,
      type: job.name,
      data: job.data,
      error: error.message,
    });
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Completed job ${job.id} of type ${job.name}`);
    
    this.eventEmitter.emit('payroll.processing.completed', {
      jobId: job.id,
      type: job.name,
      data: job.data,
      result,
    });
  }
}