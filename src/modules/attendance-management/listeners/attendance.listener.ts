import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { HolidayType } from '@/common/enums/holiday-type.enum';
import { NotificationType } from '@/common/enums/notification-type.enum';
import { RequestStatus } from '@/common/enums/request-status.enum';
import { ScheduleStatus } from '@/common/enums/schedule-status';
import { ATTENDANCE_EVENTS, AttendanceProcessedEvent, AttendanceRecordedEvent, RecalculateFinalWorkHoursEvent } from '@/common/events/attendance.event';
import { AttendancePunchesService } from '@/modules/attendance-management/attendance-punches/attendance-punches.service';
import { AttendancesService } from '@/modules/attendance-management/attendances.service';
import { BiometricDevicesService } from '@/modules/biometrics/services/biometric-devices.service';
import { EmployeesService } from '@/modules/employee-management/employees.service';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { Schedule } from '@/modules/shift-management/schedules/entities/schedule.entity';
import { SchedulesService } from '@/modules/shift-management/schedules/schedules.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { differenceInMinutes, format, isAfter, isBefore, parseISO } from 'date-fns';
import { AttendanceConfigurationsService } from '../attendance-configurations/attendance-configurations.service';
import { Attendance } from '../entities/attendance.entity';
import { DayType } from '../final-work-hours/entities/final-work-hour.entity';
import { WorkHourCalculationService } from '../final-work-hours/services/work-hour-calculation.service';
import { WorkTimeRequestsService } from '../work-time-requests/work-time-requests.service';

@Injectable()
export class AttendanceListener {
  private readonly logger = new Logger(AttendanceListener.name);

  constructor(
    private readonly attendancesService: AttendancesService,
    private readonly attendancePunchesService: AttendancePunchesService,
    private readonly employeesService: EmployeesService,
    private readonly schedulesService: SchedulesService,
    private readonly biometricDevicesService: BiometricDevicesService,
    private readonly notificationsService: NotificationsService,
    private readonly workTimeRequestsService: WorkTimeRequestsService,
    private readonly workHourCalculationService: WorkHourCalculationService,
    private readonly attendanceConfigurationsService: AttendanceConfigurationsService,
  ) {}

