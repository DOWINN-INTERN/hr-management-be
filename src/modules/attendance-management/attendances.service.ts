import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { NotificationType } from '@/common/enums/notification-type.enum';
import { RequestStatus } from '@/common/enums/request-status.enum';
import { ATTENDANCE_EVENTS, AttendanceProcessedEvent } from '@/common/events/attendance.event';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { differenceInMinutes, endOfDay, format, startOfDay, subDays } from 'date-fns';
import { Between, IsNull, Not, Repository } from 'typeorm';
import { EmployeesService } from '../employee-management/employees.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SchedulesService } from '../shift-management/schedules/schedules.service';
import { Attendance } from './entities/attendance.entity';
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
    ) {
        super(attendancesRepository, usersService);
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
    async processAttendanceRecords() {
        const yesterday = subDays(new Date(), 1);
        const yesterdayFormatted = format(yesterday, 'yyyy-MM-dd');
        
        this.logger.log(`Processing attendance records for ${yesterdayFormatted}`);
        
        // Process employees with check-in but no check-out
        await this.handleMissingCheckOuts(yesterday);

        // Process employees worked on rest day
        await this.handleRestDayEmployees(yesterday);

        // Process employees that has no attendance record or absent
        await this.handleAbsentEmployees(yesterday);
        
        this.logger.log(`Completed processing attendance records for ${yesterdayFormatted}`);

        // Get all attendance records for the day that has no final work hours yet
        const attendances = await this.attendancesRepository.find({
            where: {
                timeIn: Between(startOfDay(yesterday), endOfDay(yesterday)),
                finalWorkHour: IsNull(),
            },
            relations: { employee: true, schedule: true }
        });

        // Emit event for attendance processing
        this.eventEmitter.emit(
            ATTENDANCE_EVENTS.ATTENDANCE_PROCESSED,
            new AttendanceProcessedEvent(attendances)
        );
    }

    private async handleMissingCheckOuts(date: Date) {
        const formattedDate = format(date, 'yyyy-MM-dd');
        this.logger.log(`Handling missing check-outs for ${formattedDate}`);
        
        // Find all attendance records for the day that have timeIn but no timeOut
        const incompleteAttendances = await this.attendancesRepository.find({
            where: {
                timeIn: Between(startOfDay(date), endOfDay(date)),
                timeOut: IsNull(),
            },
            relations: { employee: true, schedule: true }
        });
        
        for (const attendance of incompleteAttendances) {
            try {
                this.logger.log(`Employee ${attendance.employee.id} has no check-out for ${formattedDate}`);
                
                // Update attendance with NO_CHECKED_OUT status
                attendance.statuses = [...attendance.statuses, AttendanceStatus.NO_CHECKED_OUT];
                attendance.timeOut = new Date(`${formattedDate}T${attendance.schedule.endTime}`); // Use schedule end time
                await this.save(attendance);

                // create new work time request
                await this.workTimeRequestsService.create({
                    attendance: { id: attendance.id },
                    type: AttendanceStatus.NO_CHECKED_OUT,
                    status: RequestStatus.PENDING,
                    employee: { id: attendance.employee.id },
                });

                await this.notificationsService.create({
                    title: 'Missing Check-Out Alert',
                    message: `You have a missing check-out for ${formattedDate}. Please check your attendance record.`,
                    type: NotificationType.INFO,
                    category: 'ATTENDANCE',
                    user: { id: attendance.employee.user.id },
                });

            } catch (error: any) {
                this.logger.error(`Error processing missing check-out for attendance ${attendance.id}: ${error.message}`);
            }
        }
    }

    async handleRestDayEmployees(date: Date) {
        const formattedDate = format(date, 'yyyy-MM-dd');
        this.logger.log(`Handling rest day employees for ${formattedDate}`);
        
        // Find all attendance records for the day where employees worked on their rest day
        // and have clocked out (timeOut is not null)
        const restDayAttendances = await this.attendancesRepository.find({
            where: {
                timeIn: Between(startOfDay(date), endOfDay(date)),
                timeOut: Not(IsNull()),  // Only process completed shifts
                schedule: {
                    restDay: true,
                },
            },
            relations: { employee: true, schedule: true }
        });
        
        for (const attendance of restDayAttendances) {
            try {
                this.logger.log(`Processing rest day work for employee ${attendance.employee.id} on ${formattedDate}`);
                
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
                    if (!attendance.statuses.includes(AttendanceStatus.OFFSET)) {
                        attendance.statuses = [...attendance.statuses, AttendanceStatus.OFFSET];
                    }
                    
                    // Grant offset leave credit to the employee
                    attendance.employee.offsetLeaveCredits += 1;
                    await this.employeesService.save(attendance.employee);
                    
                    // Notify the employee about offset earned
                    await this.notificationsService.create({
                        title: 'Rest Day Offset Earned',
                        message: `You have earned 1 offset leave credit for working on your rest day (${formattedDate}).`,
                        type: NotificationType.SUCCESS,
                        category: 'ATTENDANCE',
                        user: { id: attendance.employee.user.id },
                    });
                } else {
                    this.logger.log(`Employee ${attendance.employee.id} worked ${totalWorkHours.toFixed(2)} hours on rest day - eligible for overtime`);
                    
                    // Add OVERTIME status
                    if (!attendance.statuses.includes(AttendanceStatus.OVERTIME)) {
                        attendance.statuses = [...attendance.statuses, AttendanceStatus.OVERTIME];
                    }
                    
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
                        duration: totalWorkMinutes,
                        status: RequestStatus.PENDING,
                        employee: { id: attendance.employee.id },
                    });
                }
                
                // Save the updated attendance record
                await this.save(attendance);
    
            } catch (error: any) {
                this.logger.error(`Error processing rest day for attendance ${attendance.id}: ${error.message}`, error.stack);
            }
        }
    }

    async handleAbsentEmployees(date: Date) {
        // Find all schedules for the given date that should have attendance
        const schedules = await this.schedulesService.getRepository().find({
            where: { 
                date,
                restDay: false,
            },
            relations: { employee: { user: true }, attendance: true }
        });
    
        // Filter schedules to find employees without attendance records
        // and exclude schedules on holidays
        const absentSchedules = schedules.filter(schedule => 
            !schedule.attendance);
        
        // Process each absent employee
        for (const schedule of absentSchedules) {
            try
            {
                // Create new attendance record with absent status
                const attendance = new Attendance({});
                attendance.employee = schedule.employee;
                attendance.schedule = schedule;
                attendance.statuses = [AttendanceStatus.ABSENT];
                
                const savedAttendance = await this.attendancesRepository.save(attendance);
        
                // Create work time request for the absence
                const workTimeRequest = new WorkTimeRequest({});
                workTimeRequest.employee = schedule.employee;
                workTimeRequest.attendance = savedAttendance;
                workTimeRequest.type = AttendanceStatus.ABSENT;
                workTimeRequest.status = RequestStatus.PENDING;
                
                await this.workTimeRequestsService.save(workTimeRequest);
        
                // Notify the employee about their recorded absence
                await this.notificationsService.create({
                    user: { id: schedule.employee.user.id },
                    title: 'Absence Recorded',
                    message: `You were marked absent for ${format(date, 'MMMM dd, yyyy')}`,
                    type: NotificationType.INFO
                });
            } catch (error: any) {
                this.logger.error(`Error processing absence for employee ${schedule.employee.id}: ${error.message}`, error.stack);
            }
        }
    }
}