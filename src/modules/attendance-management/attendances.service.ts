import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { HolidayType } from '@/common/enums/holiday-type.enum';
import { NotificationType } from '@/common/enums/notification-type.enum';
import { RequestStatus } from '@/common/enums/request-status.enum';
import { ATTENDANCE_EVENTS, AttendanceProcessedEvent } from '@/common/events/attendance.event';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { differenceInMinutes, endOfDay, format, startOfDay } from 'date-fns';
import { Between, DeepPartial, LessThan, Repository } from 'typeorm';
import { EmployeesService } from '../employee-management/employees.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SchedulesService } from '../shift-management/schedules/schedules.service';
import { AttendanceConfigurationsService } from './attendance-configurations/attendance-configurations.service';
import { Attendance } from './entities/attendance.entity';
import { DayType } from './final-work-hours/entities/final-work-hour.entity';
import { AttendancesGateway } from './gateways/attendances.gateway';
import { WorkTimeRequest } from './work-time-requests/entities/work-time-request.entity';
import { WorkTimeRequestsService } from './work-time-requests/work-time-requests.service';

@Injectable()
export class AttendancesService extends BaseService<Attendance> {
    constructor(
        @InjectRepository(Attendance)
        private readonly attendancesRepository: Repository<Attendance>,
        protected readonly usersService: UsersService,
        private readonly workTimeRequestsService: WorkTimeRequestsService,
        private readonly notificationsService: NotificationsService,
        private readonly employeesService: EmployeesService,
        private readonly schedulesService: SchedulesService,
        private readonly eventEmitter: EventEmitter2,
        private readonly attendancesGateway: AttendancesGateway,
        private readonly attendanceConfigurationsService: AttendanceConfigurationsService,
    ) {
        super(attendancesRepository, usersService);
    }

    override async create(createDto: DeepPartial<Attendance>, createdBy?: string): Promise<Attendance> {
        await this.attendancesGateway.pingAll();
        return await super.create(createDto, createdBy);
    }

    override async update(id: string, updateDto: DeepPartial<Attendance>, updatedBy?: string): Promise<Attendance> {
        await this.attendancesGateway.pingAll();
        return await super.update(id, updateDto, updatedBy);
    }

    override async save(entity: Attendance | Attendance[]): Promise<Attendance | Attendance[]> {
        await this.attendancesGateway.pingAll();
        return await super.save(entity);
    }

    getEmployeeAttendanceToday(employeeId: string, punchTime: Date) {
        return this.attendancesRepository.findOne({
            where: {
                employee: { id: employeeId },
                timeIn: Between(startOfDay(punchTime), endOfDay(punchTime))
            },
            relations: { employee: true }
        });
    }

    // Run at midnight
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async processAttendanceRecords(processedBy?: string): Promise<boolean> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get all attendance records for the day that has no final work hours yet
        const attendances = await this.attendancesRepository.find({
            where: {
                schedule: {
                    date: LessThan(today),
                }
            },
            relations: { cutoff: true, employee: { user: true }, schedule: true },
        });
        
        if (attendances.length === 0) {
            this.logger.log(`No attendance records to process`);
            return false;
        }
        
        this.logger.log(`Processing ${attendances.length} attendance records`);

        // can also process late and no check in
        await this.handleLateEmployees(attendances);

        // Process employees that checked in early
        await this.handleEarlyEmployees(attendances);

        // Process employees with missing check-in
        await this.handleMissingCheckIns(attendances);

        // Process employees with under time
        await this.handleUnderTimeEmployees(attendances);

        // Process employees with over time
        await this.handleOverTimeEmployees(attendances);

        // Process employees with check-in but no check-out
        await this.handleMissingCheckOuts(attendances);

        // Process employees worked on rest day
        await this.handleRestDayEmployees(attendances);

        // Process employees that has no attendance record or absent
        await this.handleAbsentEmployees();

        // mark attendance records as processed
        for (const attendance of attendances) {
            attendance.isProcessed = true;
            attendance.processedBy = processedBy;
            attendance.processedAt = new Date();
        }

        await this.save(attendances);

