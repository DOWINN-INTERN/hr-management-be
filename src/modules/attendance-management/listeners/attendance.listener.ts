import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { HolidayType } from '@/common/enums/holiday-type.enum';
import { NotificationType } from '@/common/enums/notification-type.enum';
import { RequestStatus } from '@/common/enums/request-status.enum';
import { ScheduleStatus } from '@/common/enums/schedule-status';
import { ATTENDANCE_EVENTS, AttendanceRecordedEvent } from '@/common/events/attendance.event';
import { AttendancePunchesService } from '@/modules/attendance-management/attendance-punches/attendance-punches.service';
import { AttendancesService } from '@/modules/attendance-management/attendances.service';
import { IBiometricService } from '@/modules/biometrics/interfaces/biometric.interface';
import { BiometricDevicesService } from '@/modules/biometrics/services/biometric-devices.service';
import { EmployeesService } from '@/modules/employee-management/employees.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { SchedulesService } from '@/modules/shift-management/schedules/schedules.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { differenceInMinutes, format, isAfter, isBefore, parseISO } from 'date-fns';
import { DayType } from '../final-work-hours/entities/final-work-hour.entity';
import { WorkTimeRequestsService } from '../work-time-requests/work-time-requests.service';

@Injectable()
export class AttendanceListener {
  private readonly logger = new Logger(AttendanceListener.name);
  private readonly GRACE_PERIOD_MINUTES = 5; // Consider late after 5 minutes
  private readonly OVER_TIME_THRESHOLD_MINUTES = 30; // Consider overtime if more than 30 minutes
  private readonly UNDER_TIME_THRESHOLD_MINUTES = 0; // Consider under time if less than 30 minutes

  constructor(
    @Inject('BIOMETRIC_SERVICE')
    private readonly biometricService: IBiometricService,
    private readonly attendancesService: AttendancesService,
    private readonly attendancePunchesService: AttendancePunchesService,
    private readonly employeesService: EmployeesService,
    private readonly schedulesService: SchedulesService,
    private readonly biometricDevicesService: BiometricDevicesService,
    private readonly notificationsService: NotificationsService,
    private readonly workTimeRequestsService: WorkTimeRequestsService,
  ) {}

