import { PayrollState } from '@/common/enums/payroll/payroll-state.enum';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Counter, Gauge, Histogram } from 'prom-client';
import { Repository } from 'typeorm';
import { Payroll } from '../entities/payroll.entity';

@Injectable()
export class PayrollMetricsService {
  private readonly logger = new Logger(PayrollMetricsService.name);
  
  // Initialize metrics collectors with default values
  private payrollProcessingTime: Histogram = new Histogram({
    name: 'payroll_processing_seconds',
    help: 'Time taken to process payrolls',
    labelNames: ['cutoff_type', 'status']
  });
  
  private activePayrollJobs: Gauge = new Gauge({
    name: 'payroll_active_jobs',
    help: 'Number of currently active payroll jobs'
  });
  
  private failedPayrollCounter: Counter = new Counter({
    name: 'payroll_failures_total',
    help: 'Total number of payroll processing failures',
    labelNames: ['error_type']
  });
  
  constructor(
    @InjectRepository(Payroll)
    private readonly payrollRepository: Repository<Payroll>
  ) {
  }
  
  // Record processing time
  recordProcessingTime(cutoffType: string, status: string, seconds: number): void {
    this.payrollProcessingTime.labels(cutoffType, status).observe(seconds);
  }
  
  // Increment active jobs
  incrementActiveJobs(): void {
    this.activePayrollJobs.inc();
  }
  
  // Decrement active jobs
  decrementActiveJobs(): void {
    this.activePayrollJobs.dec();
  }
  
  // Increment failure counter
  recordFailure(errorType: string): void {
    this.failedPayrollCounter.labels(errorType).inc();
  }
  
  // Gather system metrics periodically
  @Cron('0 */15 * * * *') // Every 15 minutes
  async gatherPayrollMetrics(): Promise<void> {
    try {
      const [processing, completed, failed] = await Promise.all([
        this.payrollRepository.count({ where: { state: PayrollState.CALCULATING } }),
        this.payrollRepository.count({ where: { state: PayrollState.PAID } }),
        this.payrollRepository.count({ where: { state: PayrollState.FAILED } })
      ]);
      
      this.logger.log(`Metrics collected - Processing: ${processing}, Completed: ${completed}, Failed: ${failed}`);
    } catch (error) {
      this.logger.error('Failed to gather payroll metrics', error);
    }
  }
}