import { AttendanceStatus } from "@/common/enums/attendance-status.enum";
import { HolidayType } from "@/common/enums/holiday-type.enum";
import { PunchMethod } from "@/common/enums/punch-method.enum";
import { PunchType } from "@/common/enums/punch-type.enum";
import { BiometricDevice } from "@/modules/biometrics/entities/biometric-device.entity";
import { BiometricDevicesService } from "@/modules/biometrics/services/biometric-devices.service";
import { Schedule } from "@/modules/shift-management/schedules/entities/schedule.entity";
import { SchedulesService } from "@/modules/shift-management/schedules/schedules.service";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { addMinutes, format, parseISO } from "date-fns";
import { Between } from "typeorm";
import { AttendancePunchesService } from "../attendance-punches/attendance-punches.service";
import { AttendancePunch } from "../attendance-punches/entities/attendance-punch.entity";
import { AttendancesService } from "../attendances.service";
import { Attendance } from "../entities/attendance.entity";
import { DayType } from "../final-work-hours/entities/final-work-hour.entity";

export interface TestScenario {
  name: string; // Unique name for the scenario
  description: string; // Description of the scenario
  timeIn: Date | null; // Check-in time, null if not applicable
  timeOut: Date | null; // Check-out time, null if not applicable

}

@Injectable()
export class AttendanceDataSeederService implements OnModuleInit {
  private readonly logger = new Logger(AttendanceDataSeederService.name);
  private readonly EMPLOYEE_ID = '4b752aed-c6ca-4085-9195-c50b69d0a787';
  private readonly EMPLOYEE_NUMBER = 1;
  private readonly DEFAULT_DEVICE_ID = 'DEVICE001';

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulesService: SchedulesService,
    private readonly biometricDevicesService: BiometricDevicesService,
    private readonly attendancesService: AttendancesService,
    private readonly attendancePunchesService: AttendancePunchesService,
  ) {}

  async onModuleInit() {
    // Only run when explicitly enabled
    const seedManaged = this.configService.get('SEED_MANAGED_ATTENDANCE', true) === true;
    
    // get all attendances
    const attendanceCount = await this.attendancesService.getRepository().count();
    if (!seedManaged || attendanceCount > 0) {
      return;
    }
    
    // Clear existing attendance data for clean tests when explicitly seeding managed data
    this.logger.log('Clearing existing attendance data before seeding managed scenarios...');
    try {
      await this.attendancePunchesService.getRepository().delete({
        attendance: { employee: { id: this.EMPLOYEE_ID } }
      });
      await this.attendancesService.getRepository().delete({
        employee: { id: this.EMPLOYEE_ID }
      });
    }
    catch (error) {
      this.logger.error('Error clearing existing attendance data:', error);
    }
    
    // Seed focused test data with all important attendance patterns
    await this.seedManagedAttendanceScenarios();
  }

  /**
   * Seeds a manageable set of specific attendance scenarios for testing
   */
  /**
 * Seeds a manageable set of specific attendance scenarios for testing
 * Each scenario will be assigned to a different schedule
 */