  @OnEvent(ATTENDANCE_EVENTS.ATTENDANCE_RECORDED)
  async handleAttendanceRecorded(event: AttendanceRecordedEvent): Promise<void> {
    this.logger.log(`Handling attendance recorded event for ${event.attendances.length} records`);
    
    // Get the biometric device entity
    const biometricDevice = await this.biometricDevicesService.findOneBy({ id: event.deviceId });
    if (!biometricDevice) {
      this.logger.error(`Biometric device with ID ${event.deviceId} not found`);
      return;
    }

    // Process each attendance record
    for (const record of event.attendances) {
      try {
        // Find employee by biometric ID
        this.logger.log(`Raw userId from device: "${record.userId}"`);

        // Validate userId is a proper number before parsing
        if (!record.userId || !/^\d+$/.test(record.userId.trim())) {
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
        
        const punchTime = new Date(record.timestamp);
        const punchDate = format(punchTime, 'yyyy-MM-dd');
        const punchTimeStr = format(punchTime, 'HH:mm:ss');
        const punchType = record.type;
        
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
          this.logger.warn(`Employee ${employee.id} is on leave today`);
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

        // Find attendance for today if it exists
        let existingAttendance = await this.attendancesService.getEmployeeAttendanceToday(employee.id, punchTime);
        
        // If no existing attendance create an attendance
        if (!existingAttendance) {
          existingAttendance = await this.attendancesService.create({
            employee: { id: employee.id },
            schedule: { id: todaySchedule.id },
            createdBy: employee.user.id,
          });
        }

        // Determine check-in status based on middle time threshold
        if (isBefore(punchTime, middleTime)) {
          if (!existingAttendance.timeIn) {
            attendanceStatuses.push(AttendanceStatus.CHECKED_IN);
            // Check if late
            if (isAfter(punchTime, shiftStartTime)) {
              const minutesLate = differenceInMinutes(punchTime, shiftStartTime);
              if (minutesLate > this.GRACE_PERIOD_MINUTES) {
                attendanceStatuses.push(AttendanceStatus.LATE);
                this.logger.log(`Employee ${employee.user.email} is late by ${minutesLate} minutes`);
                
                // Create work time request for late arrival
                await this.createWorkTimeRequest(dayType, employee.id, AttendanceStatus.LATE, existingAttendance.id, minutesLate);
                
                // Notify employee
                await this.notificationsService.create({
                  title: 'Late Check-in',
                  message: `You are late by ${minutesLate} minutes on ${punchDate} at ${punchTimeStr}.`,
                  type: NotificationType.WARNING,
                  category: 'ATTENDANCE',
                  user: { id: employee.user.id },
                });
              }
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
          if (!existingAttendance.timeIn)
          {
            attendanceStatuses.push(AttendanceStatus.NO_CHECKED_IN);

            // Create work time request for no check in
            await this.createWorkTimeRequest(dayType, employee.id, AttendanceStatus.NO_CHECKED_IN, existingAttendance.id);
            this.logger.log(`Employee ${employee.user.email} did not check in`);
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
            const minutesEarly = differenceInMinutes(shiftEndTime, punchTime);
            if (minutesEarly > this.UNDER_TIME_THRESHOLD_MINUTES) {
              attendanceStatuses.push(AttendanceStatus.UNDER_TIME);
              this.logger.log(`Employee ${employee.id} is leaving ${minutesEarly} minutes early`);
              
              // Create work time request for under time
              await this.createWorkTimeRequest(dayType, employee.id, AttendanceStatus.UNDER_TIME, existingAttendance.id, minutesEarly);
              
              // Notify management
              await this.notificationsService.create({
                title: 'Early Check-out',
                message: `You are leaving ${minutesEarly} minutes early on ${punchDate} at ${punchTimeStr}.`,
                type: NotificationType.WARNING,
                category: 'ATTENDANCE',
                user: { id: employee.user.id },
              });
            }
          } else {
            // Check if employee is overtime
            const minutesOvertime = differenceInMinutes(punchTime, shiftEndTime);
            if (minutesOvertime > this.OVER_TIME_THRESHOLD_MINUTES) {
              attendanceStatuses.push(AttendanceStatus.OVERTIME);
              this.logger.log(`Employee ${employee.id} worked ${minutesOvertime} minutes overtime`);
              
              // Create work time request for overtime
              await this.createWorkTimeRequest(dayType, employee.id, AttendanceStatus.OVERTIME, existingAttendance.id, minutesOvertime);
              
              // Notify employee
              await this.notificationsService.create({
                title: 'Overtime Alert',
                message: `You worked ${minutesOvertime} minutes overtime on ${punchDate} at ${punchTimeStr}.`,
                type: NotificationType.INFO,
                category: 'ATTENDANCE',
                user: { id: employee.user.id },
              });
            }
          }
          
          if (!existingAttendance.timeOut) {
            attendanceStatuses.push(AttendanceStatus.CHECKED_OUT);
            existingAttendance.statuses = [...existingAttendance.statuses, ...attendanceStatuses];
          }
          
          existingAttendance.updatedBy = employee.user.id;
          existingAttendance.timeOut = punchTime;
        }

        await this.attendancesService.save(existingAttendance);
        // Create attendance punch record
        await this.attendancePunchesService.create({
          attendance: { id: existingAttendance.id },
          time: punchTime,
          punchType: record.type.toString(),
          employeeNumber,
          biometricDevice: { id: biometricDevice.id },
          createdBy: employee.user.id,
        });
        
        this.logger.log(`Successfully processed ${punchType} punch for employee ${employee.user.email} at ${punchTimeStr} with status ${existingAttendance.statuses}`);
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error(`Error processing attendance record: ${error.message}`, error.stack);
        } else {
          this.logger.error(`Error processing attendance record: ${String(error)}`);
        }
      }
    }

    // After processing all records, clear the device
    await this.biometricService.clearAttendanceRecords(event.deviceId);
  }

  @OnEvent(ATTENDANCE_EVENTS.ATTENDANCE_PROCESSED)
  async handleAttendanceProcessed(): Promise<void> {
    // create final work hours

  }

  // Helper methods for notifications and work time requests
  
  private async createWorkTimeRequest(dayType: DayType, employeeId: string, type: AttendanceStatus, attendanceId: string, duration?: number): Promise<void> {
    try {
      await this.workTimeRequestsService.create({
        attendance: { id: attendanceId },
        type,
        duration,
        dayType,
        status: RequestStatus.PENDING,
        createdBy: employeeId,
        employee: { id: employeeId },
      });
      this.logger.log(`Created work time request for employee ${employeeId} for type ${type}`);
    } catch (error: any) {
      this.logger.error(`Failed to create work time request: ${error.message}`);
    }
  }

  // private async notifyLateCheckIn(employee: Employee, date: Date, time: Date, lateInfo: string): Promise<void> {
  //   const managersToNotify = await this.employeesService.getEmployeeManagers(employee.id);
    
  //   if (managersToNotify.length > 0) {
  //     await this.notificationsService.createBulkNotifications({
  //       title: 'Late Check-in',
  //       message: `Employee ${employee.user.email} checked in ${lateInfo} on ${date} at ${time}`,
  //       type: 'WARNING',
  //       recipients: managersToNotify.map(manager => ({ id: manager.user.id })),
  //       read: false
  //     }, 'SYSTEM');
  //   }
  // }

  // private async notifyEarlyCheckout(employee, date, minutesEarly: number): Promise<void> {
  //   const managersToNotify = await this.employeesService.getEmployeeManagers(employee.id);
    
  //   if (managersToNotify.length > 0) {
  //     await this.notificationsService.createBulkNotifications({
  //       title: 'Early Check-out',
  //       message: `Employee ${employee.user.email} checked out ${minutesEarly} minutes early on ${date}`,
  //       type: 'WARNING',
  //       recipients: managersToNotify.map(manager => ({ id: manager.user.id })),
  //       read: false
  //     }, 'SYSTEM');
  //   }
  // }

  // private async notifyOvertime(employee, date, minutesOvertime: number): Promise<void> {
  //   const managersToNotify = await this.employeesService.getEmployeeManagers(employee.id);
    
  //   if (managersToNotify.length > 0) {
  //     await this.notificationsService.createBulkNotifications({
  //       title: 'Overtime Alert',
  //       message: `Employee ${employee.user.email} worked ${minutesOvertime} minutes overtime on ${date}`,
  //       type: 'INFO',
  //       recipients: managersToNotify.map(manager => ({ id: manager.user.id })),
  //       read: false
  //     }, 'SYSTEM');
  //   }
  // }

  // private async notifyHolidayCheckIn(employee, holidayName: string): Promise<void> {
  //   const managersToNotify = await this.employeesService.getEmployeeManagers(employee.id);
    
  //   if (managersToNotify.length > 0) {
  //     await this.notificationsService.createBulkNotifications({
  //       title: 'Holiday Check-in',
  //       message: `Employee ${employee.user.email} checked in on a holiday (${holidayName})`,
  //       type: 'INFO',
  //       recipients: managersToNotify.map(manager => ({ id: manager.user.id })),
  //       read: false
  //     }, 'SYSTEM');
  //   }
  // }

  // private async notifyEmployeeOnLeave(employee, date): Promise<void> {
  //   const managersToNotify = await this.employeesService.getEmployeeManagers(employee.id);
    
  //   if (managersToNotify.length > 0) {
  //     await this.notificationsService.createBulkNotifications({
  //       title: 'Check-in While on Leave',
  //       message: `Employee ${employee.user.email} tried to check in while on approved leave for ${date}`,
  //       type: 'INFO',
  //       recipients: managersToNotify.map(manager => ({ id: manager.user.id })),
  //       read: false
  //     }, 'SYSTEM');
  //   }
  // }
}