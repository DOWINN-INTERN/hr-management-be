import { AttendanceStatus } from "@/common/enums/attendance-status.enum";
import { ATTENDANCE_EVENTS, FinalWorkHoursCalculationEvent } from "@/common/events/attendance.event";
import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Job, Queue } from "bull";
import { v4 as uuidv4 } from "uuid";
import { AttendancesService } from "../../attendances.service";
import { Attendance } from "../../entities/attendance.entity";
import { WorkTimeRequestsService } from "../../work-time-requests/work-time-requests.service";
import { WorkTimeResponse } from "../../work-time-requests/work-time-responses/entities/work-time-response.entity";
import { FinalWorkHoursService } from "../final-work-hours.service";

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

@Processor('work-hour-calculation')
export class WorkHourCalculationProcessor {
  private readonly logger = new Logger(WorkHourCalculationProcessor.name);
  private readonly GRACE_PERIOD_MINUTES = 5; // Consider late after 5 minutes
  private readonly OVER_TIME_THRESHOLD_MINUTES = 30; // Consider overtime if more than 30 minutes
  constructor(
    private readonly attendanceService: AttendancesService,
    private readonly finalWorkHourService: FinalWorkHoursService,
    private readonly workTimeRequestsService: WorkTimeRequestsService,
  ) {}
  @Process('calculate-final-work-hours')
  async calculateFinalWorkHours(job: Job<FinalWorkHoursJobData>): Promise<void> {
    const { attendanceIds, batchId, processedBy } = job.data;
    
    for (const attendanceId of attendanceIds) {
      // Find attendance with all necessary relations
      const attendance = await this.attendanceService.findOneByOrFail(
        { id: attendanceId },
        { relations: { employee: true, schedule: { shift: true, cutoff: true, holiday: true } } }
      );
      
      // Create or update final work hour record
      let finalWorkHour = await this.finalWorkHourService.findOneBy({
        attendance: new Attendance({ id: attendanceId })
      });
      
      if (!finalWorkHour) {
        // Convert schedule times to Date objects when needed
      let timeIn = attendance.timeIn;
      let timeOut = attendance.timeOut;
      let overTimeOut = undefined;

      const [shours, sminutes] = attendance.schedule.endTime.split(':').map(Number);
      let scheduleEndTime = new Date(attendance.schedule.date);
      scheduleEndTime.setHours(shours, sminutes, 0);

      const [ehours, eminutes] = attendance.schedule.startTime.split(':').map(Number);
      let scheduleStartTime = new Date(attendance.schedule.date);
      scheduleStartTime.setHours(ehours, eminutes, 0);

      // Clone the dates to avoid mutation issues
      const scheduleStartTimePlus = new Date(scheduleStartTime);
      scheduleStartTimePlus.setMinutes(scheduleStartTimePlus.getMinutes() + this.GRACE_PERIOD_MINUTES); // 5 minutes grace period

      // Handle timeIn logic
      if (!timeIn) {
        // If timeIn is not available, use schedule's startTime + 60 minutes
        timeIn = new Date(scheduleStartTime);
        timeIn.setMinutes(timeIn.getMinutes() + 60);
        this.logger.log(`No timeIn for attendance ${attendanceId}, using schedule start time + 60 minutes`);
      } else if (timeIn <= scheduleStartTimePlus) {
        // If timeIn is within grace period (not late), use schedule's startTime
        timeIn = new Date(scheduleStartTime);
        this.logger.log(`TimeIn is within grace period for attendance ${attendanceId}, using schedule start time`);
      } 
      // If timeIn is late, we keep the actual timeIn value (no change needed)

      // Handle timeOut logic
      if (!timeOut) {
        // If timeOut is not available, use schedule's endTime - 60 minutes
        timeOut = new Date(scheduleEndTime);
        timeOut.setMinutes(timeOut.getMinutes() - 60);
        this.logger.log(`No timeOut for attendance ${attendanceId}, using schedule end time - 60 minutes`);
      } else if (timeOut > scheduleEndTime) {
        // find the work time request of this attendance 
        const workTimeRequest = await this.workTimeRequestsService.findOneBy(
          {
            attendance: new Attendance({ id: attendanceId }),
            workTimeResponse: new WorkTimeResponse({ approved: true }),
            type: AttendanceStatus.OVERTIME
          },
          {
            relations: { workTimeResponse: true, attendance: true }
          }
        );
        
        if (workTimeRequest)
          overTimeOut = new Date(timeOut);

        timeOut = new Date(scheduleEndTime);
      }

        finalWorkHour = await this.finalWorkHourService.create({
          attendance: { id: attendanceId },
          employee: { id: attendance.employee.id },
          cutoff: { id: attendance.schedule.cutoff.id },
          timeIn,
          batchId,
          timeOut,
          overTimeOut,
          dayType: attendance.dayType,
          workDate: attendance.schedule.date,
          createdBy: processedBy
        });
      }
      
      // Update work hours breakdown
      await this.finalWorkHourService.updateWorkHoursBreakdown(finalWorkHour.id, processedBy);
    }
  }
}