import { AttendanceStatus } from "@/common/enums/attendance-status.enum";
import { PayrollState } from "@/common/enums/payroll/payroll-state.enum";
import { PayrollsService } from "@/modules/payroll-management/payrolls.service";
import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Job, Queue } from "bull";
import { Not } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { AttendanceConfigurationsService } from "../../attendance-configurations/attendance-configurations.service";
import { AttendancesService } from "../../attendances.service";
import { Attendance } from "../../entities/attendance.entity";
import { WorkTimeRequestsService } from "../../work-time-requests/work-time-requests.service";
import { FinalWorkHour } from "../entities/final-work-hour.entity";
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
  ) {}

  async queueFinalWorkHoursCalculation(
    attendanceIds: string[],
    processedBy?: string
  ): Promise<string> {
    try {
      // Validate input
      if (!attendanceIds || attendanceIds.length === 0) {
        throw new Error('No attendance IDs provided for calculation');
      }
      
      // Generate a batch ID for tracking
      const batchId = uuidv4();

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
    } catch (error: any) {
      this.logger.error(`Failed to queue work hour calculation: ${error.message}`, error.stack);
      throw error;
    }
  }
}

@Processor('work-hour-calculation')
export class WorkHourCalculationProcessor {
  private readonly logger = new Logger(WorkHourCalculationProcessor.name);
  private readonly GRACE_PERIOD_MINUTES = 5; // Consider late after 5 minutes
  
  constructor(
    private readonly attendanceService: AttendancesService,
    private readonly finalWorkHourService: FinalWorkHoursService,
    private readonly workTimeRequestsService: WorkTimeRequestsService,
    private readonly payrollsService: PayrollsService,
    private readonly attendanceConfigurationsService: AttendanceConfigurationsService,
  ) {}
  
