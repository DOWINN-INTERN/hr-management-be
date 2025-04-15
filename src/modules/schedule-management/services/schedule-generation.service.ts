import { SCHEDULE_EVENTS } from '@/common/events/employee-assigned.event';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job, Queue } from 'bull';
import { SchedulesService } from '../schedules.service';

export interface ScheduleGenerationJob {
  employeeIds: string[];
  groupId: string;
  cutoffId: string;
  requestedBy?: string;
}

@Injectable()
export class ScheduleGenerationService {
  private readonly logger = new Logger(ScheduleGenerationService.name);

  constructor(
    @InjectQueue('schedule-generation') private scheduleQueue: Queue,
  ) {}

  async addGenerationJob(data: ScheduleGenerationJob): Promise<Job<ScheduleGenerationJob>> {
    this.logger.log(`Adding schedule generation job for ${data.employeeIds.length} employees in group ${data.groupId}`);
    return this.scheduleQueue.add('generate', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
    });
  }
}

@Processor('schedule-generation')
export class ScheduleGenerationProcessor {
  private readonly logger = new Logger(ScheduleGenerationProcessor.name);

  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Process('generate')
  async processScheduleGeneration(job: Job<ScheduleGenerationJob>): Promise<void> {
    this.logger.log(`Processing schedule generation job ${job.id}`);
    const { employeeIds, groupId, cutoffId, requestedBy } = job.data;

    try {
      const result = await this.schedulesService.generateSchedulesForEmployees(
        employeeIds,
        groupId,
        cutoffId
      );

      this.eventEmitter.emit(SCHEDULE_EVENTS.GENERATION_COMPLETED, {
        jobId: job.id,
        employeeIds,
        groupId,
        cutoffId,
        schedulesGenerated: result.length,
        requestedBy,
      });

      this.logger.log(`Generated ${result.length} schedules for job ${job.id}`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Schedule generation failed for job ${job.id}: ${error.message}`, error.stack);
        this.eventEmitter.emit(SCHEDULE_EVENTS.GENERATION_FAILED, {
          jobId: job.id,
          employeeIds,
          groupId,
          cutoffId,
          error: error.message,
          requestedBy,
        });
      } else {
        this.logger.error(`Schedule generation failed for job ${job.id}: Unknown error`);
        this.eventEmitter.emit(SCHEDULE_EVENTS.GENERATION_FAILED, {
          jobId: job.id,
          employeeIds,
          groupId,
          cutoffId,
          error: 'Unknown error',
          requestedBy,
        });
      }
      throw error;
    }
  }
}