        // notification
        await this.notificationsService.create({
            title: 'Attendance Processed',
            message: `Attendance records for ${attendances.length} employees have been processed successfully.`,
            type: NotificationType.INFO,
            category: 'ATTENDANCE',
            user: { id: processedBy },
        });

        // log attendance processing
        this.logger.log(`Attendance records processed successfully`);

        // Emit event for attendance processing
        this.eventEmitter.emit(
            ATTENDANCE_EVENTS.ATTENDANCE_PROCESSED,
            new AttendanceProcessedEvent(attendances, processedBy)
        );
        return true;
    }

    async handleEarlyEmployees(attendances: Attendance[]) {
        // filter attendances for early
        const earlyAttendances = attendances.filter(attendance => {
            return attendance.statuses?.includes(AttendanceStatus.EARLY) === true;
        });
        if (earlyAttendances.length === 0) {
            this.logger.log(`No early attendances to process`);
            return;
        }
        this.logger.log(`Found ${earlyAttendances.length} early attendances to process`);
        for (const attendance of earlyAttendances) {
            try {
                this.logger.log(`Processing early for employee ${attendance.employee.user.email}`);
                // get organization config
                const config = await this.attendanceConfigurationsService.getOrganizationAttendanceConfiguration(attendance.employee.organizationId);
                const formattedAttendanceDate = format(attendance.schedule.date, 'yyyy-MM-dd');
                // Calculate early minutes
                const scheduleStartTime = new Date(`${formattedAttendanceDate}T${attendance.schedule.startTime}`);
                const timeIn = attendance.timeIn ? new Date(attendance.timeIn) : new Date(attendance.schedule.startTime);
                // Calculate early (when employee checks in before scheduled start time)
                let earlyMinutes = (scheduleStartTime.getTime() - timeIn.getTime()) / (1000 * 60);
                // Check if organization rounds down early
                if (config.roundDownEarlyTime) {
                    earlyMinutes = Math.ceil(earlyMinutes / config.roundDownEarlyTimeMinutes) * config.roundDownEarlyTimeMinutes;
                }

                // Check if there is already worktime request for early
                const existingRequest = await this.workTimeRequestsService.findOneBy({
                    attendance: new Attendance({ id: attendance.id }),
                    type: AttendanceStatus.EARLY,
                }, { relations: { attendance: true } });

                if (!existingRequest) {
                    this.logger.log(`No existing work time request for early found for employee ${attendance.employee.user.email}`);
                    
                    // Create work time request
                    const workTimeRequest = new WorkTimeRequest({
                        attendance: attendance,
                        type: AttendanceStatus.EARLY,
                        duration: earlyMinutes,
                        status: RequestStatus.PENDING,
                        cutoff: attendance.cutoff,
                        date: attendance.schedule.date,
                        dayType: attendance.dayType,
                        createdBy: attendance.employee.id,
                        employee: attendance.employee,
                        organizationId: attendance.employee.organizationId,
                        branchId: attendance.employee.branchId,
                        departmentId: attendance.employee.departmentId,
                        userId: attendance.employee.userId
                    });

                    await this.workTimeRequestsService.save(workTimeRequest);
    
                    await this.notificationsService.create({
                        title: 'Early Check-in Alert',
                        message: `You checked in early by ${earlyMinutes} minutes on ${formattedAttendanceDate}.`,
                        type: NotificationType.INFO,
                        category: 'ATTENDANCE',
                        user: { id: attendance.employee.user.id },
                    });
                }
                else {
                    // update existing request with early minutes
                    this.logger.log(`Updating existing work time request for early for employee ${attendance.employee.user.email}`);
                    existingRequest.duration = earlyMinutes;
                    await this.workTimeRequestsService.save(existingRequest);
                    await this.notificationsService.create({
                        title: 'Early Updated',
                        message: `Your early request for ${formattedAttendanceDate} has been updated to ${earlyMinutes} minutes.`,
                        type: NotificationType.INFO,
                        category: 'ATTENDANCE',
                        user: { id: attendance.employee.user.id },
                    });
                }
            }
            catch (error: any) {
                this.logger.error(`Error processing early for attendance ${attendance.id}: ${error.message}`, error.stack);
            }
        }
    }

    async handleLateEmployees(attendances: Attendance[]) {
        // filter attendances for late
        const lateAttendances = attendances.filter(attendance => {
            return attendance.statuses?.includes(AttendanceStatus.LATE) === true;
        });
        if (lateAttendances.length === 0) {
            this.logger.log(`No late attendances to process`);
            return;
        }
        this.logger.log(`Found ${lateAttendances.length} late attendances to process`);
        for (const attendance of lateAttendances) {
            try {
                this.logger.log(`Processing late for employee ${attendance.employee.user.email}`);
                // get organization config
                const config = await this.attendanceConfigurationsService.getOrganizationAttendanceConfiguration(attendance.employee.organizationId);
                const formattedAttendanceDate = format(attendance.schedule.date, 'yyyy-MM-dd');
                // Calculate late minutes
                const scheduleStartTime = new Date(`${formattedAttendanceDate}T${attendance.schedule.startTime}`);
                const timeIn = attendance.timeIn ? new Date(attendance.timeIn) : new Date(attendance.schedule.startTime);
                // Calculate late (when employee checks in after scheduled start time)
                let lateMinutes = (timeIn.getTime() - scheduleStartTime.getTime()) / (1000 * 60);
                // Check if organization rounds up late
                if (config.roundUpLate) {
                    lateMinutes = Math.ceil(lateMinutes / config.roundUpLateMinutes) * config.roundUpLateMinutes;
                }

                // Check if there is already worktime request for late
                const existingRequest = await this.workTimeRequestsService.findOneBy({
                    attendance: new Attendance({ id: attendance.id }),
                    type: AttendanceStatus.LATE,
                }, { relations: { attendance: true } });

                if (!existingRequest) {
                    this.logger.log(`No existing work time request for late found for employee ${attendance.employee.user.email}`);
                    
                    // Create work time request
                    const workTimeRequest = new WorkTimeRequest({
                        attendance: attendance,
                        type: AttendanceStatus.LATE,
                        duration: lateMinutes,
                        status: RequestStatus.PENDING,
                        cutoff: attendance.cutoff,
                        date: attendance.schedule.date,
                        dayType: attendance.dayType,
                        createdBy: attendance.employee.id,
                        employee: attendance.employee,
                        organizationId: attendance.employee.organizationId,
                        branchId: attendance.employee.branchId,
                        departmentId: attendance.employee.departmentId,
                        userId: attendance.employee.userId
                    });

                    await this.workTimeRequestsService.save(workTimeRequest);
    
                    await this.notificationsService.create({
                        title: 'Late Check-in Alert',
                        message: `You were late by ${lateMinutes} minutes on ${formattedAttendanceDate}.`,
                        type: NotificationType.WARNING,
                        category: 'ATTENDANCE',
                        user: { id: attendance.employee.user.id },
                    });
                }
                else {
                    // update existing request with late minutes
                    this.logger.log(`Updating existing work time request for late for employee ${attendance.employee.user.email}`);
                    existingRequest.duration = lateMinutes;
                    await this.workTimeRequestsService.save(existingRequest);
                    await this.notificationsService.create({
                        title: 'Late Updated',
                        message: `Your late request for ${formattedAttendanceDate} has been updated to ${lateMinutes} minutes.`,
                        type: NotificationType.INFO,
                        category: 'ATTENDANCE',
                        user: { id: attendance.employee.user.id },
                    });
                }
            } catch (error: any) {
                this.logger.error(`Error processing late for attendance ${attendance.id}: ${error.message}`, error.stack);
            }
        }
    }

    async handleUnderTimeEmployees(attendances: Attendance[]) {

        // filter attendances for under time
        const underTimeAttendances = attendances.filter(attendance => {
            return attendance.statuses?.includes(AttendanceStatus.UNDER_TIME) === true;
        });

        if (underTimeAttendances.length === 0) {
            this.logger.log(`No under time attendances to process`);
            return;
        }

        this.logger.log(`Found ${underTimeAttendances.length} under time attendances to process`);

        for (const attendance of underTimeAttendances) {
            try {
                this.logger.log(`Processing under time for employee ${attendance.employee.user.email}`);

                // get organization config
                const config = await this.attendanceConfigurationsService.getOrganizationAttendanceConfiguration(attendance.employee.organizationId);

                const formattedAttendanceDate = format(attendance.schedule.date, 'yyyy-MM-dd');

                // Calculate total undertime minutes
                const scheduleEndTime = new Date(`${formattedAttendanceDate}T${attendance.schedule.endTime}`);
                const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : new Date(attendance.schedule.endTime);

                // Calculate under time (when employee leaves before scheduled end time)
                let underTimeMinutes = (scheduleEndTime.getTime() - timeOut.getTime()) / (1000 * 60);

                // Check if organization rounds down under time
                if (config.roundDownUnderTime) {
                    underTimeMinutes = Math.ceil(underTimeMinutes / config.roundDownUnderTimeMinutes) * config.roundDownUnderTimeMinutes;
                }

                // Check if there is already worktime request for undertime
                const existingRequest = await this.workTimeRequestsService.findOneBy({
                    attendance: new Attendance({ id: attendance.id }),
                    type: AttendanceStatus.UNDER_TIME,
                }, { relations: { attendance: true } });

                if (!existingRequest) {
                    this.logger.log(`No existing work time request for under time for employee ${attendance.employee.user.email}`);
                    
                    // Create work time request
                    const workTimeRequest = new WorkTimeRequest({
                        attendance: attendance,
                        type: AttendanceStatus.UNDER_TIME,
                        duration: underTimeMinutes,
                        status: RequestStatus.PENDING,
                        cutoff: attendance.cutoff,
                        date: attendance.schedule.date,
                        dayType: attendance.dayType,
                        createdBy: attendance.employee.id,
                        employee: attendance.employee,
                        organizationId: attendance.employee.organizationId,
                        branchId: attendance.employee.branchId,
                        departmentId: attendance.employee.departmentId,
                        userId: attendance.employee.userId
                    });

                    await this.workTimeRequestsService.save(workTimeRequest);
    
                    await this.notificationsService.create({
                        title: 'Early Check-out',
                        message: `You left ${underTimeMinutes} minutes early on ${formattedAttendanceDate}.`,
                        type: NotificationType.WARNING,
                        category: 'ATTENDANCE',
                        user: { id: attendance.employee.user.id },
                    });
                }
                else {
                    // update existing request with under time minutes
                    this.logger.log(`Updating existing work time request for under time for employee ${attendance.employee.user.email}`);
                    existingRequest.duration = underTimeMinutes;
                    await this.workTimeRequestsService.save(existingRequest);
                    await this.notificationsService.create({
                        title: 'Under Time Updated',
                        message: `Your under time request for ${formattedAttendanceDate} has been updated to ${underTimeMinutes} minutes.`,
                        type: NotificationType.INFO,
                        category: 'ATTENDANCE',
                        user: { id: attendance.employee.user.id },
                    });
                }

                
            } catch (error: any) {
                this.logger.error(`Error processing under time for attendance ${attendance.id}: ${error.message}`, error.stack);
            }
        }
    }

    async handleOverTimeEmployees(attendances: Attendance[]) {

        // filter attendances for over time
        const overTimeAttendances = attendances.filter(attendance => {
            return attendance.statuses?.includes(AttendanceStatus.OVERTIME) === true;
        });

        if (overTimeAttendances.length === 0) {
            this.logger.log(`No over time attendances to process`);
            return;
        }

        this.logger.log(`Found ${overTimeAttendances.length} over time attendances to process`);

        for (const attendance of overTimeAttendances) {
            try {
                this.logger.log(`Processing over time for employee ${attendance.employee.user.email}`);
                
                const formattedAttendanceDate = format(attendance.schedule.date, 'yyyy-MM-dd');
                const config = await this.attendanceConfigurationsService.getOrganizationAttendanceConfiguration(attendance.employee.organizationId);

                // Calculate total overtime minutes
                const scheduleEndTime = new Date(`${formattedAttendanceDate}T${attendance.schedule.endTime}`);
                const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : new Date(attendance.schedule.endTime);

                // Calculate overtime (when employee leaves after scheduled end time)
                let overtimeMinutes = (timeOut.getTime() - scheduleEndTime.getTime()) / (1000 * 60);

                // Check if organization rounds up overtime
                if (config.roundUpOvertime) {
                    overtimeMinutes = Math.ceil(overtimeMinutes / config.roundUpOvertimeMinutes) * config.roundUpOvertimeMinutes;
                }

                // Check if there is already worktime request for overtime
                const existingRequest = await this.workTimeRequestsService.findOneBy({
                    attendance: new Attendance({ id: attendance.id }),
                    type: AttendanceStatus.OVERTIME,
                }, { relations: { attendance: true } });

                if (!existingRequest) {
                    this.logger.log(`No existing work time request for overtime found for employee ${attendance.employee.user.email}`);

                    // Create work time request
                    const workTimeRequest = new WorkTimeRequest({
                        attendance: attendance,
                        type: AttendanceStatus.OVERTIME,
                        duration: overtimeMinutes,
                        date: attendance.schedule.date,
                        status: RequestStatus.PENDING,
                        dayType: attendance.dayType,
                        cutoff: attendance.cutoff,
                        createdBy: attendance.employee.id,
                        employee: attendance.employee,
                        organizationId: attendance.employee.organizationId,
                        branchId: attendance.employee.branchId,
                        departmentId: attendance.employee.departmentId,
                        userId: attendance.employee.userId
                    });

                    await this.workTimeRequestsService.save(workTimeRequest);

                    await this.notificationsService.create({
                        title: 'Overtime Alert',
                        message: `You worked ${overtimeMinutes} minutes of overtime on ${formattedAttendanceDate}.`,
                        type: NotificationType.INFO,
                        category: 'ATTENDANCE',
                        user: { id: attendance.employee.user.id },
                    });
                }
                else {
                    // update existing request with overtime minutes
                    this.logger.log(`Updating existing work time request for overtime for employee ${attendance.employee.user.email}`);
                    existingRequest.duration = overtimeMinutes;
                    await this.workTimeRequestsService.save(existingRequest);
                    await this.notificationsService.create({
                        title: 'Overtime Updated',
                        message: `Your overtime request for ${formattedAttendanceDate} has been updated to ${overtimeMinutes} minutes.`,
                        type: NotificationType.INFO,
                        category: 'ATTENDANCE',
                        user: { id: attendance.employee.user.id },
                    });
                }
                
            } catch (error: any) {
                this.logger.error(`Error processing over time for attendance ${attendance.id}: ${error.message}`, error.stack);
            }
        }
    }

    async handleMissingCheckOuts(attendances: Attendance[]) {
        // filter attendances for missing check-out
        const incompleteAttendances = attendances.filter(attendance => {
            return attendance.timeIn && !attendance.timeOut;
        });

        if (incompleteAttendances.length === 0) {
            this.logger.log(`No missing check out attendances to process`);
            return;
        }

        this.logger.log(`Found ${incompleteAttendances.length} missing checkout attendances to process`);
        
        for (const attendance of incompleteAttendances) {
            try {
                const formattedAttendanceDate = format(attendance.schedule.date, 'yyyy-MM-dd');
                this.logger.log(`Employee ${attendance.employee.user.email} has no check-out for ${formattedAttendanceDate}`);
                // Update attendance with NO_CHECKED_OUT status
                if (!attendance.statuses?.includes(AttendanceStatus.NO_CHECKED_OUT)) {
                    attendance.statuses = [...attendance.statuses || [], AttendanceStatus.NO_CHECKED_OUT];
                }
                await this.save(attendance);

                // Check if there is already worktime request for missing check-out
                const existingRequest = await this.workTimeRequestsService.findOneBy({
                    attendance: new Attendance({ id: attendance.id }),
                    type: AttendanceStatus.NO_CHECKED_OUT,
                }, { relations: { attendance: true } });

                if (!existingRequest) {
                    this.logger.log(`No existing work time request for missing check-out found for employee ${attendance.employee.user.email}`);

                    // create new work time request
                    await this.workTimeRequestsService.create({
                        attendance,
                        type: AttendanceStatus.NO_CHECKED_OUT,
                        status: RequestStatus.PENDING,
                        cutoff: attendance.cutoff,
                        dayType: attendance.dayType,
                        date: attendance.schedule.date,
                        createdBy: attendance.employee.id,
                        employee: { id: attendance.employee.id },
                        organizationId: attendance.employee.organizationId,
                        branchId: attendance.employee.branchId,
                        departmentId: attendance.employee.departmentId,
                        userId: attendance.employee.userId
                    });

                    await this.notificationsService.create({
                        title: 'Missing Check-Out Alert',
                        message: `You forgot to check-out in ${formattedAttendanceDate}. Please check your attendance record.`,
                        type: NotificationType.DANGER,
                        category: 'ATTENDANCE',
                        user: { id: attendance.employee.user.id },
                    });
                }

            } catch (error: any) {
                this.logger.error(`Error processing missing check-out for attendance ${attendance.id}: ${error.message}`);
            }
        }
    }

    async handleMissingCheckIns(attendances: Attendance[]) {
        // filter attendances for missing check-in
        const incompleteAttendances = attendances.filter(attendance => {
            return !attendance.timeIn && attendance.timeOut;
        });

        if (incompleteAttendances.length === 0) {
            this.logger.log(`No missing check in attendances to process`);
            return;
        }

        this.logger.log(`Found ${incompleteAttendances.length} missing check-in attendances to process`);

        for (const attendance of incompleteAttendances) {
            try {
                const formattedAttendanceDate = format(attendance.schedule.date, 'yyyy-MM-dd');
                this.logger.log(`Employee ${attendance.employee.user.email} has no check-in for ${formattedAttendanceDate}`);
                // Update attendance with NO_CHECKED_IN status
                if (!attendance.statuses?.includes(AttendanceStatus.NO_CHECKED_IN)) {
                    attendance.statuses = [...attendance.statuses || [], AttendanceStatus.NO_CHECKED_IN];
                }
                await this.save(attendance);

                // Check if there is already worktime request for missing check-in
                const existingRequest = await this.workTimeRequestsService.findOneBy({
                    attendance: new Attendance({ id: attendance.id }),
                    type: AttendanceStatus.NO_CHECKED_IN,
                }, { relations: { attendance: true } });

                if (!existingRequest) {
                    this.logger.log(`No existing work time request for missing check-in found for employee ${attendance.employee.user.email}`);

                    // create new work time request
                    await this.workTimeRequestsService.create({
                        attendance,
                        type: AttendanceStatus.NO_CHECKED_IN,
                        status: RequestStatus.PENDING,
                        cutoff: attendance.cutoff,
                        dayType: attendance.dayType,
                        date: attendance.schedule.date,
                        createdBy: attendance.employee.id,
                        employee: { id: attendance.employee.id },
                        organizationId: attendance.employee.organizationId,
                        branchId: attendance.employee.branchId,
                        departmentId: attendance.employee.departmentId,
                        userId: attendance.employee.userId
                    });

                    await this.notificationsService.create({
                        title: 'Missing Check-In Alert',
                        message: `You forgot to check-in on ${formattedAttendanceDate}. Please check your attendance record.`,
                        type: NotificationType.DANGER,
                        category: 'ATTENDANCE',
                        user: { id: attendance.employee.user.id },
                    });
                }

            } catch (error: any) {
                this.logger.error(`Error processing missing check-in for attendance ${attendance.id}: ${error.message}`);
            }
        }
    }

    async handleRestDayEmployees(attendances: Attendance[]) {
        // filter attendances for rest day
        const restDayAttendances = attendances.filter(attendance => {
            return attendance.schedule.restDay === true && attendance.timeIn && attendance.timeOut;
        });

        if (restDayAttendances.length === 0) {
            this.logger.log(`No rest day attendances to process`);
            return;
        }
        
        this.logger.log(`Found ${restDayAttendances.length} rest day attendances to process`);
        
        for (const attendance of restDayAttendances) {
            try {
                const formattedDate = format(attendance.schedule.date, 'yyyy-MM-dd');
                this.logger.log(`Processing rest day work for employee ${attendance.employee.user.email} on ${formattedDate}`);
                
                // Calculate total hours worked
                const timeIn = attendance.timeIn ? new Date(attendance.timeIn) : new Date();
                const timeOut = attendance.timeOut ? new Date(attendance.timeOut) : new Date();
                const breakTimeMinutes = attendance.schedule.breakTime || 0;
                
                // Calculate total minutes worked (excluding break)
                const totalWorkMinutes = differenceInMinutes(timeOut, timeIn) - breakTimeMinutes;
                const totalWorkHours = totalWorkMinutes / 60;
                
                // Check if the employee worked a full shift (9+ hours including break)
                // This translates to 8+ hours of actual work time
                if (totalWorkHours >= 8) {
                    this.logger.log(`Employee ${attendance.employee.id} worked ${totalWorkHours.toFixed(2)} hours on rest day - eligible for offset`);
                    
                    // Add OFFSET status
                    if (!attendance.statuses?.includes(AttendanceStatus.OFFSET)) {
                        attendance.statuses = [...attendance.statuses || [], AttendanceStatus.OFFSET];
                    }
                    
                    // Grant offset leave credit to the employee
                    attendance.employee.offsetLeaveCredits += 1;
                    await this.employeesService.save(attendance.employee);

                    // await this.workTimeRequestsService.create({
                    //     attendance,
                    //     type: AttendanceStatus.OFFSET,
                    //     status: RequestStatus.PENDING,
                    //     dayType: attendance.dayType,
                    //     createdBy: attendance.employee.id,
                    //     employee: { id: attendance.employee.id },
                    // });
                    
                    // Notify the employee about offset earned
                    await this.notificationsService.create({
                        title: 'Rest Day Offset Requested',
                        message: `You received 1 offset leave credit for working on your rest day (${formattedDate}).`,
                        type: NotificationType.INFO,
                        category: 'ATTENDANCE',
                        user: { id: attendance.employee.user.id },
                    });
                } else {
                    this.logger.log(`Employee ${attendance.employee.id} worked ${totalWorkHours.toFixed(2)} hours on rest day - eligible for overtime`);
                    
                    // Add OVERTIME status
                    if (!attendance.statuses?.includes(AttendanceStatus.OVERTIME)) {
                        attendance.statuses = [...attendance.statuses || [], AttendanceStatus.OVERTIME];
                    }

                    // Check if there is already worktime request for overtime
                    const existingRequest = await this.workTimeRequestsService.findOneBy({
                        attendance: new Attendance({ id: attendance.id }),
                        type: AttendanceStatus.OVERTIME,
                    }, { relations: { attendance: true } });

                    if (!existingRequest) {
                        
                        // Notify the employee about overtime
                        await this.notificationsService.create({
                            title: 'Rest Day Overtime',
                            message: `Your ${totalWorkHours.toFixed(2)} hours worked on rest day (${formattedDate}) will be counted as overtime.`,
                            type: NotificationType.INFO,
                            category: 'ATTENDANCE',
                            user: { id: attendance.employee.user.id },
                        });

                        // Create a work time request for overtime
                        await this.workTimeRequestsService.create({
                            attendance: { id: attendance.id },
                            type: AttendanceStatus.OVERTIME,
                            dayType: attendance.dayType,
                            duration: totalWorkMinutes,
                            date: attendance.schedule.date,
                            status: RequestStatus.PENDING,
                            employee: { id: attendance.employee.id },
                            organizationId: attendance.employee.organizationId,
                            branchId: attendance.employee.branchId,
                            departmentId: attendance.employee.departmentId,
                            userId: attendance.employee.userId
                        });
                    }
                    else {
                        // Update existing request with overtime minutes
                        this.logger.log(`Updating existing work time request for overtime for employee ${attendance.employee.user.email}`);
                        existingRequest.duration = totalWorkMinutes;
                        await this.workTimeRequestsService.save(existingRequest);
                        await this.notificationsService.create({
                            title: 'Rest Day Overtime Updated',
                            message: `Your overtime request for ${formattedDate} has been updated to ${totalWorkMinutes} minutes.`,
                            type: NotificationType.INFO,
                            category: 'ATTENDANCE',
                            user: { id: attendance.employee.user.id },
                        });
                    }
                }
                
                // Save the updated attendance record
                await this.save(attendance);
    
            } catch (error: any) {
                this.logger.error(`Error processing rest day for attendance ${attendance.id}: ${error.message}`, error.stack);
            }
        }
    }

    async handleAbsentEmployees() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find all schedules for the given date that should have attendance
        let previousSchedules = await this.schedulesService.getRepository().find({
            where: { 
                date: LessThan(today),
            },
            relations: { cutoff: true, employee: { user: true }, attendance: true }
        });

       // First resolve all attendance checks with Promise.all
        const schedulesWithAbsenceInfo = await Promise.all(previousSchedules.map(async (schedule) => {
            const attendance = await this.attendancesRepository.findOne({
                where: { schedule: { id: schedule.id } },
                relations: { schedule: { employee: true } }
            });

            const isAbsent = attendance &&
                (attendance.statuses && 
                attendance.statuses.includes(AttendanceStatus.ABSENT));

            return { schedule, isAbsent };
        }));

        // Then filter based on the resolved absence status
        const absentSchedules = schedulesWithAbsenceInfo
            .filter(item => item.isAbsent)
            .map(item => item.schedule);

        if (absentSchedules.length === 0) {
            this.logger.log(`No schedules found for absence processing`);
            return;
        }

        this.logger.log(`Found ${absentSchedules.length} schedules to process for absence`);
        
        // Process each absent employee
        for (const schedule of absentSchedules) {
            try
            {
                let dayType: DayType;
                const isRestDay = schedule.restDay;
                const holidayType = schedule.holiday?.type;
        
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
                // Create new attendance record with absent status
                let attendance = await this.attendancesRepository.findOne({ where: { schedule: { id: schedule.id } }, relations: { schedule: true } });
                if (!attendance) {
                    this.logger.log(`No attendance record found for employee ${schedule.employee.user.email} on ${format(schedule.date, 'MMMM dd, yyyy')}`);
                    attendance = new Attendance({});
                }
                attendance.employee = schedule.employee;
                attendance.schedule = schedule;
                attendance.dayType = dayType;
                attendance.isProcessed = true;
                attendance.date = schedule.date;
                attendance.cutoff = schedule.cutoff;
                attendance.statuses = [AttendanceStatus.ABSENT];

                const savedAttendance = await this.attendancesRepository.save(attendance);
                
                // Check if there is already worktime request for absence
                const existingRequest = await this.workTimeRequestsService.findOneBy({
                    attendance: new Attendance({ id: savedAttendance.id }),
                    type: AttendanceStatus.ABSENT,
                }, { relations: { attendance: true } });
                
                if (!existingRequest) {

                    // Notify the employee about their recorded absence
                    await this.notificationsService.create({
                        user: { id: schedule.employee.user.id },
                        title: 'Absence Recorded',
                        category: 'ATTENDANCE',
                        message: `You were marked absent for ${format(schedule.date, 'MMMM dd, yyyy')}`,
                        type: NotificationType.DANGER
                    });
                    this.logger.log(`New attendance record created for employee ${schedule.employee.user.email} on ${format(schedule.date, 'MMMM dd, yyyy')}`);
                    // Create work time request for the absence
                    const workTimeRequest = new WorkTimeRequest({});
                    workTimeRequest.employee = schedule.employee;
                    workTimeRequest.attendance = savedAttendance;
                    workTimeRequest.date = schedule.date;
                    workTimeRequest.type = AttendanceStatus.ABSENT;
                    workTimeRequest.status = RequestStatus.PENDING;
                    workTimeRequest.cutoff = schedule.cutoff;
                    workTimeRequest.dayType = dayType;
                    workTimeRequest.createdBy = schedule.employee.id;
                    workTimeRequest.organizationId = schedule.employee.organizationId;
                    workTimeRequest.branchId = schedule.employee.branchId;
                    workTimeRequest.departmentId = schedule.employee.departmentId;
                    workTimeRequest.userId = schedule.employee.userId;
                    await this.workTimeRequestsService.save(workTimeRequest);
                }

            } catch (error: any) {
                this.logger.error(`Error processing absence for employee ${schedule.employee.id}: ${error.message}`, error.stack);
            }
        }
    }
}