  @Process('calculate-final-work-hours')
  async calculateFinalWorkHours(job: Job<FinalWorkHoursJobData>): Promise<void> {
    const { attendanceIds, batchId, processedBy } = job.data;
    this.logger.log(`Processing final work hours calculation for batch ${batchId} with ${attendanceIds.length} attendances`);
    
    try {
      let processedCount = 0;
      let failedCount = 0;
      
      for (const attendanceId of attendanceIds) {
        try {
          // log hello
          await this.processAttendance(attendanceId, batchId, processedBy);
          processedCount++;
        } catch (attendanceError: any) {
          failedCount++;
          this.logger.error(
            `Error processing attendance ${attendanceId} in batch ${batchId}: ${attendanceError.message}`
          );
          // Continue processing other attendances despite this error
        }
      }

      if (failedCount > attendanceIds.length * 0.5) { // If more than 50% failed
        throw new Error(`Batch ${batchId} had too many failures: ${failedCount}/${attendanceIds.length}`);
      }
      
      if (processedCount === attendanceIds.length) {
        this.logger.log(`Successfully processed all ${processedCount} attendances in batch ${batchId}`);
      }
      else 
      {
        this.logger.warn(`Processed ${processedCount} out of ${attendanceIds.length} attendances in batch ${batchId}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to process batch ${batchId}: ${error.message}`);
      throw error; // Re-throw to allow Bull to handle the job failure
    }
  }
  
  public async processAttendance(attendanceId: string, batchId: string, processedBy: string): Promise<void> {
    this.logger.log(`Processing attendance ${attendanceId}`);
    
    // Find attendance with all necessary relations
    let attendance = await this.attendanceService.findOneByOrFail(
        { id: attendanceId },
        { relations: { employee: true, schedule: { shift: true, cutoff: true, holiday: true } } }
      );
    
    // Create or update final work hour record
    let finalWorkHour = await this.finalWorkHourService.findOneBy({
        attendance: new Attendance({ id: attendanceId })
      }, { relations: { attendance: true } });

    if (finalWorkHour) {
      this.logger.log(`Final work hour already exists for attendance ${attendanceId}, updating...`);
    }
    else {
      this.logger.log(`Creating new final work hour for attendance ${attendanceId}`);
      finalWorkHour = new FinalWorkHour({});
    }

    const config = await this.attendanceConfigurationsService.getOrganizationAttendanceConfiguration(
      attendance.organizationId
    )

    // Convert schedule times to Date objects when needed
      let timeIn = attendance.timeIn;
      let timeOut = attendance.timeOut;
      let overTimeOut = undefined;
      let noTimeInHours = 0;
      let noTimeOutHours = 0;

      // Safely parse schedule times
      let scheduleEndTime, scheduleStartTime;
      try {
        const [shours, sminutes] = attendance.schedule.endTime.split(':').map(Number);
        scheduleEndTime = new Date(attendance.schedule.date);
        scheduleEndTime.setHours(shours, sminutes, 0);

        const [ehours, eminutes] = attendance.schedule.startTime.split(':').map(Number);
        scheduleStartTime = new Date(attendance.schedule.date);
        scheduleStartTime.setHours(ehours, eminutes, 0);
      } catch (parseError: any) {
        throw new Error(`Invalid schedule times for attendance ${attendanceId}: ${parseError.message}`);
      }

        // Clone the dates to avoid mutation issues
        const scheduleStartTimePlus = new Date(scheduleStartTime);
        scheduleStartTimePlus.setMinutes(scheduleStartTimePlus.getMinutes() + config.gracePeriodMinutes);

        // Handle timeIn logic
        if (!timeIn) {
          // Check if attendance status contains absent
          if (attendance.statuses?.includes(AttendanceStatus.ABSENT) === false) {
            noTimeInHours = config.noTimeInDeductionMinutes / 60;
          }
        } else if (timeIn < scheduleStartTime) {
          // check if config allow early check in
          if (!config.allowEarlyTime) {
            timeIn = new Date(scheduleStartTime);
          }
        }

        // Handle timeOut logic
        if (!timeOut) {
          // Check if attendance status contains absent
          if (attendance.statuses?.includes(AttendanceStatus.ABSENT) === false) {
            noTimeOutHours = config.noTimeOutDeductionMinutes / 60;
          }
        } else if (timeOut > scheduleEndTime) {
          try {
            // Find the work time request of this attendance
            const workTimeRequest = await this.workTimeRequestsService.getRepository().findOne(
              {
                where: {
                  attendance: { id: attendanceId },
                  workTimeResponse: { approved: true },
                  type: AttendanceStatus.OVERTIME
                },
                relations: { workTimeResponse: true, attendance: true }
              }
            );
            
            if (workTimeRequest) {
              overTimeOut = new Date(timeOut);
              this.logger.debug(`Overtime approved for attendance ${attendanceId}`);
            }

            timeOut = new Date(scheduleEndTime);
          } catch (queryError: any) {
            this.logger.warn(`Error checking work time request for attendance ${attendanceId}: ${queryError.message}`);
            timeOut = new Date(scheduleEndTime);
          }
        }

      try {
        finalWorkHour = await this.finalWorkHourService.getRepository().save({
          id: finalWorkHour.id,
          attendance: { id: attendanceId },
          employee: { id: attendance.employee.id },
          cutoff: { id: attendance.schedule.cutoff.id },
          timeIn,
          batchId,
          timeOut,
          overTimeOut,
          noTimeInHours,
          noTimeOutHours,
          dayType: attendance.dayType,
          workDate: attendance.schedule.date,
          createdBy: finalWorkHour.id ? finalWorkHour.createdBy : processedBy,
          updatedBy: finalWorkHour.id ? processedBy : undefined,
        });
        
        // Update work hours breakdown
        await this.finalWorkHourService.updateWorkHoursBreakdown(finalWorkHour.id, processedBy);

        const payroll = await this.payrollsService.getRepository().findOneOrFail({
          where: {
            cutoff: { id: attendance.schedule.cutoff.id },
            employee: { id: attendance.employee.id },
            state: Not(PayrollState.VOID)
          },
          relations: { cutoff: true, employee: true }
        });

        // Update payrolls if needed
        await this.payrollsService.recalculatePayroll(payroll?.id, { preserveState: true }, processedBy);
      } catch (saveError: any) {
        throw new Error(`Database error while saving final work hour: ${saveError.message}`);
      }
  }
}