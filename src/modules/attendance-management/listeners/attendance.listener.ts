import { ATTENDANCE_EVENTS, AttendanceEvent } from '@/common/events/attendance.event';
import { AttendancePunchesService } from '@/modules/attendance-management/attendance-punches/attendance-punches.service';
import { AttendancesService } from '@/modules/attendance-management/attendances.service';
import { IBiometricService } from '@/modules/biometrics/interfaces/biometric.interface';
import { BiometricDevicesService } from '@/modules/biometrics/services/biometric-devices.service';
import { EmployeesService } from '@/modules/employee-management/employees.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { SchedulesService } from '@/modules/schedule-management/schedules.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { differenceInMinutes, format, isAfter, isBefore, parseISO } from 'date-fns';
import { AttendanceStatus } from '../../../common/enums/attendance-status.enum';
import { ScheduleStatus } from '../../../common/enums/schedule-status';

@Injectable()
export class AttendanceListener {
  private readonly logger = new Logger(AttendanceListener.name);
  private readonly LATE_THRESHOLD_MINUTES = 5; // Consider late after 10 minutes
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
    private readonly notificationService: NotificationsService,
  ) {}

  @OnEvent(ATTENDANCE_EVENTS.ATTENDANCE_RECORDED)
  async handleAttendanceRecorded(event: AttendanceEvent): Promise<void> {
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
        
        if (!todaySchedule) {
          this.logger.warn(`No schedule found for employee ${employee.id} on ${punchDate}`);
          // notify employee and higher ups
          continue;
        }

        if (todaySchedule.status === ScheduleStatus.LEAVE) {
          this.logger.warn(`Employee ${employee.id} is on leave today`);
          // notify employee and higher ups
        }

        if (todaySchedule.restDay)
        {

        }

        const { shift, startTime, endTime } = todaySchedule;

        const effecitiveStartTime = startTime || shift.startTime;
        const effectiveEndTime = endTime || shift.endTime;
        const shiftStartTime = parseISO(`${punchDate}T${effecitiveStartTime}`);
        const shiftEndTime = parseISO(`${punchDate}T${effectiveEndTime}`);

        // Find attendance for today if it exists
        let existingAttendance = await this.attendancesService.getEmployeeAttendanceToday(employee.id, punchTime);
        
        // If no existing attendance means check-in, create an attendance
        if (!existingAttendance) {
          let attendanceStatuses = [AttendanceStatus.CHECKED_IN];
          if (todaySchedule.holiday) {
            this.logger.log(`Employee ${employee.id} checked in on a holiday (${todaySchedule.holiday.name})`);
            // notify employee
          }

          // Check if late
          if (isAfter(punchTime, shiftStartTime)) {
            const minutesLate = differenceInMinutes(punchTime, shiftStartTime);
            if (minutesLate > this.LATE_THRESHOLD_MINUTES) {
              attendanceStatuses = [...attendanceStatuses, AttendanceStatus.LATE];
              this.logger.log(`Employee ${employee.user.email} is late by ${minutesLate} minutes`);
              // notify employee and higher ups
              // work time request
            }
          }

          this.logger.log(`Creating new attendance record for employee ${employee.id} on ${punchDate} with status ${attendanceStatuses}`);
          // For a new attendance record, we'll set the timeIn to this punch time
          existingAttendance = await this.attendancesService.create({
            employee: { id: employee.id },
            statuses: [...attendanceStatuses],
            timeIn: punchTime,
            schedule: { id: todaySchedule.id },
            createdBy: employee.user.id,
          });
        }
        // If existing attendance found, its a check-out
        else
        {
          if (isBefore(punchTime, shiftEndTime)) {
            const minutesEarly = differenceInMinutes(shiftEndTime, punchTime);
            if (minutesEarly > this.UNDER_TIME_THRESHOLD_MINUTES) {
              existingAttendance.statuses = [...existingAttendance.statuses, AttendanceStatus.UNDER_TIME];
              this.logger.log(`Employee ${employee.id} is leaving ${minutesEarly} minutes early`);
              // notify employee and higher ups
              // work time request
            }
          } else {
            const minutesOvertime = differenceInMinutes(punchTime, shiftEndTime);
            if (minutesOvertime > this.OVER_TIME_THRESHOLD_MINUTES) { // Consider overtime if more than 30 minutes
              existingAttendance.statuses = [...existingAttendance.statuses, AttendanceStatus.OVERTIME];
              this.logger.log(`Employee ${employee.id} worked ${minutesOvertime} minutes overtime`);
              // notify employee and higher ups
              // work time request
            }
            existingAttendance.statuses = [...existingAttendance.statuses, AttendanceStatus.CHECKED_OUT];
          }
          
          // Update existing attendance
          this.logger.log(`Updating attendance with timeOut for employee ${employee.employeeNumber}`);
          
          // Update time out if it does not exists
          if (!existingAttendance.timeOut) {
            existingAttendance.timeOut = punchTime;
          }

          existingAttendance.updatedBy = employee.user.id;
          
          await this.attendancesService.save(existingAttendance);
        }

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
}