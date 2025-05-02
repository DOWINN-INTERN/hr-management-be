import { ATTENDANCE_EVENTS, FinalWorkHoursCalculationEvent } from "@/common/events/attendance.event";
import { InjectQueue } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Queue } from "bull";
import { v4 as uuidv4 } from "uuid";

export interface FinalWorkHoursJobData {
    attendanceIds: string[];
    batchId: string;
    processedBy: string;
  }

@Injectable()
export class WorkHourCalculationService {
  private readonly logger = new Logger(WorkHourCalculationService.name);

  constructor(
    @InjectQueue('work-hour-calculation')
    private readonly workHourQueue: Queue,
    private readonly eventEmitter: EventEmitter2
  ) {}

//   async addGenerationJob(data: ScheduleGenerationJob): Promise<Job<ScheduleGenerationJob>> {
//       this.logger.log(`Adding schedule generation job for ${data.employeeIds.length} employees in group ${data.groupId}`);
//       return this.scheduleQueue.add('generate', data);
//     }

  async queueFinalWorkHoursCalculation(
    attendanceIds: string[],
    processedBy: string
  ): Promise<string> {
    // Generate a batch ID for tracking
    const batchId = uuidv4();

    // Emit the event first
    this.eventEmitter.emit(
      ATTENDANCE_EVENTS.FINAL_WORK_HOURS_CALCULATION, 
      new FinalWorkHoursCalculationEvent(attendanceIds, batchId, processedBy)
    );

    // Queue the job with high priority
    await this.workHourQueue.add(
      'calculate-final-work-hours',
      {
        attendanceIds,
        batchId,
        processedBy
      } as FinalWorkHoursJobData,
      {
        priority: 1,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: true,
        jobId: `final-work-hours-${batchId}`
      }
    );

    this.logger.log(`Queued final work hours calculation for batch ${batchId} with ${attendanceIds.length} attendances`);
    return batchId;
  }
}