  @OnEvent(ATTENDANCE_EVENTS.ATTENDANCE_RECORDED)
  async handleAttendanceRecorded(event: AttendanceRecordedEvent): Promise<void> {
    // Get the biometric device entity
    const biometricDevice = await this.biometricDevicesService.findOneBy({ deviceId: event.deviceId });
    if (!biometricDevice) {
      this.logger.error(`Biometric device with ID ${event.deviceId} not found`);
      return;
    }

    // Process each attendance record
    for (const record of event.attendances) {
      try {
        // Validate userId is a proper number before parsing
        if (!record.userId || !/^\d+$/.test(record.userId)) {
          this.logger.warn(`Invalid user ID format: "${record.userId}". Must be numeric.`);
          continue;
        }

        const employeeNumber = parseInt(record.userId, 10);
        if (isNaN(employeeNumber)) {
          this.logger.warn(`Failed to parse employee number from: "${record.userId}"`);
          continue;
        }
        
        // Find employee by biometric ID
        const employee = await this.employeesService.findOneBy({ 
          employeeNumber
        }, { relations: { user: true } });
        
        if (!employee) {
          this.logger.warn(`No employee found with biometric ID ${record.userId}`);
          continue;
        }

        const config = await this.attendanceConfigurationsService.getOrganizationAttendanceConfiguration(employee.organizationId);
        
        const punchTime = new Date(record.timestamp);
        punchTime.setSeconds(0, 0); // Set seconds and milliseconds to zero
        const punchDate = format(punchTime, 'yyyy-MM-dd');
        const punchTimeStr = format(punchTime, 'HH:mm');

        // Find today's schedule for the employee
        const todaySchedule = await this.schedulesService.getEmployeeScheduleToday(employee.id);
        let attendanceStatuses = [];
        if (!todaySchedule) {
          this.logger.warn(`No schedule found for employee ${employee.id} on ${punchDate}`);
          // Notify employee
          await this.notificationsService.create({
            title: 'No Schedule Found',
            message: `You have no schedule for today (${punchDate}). Your attendance will not be recorded. Please communicate with your HR/Supervisor.`,
            type: NotificationType.WARNING,
            category: 'ATTENDANCE',
            user: { id: employee.user.id },
          })
          continue;
        }

        let dayType: DayType;
        const isRestDay = todaySchedule.restDay;
        const holidayType = todaySchedule.holiday?.type;

        if (isRestDay && holidayType === HolidayType.REGULAR) {
            dayType = DayType.REGULAR_HOLIDAY_REST_DAY;
        } 
        else if (isRestDay && (holidayType === HolidayType.SPECIAL_NON_WORKING)) {
            dayType = DayType.SPECIAL_HOLIDAY_REST_DAY;
        }
        else if (isRestDay) {
            dayType = DayType.REST_DAY;
        }
        else if (holidayType === HolidayType.REGULAR) {
            dayType = DayType.REGULAR_HOLIDAY;
        }
        else if (holidayType === HolidayType.SPECIAL_NON_WORKING || holidayType === HolidayType.SPECIAL_WORKING) {
            dayType = DayType.SPECIAL_HOLIDAY;
        }
        else {
            dayType = DayType.REGULAR_DAY;
        }

        if (todaySchedule.status === ScheduleStatus.LEAVE) {
          this.logger.log(`Employee ${employee.id} is on leave today`);
          // Notify employee
          await this.notificationsService.create({
            title: 'Leave Notification',
            message: `You are on leave today (${punchDate}). Your attendance will be recorded.`,
            type: NotificationType.INFO,
            category: 'ATTENDANCE',
            user: { id: employee.user.id },
          });
        }

        if (todaySchedule.holiday) {
          this.logger.log(`Employee ${employee.id} checked in on a holiday (${todaySchedule.holiday.name})`);
          // Notify employee
          await this.notificationsService.create({
            title: 'Holiday Check-in',
            message: `You checked in on a holiday (${todaySchedule.holiday.name}) on ${punchDate} at ${punchTimeStr}.`,
            type: NotificationType.INFO,
            category: 'ATTENDANCE',
            user: { id: employee.user.id },
          });
        }

        if (todaySchedule.restDay) {
          this.logger.log(`Employee ${employee.id} is on rest day but checking in`);
          // notify employee
          await this.notificationsService.create({
            title: 'Rest Day Check-in',
            message: `You are on a rest day but checked in on ${punchDate} at ${punchTimeStr}.`,
            type: NotificationType.INFO,
            category: 'ATTENDANCE',
            user: { id: employee.user.id },
          });
        }

        const { startTime, endTime } = todaySchedule;

        const effectiveStartTime = startTime;
        const effectiveEndTime = endTime;
        const shiftStartTime = parseISO(`${punchDate}T${effectiveStartTime}`);
        const shiftEndTime = parseISO(`${punchDate}T${effectiveEndTime}`);
        const middleTime = new Date(
          shiftStartTime.getTime() + 
          (shiftEndTime.getTime() - shiftStartTime.getTime()) / 2
        );
        middleTime.setSeconds(0, 0); // Set seconds and milliseconds to zero

        // Find attendance for today if it exists
        let existingAttendance = await this.attendancesService.findOneBy({
          employee: new Employee({ id: employee.id }),
          schedule: new Schedule({ id: todaySchedule.id }),
        }, { relations: { cutoff: true } });
        
        // If no existing attendance create an attendance
        if (!existingAttendance) {
          this.logger.log(`Creating new attendance for employee ${employee.user.email} on ${punchDate}`);
          existingAttendance = await this.attendancesService.create({
            employee: { id: employee.id },
            schedule: { id: todaySchedule.id },
            cutoff: { id: todaySchedule.cutoff.id },
            date: todaySchedule.date,
            dayType,
            organizationId: employee.organizationId,
            departmentId: employee.departmentId,
            branchId: employee.branchId,
            userId: employee.user.id,
          }, employee.user.id);
        }

        // Determine check-in status based on middle time threshold
        if (isBefore(punchTime, middleTime)) {
          // log
          this.logger.log(`Employee ${employee.user.email} checked in before middle time on ${punchDate} at ${punchTimeStr}`);
          if (!existingAttendance.timeIn) {
            // log
            this.logger.log(`Employee ${employee.user.email} is checking in`);

            // Check if late
            if (isAfter(punchTime, shiftStartTime)) {
              // Check if orgnaization does not allow late time
              if (!config.allowLate) {
                const minutesLate = differenceInMinutes(punchTime, shiftStartTime);
                // Check if minutes late can be considered as late time
                if (minutesLate > config.gracePeriodMinutes) {
                  this.logger.log(`Employee ${employee.user.email} is late by ${minutesLate} minutes`);
                  // Mark attendance as late time
                  attendanceStatuses.push(AttendanceStatus.LATE);
                  
                  let roundedMinutes = minutesLate;
                  // Check if organization rounds up late time
                  if (config.roundUpLate) {
                    roundedMinutes = Math.ceil(minutesLate / config.roundUpLateMinutes) * config.roundUpLateMinutes;
                    this.logger.log(`Rounded late time to ${roundedMinutes} minutes`);
                  }
                  
                  // Create work time request for late arrival
                  await this.createWorkTimeRequest(dayType, employee.id, AttendanceStatus.LATE, existingAttendance, roundedMinutes);
                  
                  // Notify employee
                  await this.notificationsService.create({
                    title: 'Late Check-in',
                    message: `You are late by ${minutesLate} minutes on ${punchDate} at ${punchTimeStr}.${config.roundUpLate ? ` This was rounded up to ${roundedMinutes} minutes.` : ''}`,
                    type: NotificationType.WARNING,
                    category: 'ATTENDANCE',
                    user: { id: employee.user.id },
                  });
                }
                else {
                  this.logger.log('Minutes late is not considered as late time');
                }
              }
              else 
              {
                this.logger.log('Organization allows late time');
              }
            }
            else {
              // Check organization allow early time
              if (config.allowEarlyTime) 
              {
                let minutesEarly = differenceInMinutes(shiftStartTime, punchTime);
                // Check if minutes early can be considered as early time
                if (minutesEarly > config.earlyTimeThresholdMinutes)
                {
                  // Mark attendance as early time
                  this.logger.log(`Employee ${employee.user.email} is early by ${minutesEarly} minutes`);
                  attendanceStatuses.push(AttendanceStatus.EARLY);
                  attendanceStatuses.push(AttendanceStatus.CHECKED_IN);

                  // Check if early time is management-requested
                  const isManagementRequested = await this.workTimeRequestsService.checkForManagementRequest(
                    employee.id, 
                    punchDate,
                    AttendanceStatus.EARLY
                  );
                  
                  if (isManagementRequested) {
                    this.logger.log(`Early time is management-requested`);
                    let roundedMinutes = minutesEarly;
                    
                    // Check if organization rounds down early time
                    if (config.roundDownEarlyTime) {
                      // Round down early time by the organization's round down minutes
                      roundedMinutes = Math.floor(minutesEarly / config.roundDownEarlyTimeMinutes) * config.roundDownEarlyTimeMinutes;
                      this.logger.log(`Rounded early time from ${minutesEarly} to ${roundedMinutes} minutes`);
                    }

                    // Update management-requested work time request
                    isManagementRequested.duration = roundedMinutes;
                    isManagementRequested.dayType = dayType;
                    isManagementRequested.attendance = existingAttendance;
                    await this.workTimeRequestsService.save(isManagementRequested);
                    
                    // Notify employee
                    await this.notificationsService.create({
                      title: 'Early Time Check-in',
                      message: `You checked in early by ${minutesEarly} minutes on ${punchDate} at ${punchTimeStr}.${config.roundDownEarlyTime ? ` This was rounded down to ${roundedMinutes} minutes.` : ''}`,
                      type: NotificationType.INFO,
                      category: 'ATTENDANCE',
                      user: { id: employee.user.id },
                    });
                  }
                }
                else {
                  this.logger.log('Time in is not considered as early time');
                }
              }
              else {
                this.logger.log('Organization does not allow early time');
              }
            }

            if (!existingAttendance.statuses?.includes(AttendanceStatus.CHECKED_IN)) {
              attendanceStatuses.push(AttendanceStatus.CHECKED_IN);
            }

            existingAttendance.timeIn = punchTime;
            existingAttendance.statuses = attendanceStatuses;
          }
          else {
            this.logger.log(`Employee ${employee.user.email} already checked in`);
            // notify employee
            await this.notificationsService.create({
              title: 'Already Checked In',
              message: `You tried to check in but you have already checked in on ${punchDate} at ${punchTimeStr}.`,
              type: NotificationType.INFO,
              category: 'ATTENDANCE',
              user: { id: employee.user.id },
            });
          }
        } else {
          attendanceStatuses = existingAttendance.statuses || [];
          // log
          if (!existingAttendance.timeIn && !existingAttendance.statuses?.includes(AttendanceStatus.NO_CHECKED_IN))
          {
            attendanceStatuses.push(AttendanceStatus.NO_CHECKED_IN);
            // Create work time request for no check in
            await this.createWorkTimeRequest(dayType, employee.id, AttendanceStatus.NO_CHECKED_IN, existingAttendance);
            // Notify employee
            await this.notificationsService.create({
              title: 'No Check-in',
              message: `You did not check in on ${punchDate} at ${punchTimeStr}.`,
              type: NotificationType.WARNING,
              category: 'ATTENDANCE',
              user: { id: employee.user.id },
            });
          }

          // Check if employee is undertime
          if (isBefore(punchTime, shiftEndTime)) {
            // log
            this.logger.log(`Employee ${employee.user.email} is leaving early on ${punchDate} at ${punchTimeStr}`);
            const minutesEarly = differenceInMinutes(shiftEndTime, punchTime);
            if (!config.allowUnderTime && minutesEarly > config.underTimeThresholdMinutes) {
              if (!existingAttendance.statuses?.includes(AttendanceStatus.UNDER_TIME)) {
                attendanceStatuses.push(AttendanceStatus.UNDER_TIME);
              }
              this.logger.log(`Employee ${employee.id} is leaving ${minutesEarly} minutes early`);
              
              // move this to cron job
              // // Create work time request for under time
              // await this.createWorkTimeRequest(dayType, employee.id, AttendanceStatus.UNDER_TIME, existingAttendance.id, minutesEarly);
              
              // // Notify management
              // await this.notificationsService.create({
              //   title: 'Early Check-out',
              //   message: `You are leaving ${minutesEarly} minutes early on ${punchDate} at ${punchTimeStr}.`,
              //   type: NotificationType.WARNING,
              //   category: 'ATTENDANCE',
              //   user: { id: employee.user.id },
              // });

              // if (config.roundDownUnderTime) {
              //   const roundedMinutes = Math.floor(minutesEarly / config.roundDownUnderTimeMinutes) * config.roundDownUnderTimeMinutes;
              //   punchTime.setMinutes(punchTime.getMinutes() - roundedMinutes);
              //   this.logger.log(`Rounded early time to ${roundedMinutes} minutes`);
              // }
            }

          } else {
            // Check if employee is overtime
            attendanceStatuses = attendanceStatuses.filter(status => status !== AttendanceStatus.UNDER_TIME);
            const minutesOvertime = differenceInMinutes(punchTime, shiftEndTime);
            if (config.allowOvertime && minutesOvertime > config.overtimeThresholdMinutes) {
              if (!existingAttendance.statuses?.includes(AttendanceStatus.OVERTIME)) {
                attendanceStatuses.push(AttendanceStatus.OVERTIME);
              }
              this.logger.log(`Employee ${employee.id} worked ${minutesOvertime} minutes overtime`);
              // move this to cron job              
              // Create work time request for overtime
              // await this.createWorkTimeRequest(dayType, employee.id, AttendanceStatus.OVERTIME, existingAttendance.id, minutesOvertime);
              
              // // Notify employee
              // await this.notificationsService.create({
              //   title: 'Overtime Alert',
              //   message: `You worked ${minutesOvertime} minutes overtime on ${punchDate} at ${punchTimeStr}.`,
              //   type: NotificationType.INFO,
              //   category: 'ATTENDANCE',
              //   user: { id: employee.user.id },
              // });
              // if (config.roundUpOvertime) {
              //   const roundedMinutes = Math.ceil(minutesOvertime / config.roundUpOvertimeMinutes) * config.roundUpOvertimeMinutes;
              //   punchTime.setMinutes(punchTime.getMinutes() + roundedMinutes);
              //   this.logger.log(`Rounded overtime time to ${roundedMinutes} minutes`);
              // }
            }
          }
          
          if (!existingAttendance.statuses?.includes(AttendanceStatus.CHECKED_OUT))
            attendanceStatuses.push(AttendanceStatus.CHECKED_OUT);
          existingAttendance.statuses = [...attendanceStatuses];
          
          existingAttendance.updatedBy = employee.user.id;
          existingAttendance.timeOut = punchTime;
        }

        await this.attendancesService.save(existingAttendance);
        // Create attendance punch record
        await this.attendancePunchesService.create({
          attendance: { id: existingAttendance.id },
          time: punchTime,
          punchType: record.punchType,
          punchMethod: record.punchMethod,
          employeeNumber,
          userId: employee.user.id,
          organizationId: employee.organizationId,
          departmentId: employee.departmentId,
          branchId: employee.branchId,
          biometricDevice: { id: biometricDevice.id },
        }, employee.user.id,);
        
        this.logger.log(`Successfully processed ${record.punchMethod} punch for employee ${employee.user.email} at ${punchTimeStr} with status ${existingAttendance.statuses}`);
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(`Error processing attendance record: ${error.message}`, error.stack);
        } else {
          this.logger.error(`Error processing attendance record: ${String(error)}`);
        }
      }
    }
  }

  @OnEvent(ATTENDANCE_EVENTS.ATTENDANCE_PROCESSED)
  async handleAttendanceProcessedEvent(event: AttendanceProcessedEvent) {
    this.logger.log(`Handling attendance processed event for ${event.attendances.length} attendances`);

    if (event.attendances.length === 0) {
        return;
    }

    // Extract attendance IDs
    const attendanceIds = event.attendances.map(attendance => attendance.id);

    // Queue the attendances for final work hour calculation
    await this.workHourCalculationService.queueFinalWorkHoursCalculation(
        attendanceIds,
        event.processedBy // Since this is triggered by a system process
    );
  }

  @OnEvent(ATTENDANCE_EVENTS.RECALCULATE_FINAL_WORK_HOURS)
  async handleRecalculateFinalWorkHoursEvent(event: RecalculateFinalWorkHoursEvent) {
    this.logger.log(`Handling recalculation of final work hours for cutoff ID ${event.cutoffId}`);

    // Fetch all attendances for the given cutoff that is already processed
    const attendances = await this.attendancesService.getRepository().find({
      where: { isProcessed: true, cutoff: { id: event.cutoffId } },
    });

    const attendanceIds = event.cutoffId ? attendances.map(attendance => attendance.id) : event.specificAttendanceIds || [];

    // Queue the attendances for final work hour calculation
    await this.workHourCalculationService.queueFinalWorkHoursCalculation(
      attendanceIds,
      event.recalculatedBy // Since this is triggered by a system process
    );
  }

  // Helper methods for notifications and work time requests
  
  private async createWorkTimeRequest(dayType: DayType, employeeId: string, type: AttendanceStatus, attendance: Attendance, duration?: number): Promise<void> {
    try {
      await this.workTimeRequestsService.create({
        attendance,
        cutoff: attendance.cutoff,
        type,
        duration,
        dayType,
        date: attendance.date,
        status: RequestStatus.PENDING,
        createdBy: employeeId,
        employee: { id: employeeId },
      });
      this.logger.log(`Created work time request for employee ${employeeId} for type ${type}`);
    } catch (error: any) {
      this.logger.error(`Failed to create work time request: ${error.message}`);
    }
  }
}