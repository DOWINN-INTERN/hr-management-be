import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { HolidayType } from '@/common/enums/holiday-type.enum';
import { PunchMethod } from '@/common/enums/punch-method.enum';
import { PunchType } from '@/common/enums/punch-type.enum';
import { BiometricDevice } from '@/modules/biometrics/entities/biometric-device.entity';
import { BiometricDevicesService } from '@/modules/biometrics/services/biometric-devices.service';
import { Schedule } from '@/modules/shift-management/schedules/entities/schedule.entity';
import { SchedulesService } from '@/modules/shift-management/schedules/schedules.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { addMinutes, format, parseISO, subDays } from 'date-fns';
import { Repository } from 'typeorm';
import { AttendancePunchesService } from '../../attendance-punches/attendance-punches.service';
import { AttendancePunch } from '../../attendance-punches/entities/attendance-punch.entity';
import { Attendance } from '../../entities/attendance.entity';
import { DayType } from '../entities/final-work-hour.entity';

interface TestScenario {
  name: string;
  description: string;
  timeIn?: Date | null;  // If null, no check-in
  timeOut?: Date | null; // If null, no check-out
}

@Injectable()
export class AttendanceDataSeederService implements OnModuleInit {
  private readonly logger = new Logger(AttendanceDataSeederService.name);
  private readonly EMPLOYEE_ID = 'fa985931-6d3f-4468-a1d9-f071a3cb930c';
  private readonly EMPLOYEE_NUMBER = 1;
  private readonly DEFAULT_DEVICE_ID = 'DEVICE001';
  private readonly GRACE_PERIOD_MINUTES = 5; // Consider late after 5 minutes
  private readonly OVER_TIME_THRESHOLD_MINUTES = 30; // Consider overtime if more than 30 minutes
  private readonly UNDER_TIME_THRESHOLD_MINUTES = 15; // Consider under time if less than 15 minutes

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulesService: SchedulesService,
    private readonly biometricDevicesService: BiometricDevicesService,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly attendancePunchesService: AttendancePunchesService,
  ) {}

  async onModuleInit() {
    // Only run in development mode or when explicitly enabled
    const seedAttendance = this.configService.get('SEED_ATTENDANCE') === 'true';
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    // Check if there is attendance data to seed
    const attendanceCount = await this.attendanceRepository.count({
      where: {
        employee: { id: this.EMPLOYEE_ID },
      },
    });

    if (attendanceCount > 0) {
      this.logger.log('Attendance data already exists, skipping seeding');
      return;
    }
    
    if (seedAttendance || isDevelopment) {
      await this.seedAttendanceData();
    }
  }

  async seedAttendanceData() {
    this.logger.log('Starting to seed attendance data...');

    try {
      // Ensure we have a biometric device to associate with punches
      const biometricDevice = await this.ensureBiometricDeviceExists();

      // Get the employee's schedules
      const schedules = await this.schedulesService.getRepository().find({
        where: {
          employee: { id: this.EMPLOYEE_ID },
        },
        relations: {
          employee: true,
          holiday: true,
          shift: true,
          cutoff: true
        }
      });

      if (schedules.length === 0) {
        this.logger.warn('No schedules found for the target employee');
        return;
      }

      this.logger.log(`Found ${schedules.length} schedules to seed attendance for`);

      // Create test scenarios for each schedule
      for (let i = 0; i < schedules.length; i++) {
        const schedule = schedules[i];
        
        // Vary the scenario based on index to create different test cases
        const scenario = this.getScenarioForSchedule(schedule, i);
        await this.createAttendanceForSchedule(schedule, scenario, biometricDevice);
      }

      this.logger.log('Attendance data seeding completed successfully');
    } catch (error) {
      this.logger.error(`Failed to seed attendance data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getScenarioForSchedule(schedule: Schedule, index: number): TestScenario {
    // Parse the schedule date and times
    const scheduleDate = schedule.date;
    const startTime = schedule.startTime;
    const endTime = schedule.endTime;
    
    // Create the base datetime objects
    const scheduleDateObj = new Date(scheduleDate);
    const scheduleStartTime = parseISO(`${format(scheduleDateObj, 'yyyy-MM-dd')}T${startTime}`);
    const scheduleEndTime = parseISO(`${format(scheduleDateObj, 'yyyy-MM-dd')}T${endTime}`);

    // Select scenario based on the index (to get variety)
    switch (index % 5) {
      case 0:
        // Regular attendance (on time, leave on time)
        return {
          name: 'Regular Attendance',
          description: 'Employee arrives and leaves on time',
          timeIn: scheduleStartTime,
          timeOut: scheduleEndTime
        };
      
      case 1:
        // Late attendance
        return {
          name: 'Late Attendance',
          description: 'Employee arrives 15 minutes late and leaves on time',
          timeIn: addMinutes(scheduleStartTime, 15),
          timeOut: scheduleEndTime
        };
      
      case 2:
        // Overtime
        return {
          name: 'Overtime',
          description: 'Employee arrives on time and works 45 minutes overtime',
          timeIn: scheduleStartTime,
          timeOut: addMinutes(scheduleEndTime, 45)
        };
      
      case 3:
        // Undertime
        return {
          name: 'Undertime',
          description: 'Employee arrives on time but leaves 30 minutes early',
          timeIn: scheduleStartTime,
          timeOut: addMinutes(scheduleEndTime, -30)
        };
      
      case 4:
        // No check-out
        return {
          name: 'Missing Check-out',
          description: 'Employee checks in but forgets to check out',
          timeIn: scheduleStartTime,
          timeOut: null
        };
      
      default:
        // Default to regular attendance
        return {
          name: 'Regular Attendance',
          description: 'Employee arrives and leaves on time',
          timeIn: scheduleStartTime,
          timeOut: scheduleEndTime
        };
    }
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
    
    // Save the attendance record to get an ID
    const savedAttendance = await this.attendanceRepository.save(attendance);
    
    // Create attendance punches if applicable
    const punches: AttendancePunch[] = [];
    
    if (scenario.timeIn) {
      const inPunch = new AttendancePunch({});
      inPunch.attendance = savedAttendance;
      inPunch.time = scenario.timeIn;
      inPunch.punchMethod = PunchMethod.FINGERPRINT;
      inPunch.punchType = PunchType.CHECK_IN;
      inPunch.employeeNumber = this.EMPLOYEE_NUMBER;
      inPunch.biometricDevice = biometricDevice;
      punches.push(inPunch);
    }
    
    if (scenario.timeOut) {
      const outPunch = new AttendancePunch({});
      outPunch.attendance = savedAttendance;
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
    
    // No time in means absent
    if (!scenario.timeIn) {
      statuses.push(AttendanceStatus.ABSENT);
      return statuses;
    }
    
    // Check for late
    const scheduleStartTime = parseISO(`${format(schedule.date, 'yyyy-MM-dd')}T${schedule.startTime}`);
    const lateThreshold = addMinutes(scheduleStartTime, this.GRACE_PERIOD_MINUTES);
    
    if (scenario.timeIn > lateThreshold) {
      statuses.push(AttendanceStatus.LATE);
    }
    
    // Check for no check-out
    if (scenario.timeIn && !scenario.timeOut) {
      statuses.push(AttendanceStatus.NO_CHECKED_OUT);
      return statuses;
    }
    
    // Check for undertime
    if (scenario.timeOut) {
      const scheduleEndTime = parseISO(`${format(schedule.date, 'yyyy-MM-dd')}T${schedule.endTime}`);
      const undertimeThreshold = addMinutes(scheduleEndTime, -this.UNDER_TIME_THRESHOLD_MINUTES);
      
      if (scenario.timeOut < undertimeThreshold) {
        statuses.push(AttendanceStatus.UNDER_TIME);
      }
      
      // Check for overtime
      const overtimeThreshold = addMinutes(scheduleEndTime, this.OVER_TIME_THRESHOLD_MINUTES);
      
      if (scenario.timeOut > overtimeThreshold) {
        statuses.push(AttendanceStatus.OVERTIME);
      }
    }
    
    // If no special statuses are applied, mark as present
    if (statuses.length === 0) {
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

  // Method to manually simulate historical data
  async seedHistoricalData(days: number = 5) {
    this.logger.log(`Seeding historical attendance data for past ${days} days`);
    
    const biometricDevice = await this.ensureBiometricDeviceExists();
    const today = new Date();
    
    for (let i = 1; i <= days; i++) {
      const targetDate = format(subDays(today, i), 'yyyy-MM-dd');
      
      // Find schedules for that day
      const schedules = await this.schedulesService.getRepository().find({
        where: {
          employee: { id: this.EMPLOYEE_ID },
          date: parseISO(targetDate)
        },
        relations: {
          employee: true,
          holiday: true,
          shift: true,
          cutoff: true
        }
      });

      if (schedules.length === 0) {
        continue;
      }

      // For each schedule, create a random scenario
      for (const schedule of schedules) {
        const scenarioIndex = Math.floor(Math.random() * 5); // 0-4
        const scenario = this.getScenarioForSchedule(schedule, scenarioIndex);
        
        // For historical data, we may want to adjust the attendance dates
        if (scenario.timeIn) {
          scenario.timeIn = parseISO(`${targetDate}T${format(scenario.timeIn, 'HH:mm:ss')}`);
        }
        
        if (scenario.timeOut) {
          scenario.timeOut = parseISO(`${targetDate}T${format(scenario.timeOut, 'HH:mm:ss')}`);
        }
        
        await this.createAttendanceForSchedule(schedule, scenario, biometricDevice);
      }
    }
    
    this.logger.log('Historical attendance data seeding completed');
  }
}