async seedManagedAttendanceScenarios(targetDate: Date = new Date()) {
  this.logger.log(`Seeding targeted attendance scenarios for date: ${format(targetDate, 'yyyy-MM-dd')}`);
  
  const biometricDevice = await this.ensureBiometricDeviceExists();
  
  // Fetch multiple schedules for the test employee (we need at least 16)
  // Get schedules from a date range to ensure we have enough
  const startDate = new Date(targetDate);
  startDate.setDate(startDate.getDate() - 15); // Get schedules from 15 days ago
  
  const endDate = new Date(targetDate);
  endDate.setDate(endDate.getDate() + 15); // To 15 days in the future
  
  this.logger.log(`Fetching schedules from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
  
  const schedules = await this.schedulesService.getRepository().find({
    where: {
      employee: { id: this.EMPLOYEE_ID },
      date: Between(startDate, endDate)
    },
    relations: {
      employee: true,
      holiday: true,
      shift: true,
      cutoff: true
    },
    order: { date: 'ASC' }
  });

  // Check if we have enough schedules
  if (schedules.length < 16) {
    this.logger.warn(`Only found ${schedules.length} schedules, need at least 16 for all scenarios`);
    if (schedules.length === 0) {
      this.logger.error('No schedules found for employee, cannot seed attendance data');
      return;
    }
  }

  // Define timing constants
  const EARLY_MINUTES = 20;
  const LATE_MINUTES = 10;
  const UNDERTIME_MINUTES = 20;
  const OVERTIME_MINUTES = 45;

  // Create scenarios array - keeping only what's needed
  const scenarios: TestScenario[] = [
    // Basic scenarios
    {
      name: '1-Regular Attendance',
      description: 'Normal check-in and check-out',
      timeIn: null, // Will be set based on schedule
      timeOut: null // Will be set based on schedule
    },
    {
      name: '2-Late Attendance',
      description: 'Late check-in',
      timeIn: null,
      timeOut: null
    },
    {
      name: '3-Undertime Attendance',
      description: 'Early check-out',
      timeIn: null,
      timeOut: null
    },
    {
      name: '4-Overtime Attendance',
      description: 'Late check-out (overtime)',
      timeIn: null,
      timeOut: null
    },
    {
      name: '5-Early Time Attendance',
      description: 'Early check-in',
      timeIn: null,
      timeOut: null
    },
    {
      name: '6-No Time In',
      description: 'Missing check-in',
      timeIn: null,
      timeOut: null
    },
    {
      name: '7-No Time Out',
      description: 'Missing check-out',
      timeIn: null,
      timeOut: null
    },
    {
      name: '8-Absent',
      description: 'No check-in or check-out',
      timeIn: null,
      timeOut: null
    },
    // Combination scenarios
    {
      name: '9-Late Overtime',
      description: 'Late check-in with overtime',
      timeIn: null,
      timeOut: null
    },
    {
      name: '10-Late Undertime',
      description: 'Late check-in with early check-out',
      timeIn: null,
      timeOut: null
    },
    {
      name: '11-Late No Time Out',
      description: 'Late check-in with missing check-out',
      timeIn: null,
      timeOut: null
    },
    {
      name: '12-Early Undertime',
      description: 'Early check-in with early check-out',
      timeIn: null,
      timeOut: null
    },
    {
      name: '13-Early Overtime',
      description: 'Early check-in with overtime',
      timeIn: null,
      timeOut: null
    },
    {
      name: '14-Early No Time Out',
      description: 'Early check-in with missing check-out',
      timeIn: null,
      timeOut: null
    },
    {
      name: '15-No Time In Undertime',
      description: 'Missing check-in with early check-out',
      timeIn: null,
      timeOut: null
    },
    {
      name: '16-No Time In Overtime',
      description: 'Missing check-in with overtime',
      timeIn: null,
      timeOut: null
    }
  ];

  // Process each scenario with a different schedule
  const totalScenarios = Math.min(scenarios.length, schedules.length);
  for (let i = 0; i < totalScenarios; i++) {
    const scenario = scenarios[i];
    const schedule = schedules[i];
    
    // Format date from the schedule
    const scheduleDate = format(schedule.date, 'yyyy-MM-dd');
    const scheduleStartTime = parseISO(`${scheduleDate}T${schedule.startTime}`);
    const scheduleEndTime = parseISO(`${scheduleDate}T${schedule.endTime}`);
    
    // Configure the scenario times based on schedule and scenario type
    switch (scenario.name.split('-')[0]) {
      case '1': // Regular
        scenario.timeIn = scheduleStartTime;
        scenario.timeOut = scheduleEndTime;
        break;
      case '2': // Late
        scenario.timeIn = addMinutes(scheduleStartTime, LATE_MINUTES);
        scenario.timeOut = scheduleEndTime;
        break;
      case '3': // Undertime
        scenario.timeIn = scheduleStartTime;
        scenario.timeOut = addMinutes(scheduleEndTime, -UNDERTIME_MINUTES);
        break;
      case '4': // Overtime
        scenario.timeIn = scheduleStartTime;
        scenario.timeOut = addMinutes(scheduleEndTime, OVERTIME_MINUTES);
        break;
      case '5': // Early time
        scenario.timeIn = addMinutes(scheduleStartTime, -EARLY_MINUTES);
        scenario.timeOut = scheduleEndTime;
        break;
      case '6': // No time in
        scenario.timeIn = null;
        scenario.timeOut = scheduleEndTime;
        break;
      case '7': // No time out
        scenario.timeIn = scheduleStartTime;
        scenario.timeOut = null;
        break;
      case '8': // Absent
        scenario.timeIn = null;
        scenario.timeOut = null;
        break;
      case '9': // Late overtime
        scenario.timeIn = addMinutes(scheduleStartTime, LATE_MINUTES);
        scenario.timeOut = addMinutes(scheduleEndTime, OVERTIME_MINUTES);
        break;
      case '10': // Late undertime
        scenario.timeIn = addMinutes(scheduleStartTime, LATE_MINUTES);
        scenario.timeOut = addMinutes(scheduleEndTime, -UNDERTIME_MINUTES);
        break;
      case '11': // Late no time out
        scenario.timeIn = addMinutes(scheduleStartTime, LATE_MINUTES);
        scenario.timeOut = null;
        break;
      case '12': // Early undertime
        scenario.timeIn = addMinutes(scheduleStartTime, -EARLY_MINUTES);
        scenario.timeOut = addMinutes(scheduleEndTime, -UNDERTIME_MINUTES);
        break;
      case '13': // Early overtime
        scenario.timeIn = addMinutes(scheduleStartTime, -EARLY_MINUTES);
        scenario.timeOut = addMinutes(scheduleEndTime, OVERTIME_MINUTES);
        break;
      case '14': // Early no time out
        scenario.timeIn = addMinutes(scheduleStartTime, -EARLY_MINUTES);
        scenario.timeOut = null;
        break;
      case '15': // No time in undertime
        scenario.timeIn = null;
        scenario.timeOut = addMinutes(scheduleEndTime, -UNDERTIME_MINUTES);
        break;
      case '16': // No time in overtime
        scenario.timeIn = null;
        scenario.timeOut = addMinutes(scheduleEndTime, OVERTIME_MINUTES);
        break;
    }

    // Create attendance for this schedule and scenario
    await this.createAttendanceForSchedule(schedule, scenario, biometricDevice);
    this.logger.log(`Created attendance for scenario: ${scenario.name} on ${format(schedule.date, 'yyyy-MM-dd')}`);
  }

  this.logger.log(`Successfully seeded ${totalScenarios} attendance scenarios from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
}

  private async createAttendanceForSchedule(
    schedule: Schedule, 
    scenario: TestScenario,
    biometricDevice: BiometricDevice
  ) {
    this.logger.log(`Creating ${scenario.name} scenario for schedule on ${format(schedule.date, 'yyyy-MM-dd')}`);

    // Determine day type based on schedule
    const dayType = this.determineDayType(schedule);

    // Determine attendance statuses
    const statuses = this.determineAttendanceStatuses(schedule, scenario);

    // Create the attendance record
    const attendance = new Attendance({});
    attendance.employee = schedule.employee;
    attendance.schedule = schedule;
    attendance.timeIn = scenario.timeIn || undefined;
    attendance.timeOut = scenario.timeOut || undefined;
    attendance.statuses = statuses;
    attendance.isProcessed = false;
    attendance.dayType = dayType;
    attendance.date = schedule.date;
    attendance.cutoff = schedule.cutoff;
    attendance.organizationId = schedule.employee.organizationId;
    attendance.departmentId = schedule.employee.departmentId;
    attendance.branchId = schedule.employee.branchId;
    attendance.userId = schedule.employee.userId;
    
    // Save the attendance record to get an ID
    const savedAttendance: Attendance = (await this.attendancesService.save(attendance)) as Attendance;
    
    // Create attendance punches if applicable
    const punches: AttendancePunch[] = [];
    
    if (scenario.timeIn) {
      const inPunch = new AttendancePunch({});
      inPunch.attendance = savedAttendance as Attendance;
      inPunch.time = scenario.timeIn;
      inPunch.punchMethod = PunchMethod.FINGERPRINT;
      inPunch.punchType = PunchType.CHECK_IN;
      inPunch.employeeNumber = this.EMPLOYEE_NUMBER;
      inPunch.biometricDevice = biometricDevice;
      punches.push(inPunch);
    }
    
    if (scenario.timeOut) {
      const outPunch = new AttendancePunch({});
      outPunch.attendance = savedAttendance as Attendance;
      outPunch.time = scenario.timeOut;
      outPunch.punchMethod = PunchMethod.FINGERPRINT;
      outPunch.punchType = PunchType.CHECK_OUT;
      outPunch.employeeNumber = this.EMPLOYEE_NUMBER;
      outPunch.biometricDevice = biometricDevice;
      punches.push(outPunch);
    }
    
    // Save all punches
    if (punches.length > 0) {
      await this.attendancePunchesService.getRepository().save(punches);
      this.logger.log(`Created ${punches.length} attendance punches for attendance ${savedAttendance.id}`);
    }
    
    this.logger.log(`Created attendance record ${savedAttendance.id} for ${scenario.name} scenario`);
  }

  private determineDayType(schedule: Schedule): DayType {
    const isRestDay = schedule.restDay === true;
    const holidayType = schedule.holiday?.type;

    if (isRestDay && holidayType === HolidayType.REGULAR) {
      return DayType.REGULAR_HOLIDAY_REST_DAY;
    } else if (isRestDay && (holidayType === HolidayType.SPECIAL_NON_WORKING || holidayType === HolidayType.SPECIAL_WORKING)) {
      return DayType.SPECIAL_HOLIDAY_REST_DAY;
    } else if (isRestDay) {
      return DayType.REST_DAY;
    } else if (holidayType === HolidayType.REGULAR) {
      return DayType.REGULAR_HOLIDAY;
    } else if (holidayType === HolidayType.SPECIAL_NON_WORKING || holidayType === HolidayType.SPECIAL_WORKING) {
      return DayType.SPECIAL_HOLIDAY;
    } else {
      return DayType.REGULAR_DAY;
    }
  }

  private determineAttendanceStatuses(schedule: Schedule, scenario: TestScenario): AttendanceStatus[] {
    const statuses: AttendanceStatus[] = [];
    
    // Parse schedule times
    const scheduleDate = format(schedule.date, 'yyyy-MM-dd');
    const scheduleStartTime = parseISO(`${scheduleDate}T${schedule.startTime}`);
    const scheduleEndTime = parseISO(`${scheduleDate}T${schedule.endTime}`);
    
    // Config values (match those from your attendance configuration)
    const EARLY_THRESHOLD_MINUTES = 15;
    const GRACE_PERIOD_MINUTES = 5;
    const UNDER_TIME_THRESHOLD_MINUTES = 15;
    const OVERTIME_THRESHOLD_MINUTES = 30;
    
    // Handle absence
    if (!scenario.timeIn && !scenario.timeOut) {
      statuses.push(AttendanceStatus.ABSENT);
      return statuses;
    }
    
    // Handle no check-in
    if (!scenario.timeIn && scenario.timeOut) {
      statuses.push(AttendanceStatus.NO_CHECKED_IN);
      statuses.push(AttendanceStatus.CHECKED_OUT);
      return statuses;
    }
    
    // Handle no check-out
    if (scenario.timeIn && !scenario.timeOut) {
      statuses.push(AttendanceStatus.CHECKED_IN);
      statuses.push(AttendanceStatus.NO_CHECKED_OUT);
      return statuses;
    }
    
    // Now we know both timeIn and timeOut exist
    if (scenario.timeIn) {
      statuses.push(AttendanceStatus.CHECKED_IN);
      
      // Check for early arrival
      if (scenario.timeIn < addMinutes(scheduleStartTime, -EARLY_THRESHOLD_MINUTES)) {
        statuses.push(AttendanceStatus.EARLY);
      }
      
      // Check for late arrival
      if (scenario.timeIn > addMinutes(scheduleStartTime, GRACE_PERIOD_MINUTES)) {
        statuses.push(AttendanceStatus.LATE);
      }
    }
    
    if (scenario.timeOut) {
      statuses.push(AttendanceStatus.CHECKED_OUT);
      
      // Check for undertime
      if (scenario.timeOut < addMinutes(scheduleEndTime, -UNDER_TIME_THRESHOLD_MINUTES)) {
        statuses.push(AttendanceStatus.UNDER_TIME);
      }
      
      // Check for overtime
      if (scenario.timeOut > addMinutes(scheduleEndTime, OVERTIME_THRESHOLD_MINUTES)) {
        statuses.push(AttendanceStatus.OVERTIME);
      }
    }
    
    // Special day types
    if (schedule.restDay) {
      statuses.push(AttendanceStatus.REST_DAY);
    }
    
    if (schedule.holiday) {
      statuses.push(AttendanceStatus.HOLIDAY);
    }
    
    return statuses;
  }

  private async ensureBiometricDeviceExists(): Promise<BiometricDevice> {
    // Check if our test biometric device exists
    let biometricDevice = await this.biometricDevicesService.findOneBy({ deviceId: this.DEFAULT_DEVICE_ID });

    if (!biometricDevice) {
      // Create a test biometric device if it doesn't exist
      biometricDevice = await this.biometricDevicesService.create({
        deviceId: this.DEFAULT_DEVICE_ID,
        name: 'Test Biometric Device',
        ipAddress: '10.10.10.45',
        port: 5010,
        isOffline: false,
      });
      this.logger.log(`Created test biometric device with ID: ${this.DEFAULT_DEVICE_ID}`);
    }
    
    return biometricDevice;
  }
}