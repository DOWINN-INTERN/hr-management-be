import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { HolidayType } from '@/common/enums/holiday-type.enum';
import { ATTENDANCE_EVENTS, RecalculateFinalWorkHoursEvent } from '@/common/events/attendance.event';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { CutoffsService } from '@/modules/payroll-management/cutoffs/cutoffs.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { Repository } from 'typeorm';
import { DayType, FinalWorkHour } from './entities/final-work-hour.entity';

interface WorkHoursBreakdown {
    // Regular hours categories
    regularDayHours: number;
    restDayHours: number;
    specialHolidayHours: number;
    regularHolidayHours: number;

    absentHours: number;
    tardinessHours: number;
    undertimeHours: number;

    // Overtime categories
    overtimeRegularDayHours: number;
    overtimeRestDayHours: number;
    overtimeSpecialHolidayHours: number; 
    overtimeRegularHolidayHours: number;

    // Night differential hours
    nightDifferentialHours: number;

    overtimeNightDifferentialHours: number;

    // Day type for reference only
    dayType: DayType;

    // Totals
    totalRegularHours: number;
    totalOvertimeHours: number;
    totalHours: number;
}

@Injectable()
export class FinalWorkHoursService extends BaseService<FinalWorkHour> {
    constructor(
        @InjectRepository(FinalWorkHour)
        private readonly finalWorkHoursRepository: Repository<FinalWorkHour>,
        protected readonly usersService: UsersService,
        private readonly eventEmitter: EventEmitter2,
        private readonly cutoffsService: CutoffsService,
    ) {
        super(finalWorkHoursRepository, usersService);
    }

    /**
     * Calculates and categorizes work hours based on day type
     * No pay calculations included - strictly time tracking
     */
    calculateWorkHoursBreakdown(finalWorkHour: FinalWorkHour): WorkHoursBreakdown {
        const result: WorkHoursBreakdown = {
            regularDayHours: 0,
            restDayHours: 0,
            specialHolidayHours: 0,
            regularHolidayHours: 0,
            absentHours: 0,
            tardinessHours: 0,
            undertimeHours: 0,
            
            overtimeRegularDayHours: 0,
            overtimeRestDayHours: 0,
            overtimeSpecialHolidayHours: 0,
            overtimeRegularHolidayHours: 0,
            
            nightDifferentialHours: 0,
            overtimeNightDifferentialHours: 0,
            
            dayType: DayType.REGULAR_DAY,
            
            totalRegularHours: 0,
            totalOvertimeHours: 0,
            totalHours: 0
        };
        
        // Extract schedule information
        const { schedule } = finalWorkHour.attendance;
        const isRestDay = schedule.restDay === true;
        const holidayType = schedule.holiday?.type;

        const formattedAttendanceDate = format(schedule.date, 'yyyy-MM-dd');
        
        // Calculate total undertime minutes
        const scheduleEndTime = new Date(`${formattedAttendanceDate}T${schedule.endTime}`);
        const scheduleStartTime = new Date(`${formattedAttendanceDate}T${schedule.startTime}`);

        // Convert hours to milliseconds (1 hour = 3600000 milliseconds)
        const noTimeInMilliseconds = finalWorkHour.noTimeInHours * 3600000;
        const noTimeOutMilliseconds = finalWorkHour.noTimeOutHours * 3600000;

        // Properly calculate timeIn and timeOut with Date objects
        const timeIn = finalWorkHour.timeIn || 
            new Date(scheduleStartTime.getTime() + noTimeInMilliseconds);
        const timeOut = finalWorkHour.timeOut || 
            new Date(scheduleEndTime.getTime() - noTimeOutMilliseconds);

        const { statuses } = finalWorkHour.attendance;
        const isLate = statuses?.includes(AttendanceStatus.LATE);
        const isUndertime = statuses?.includes(AttendanceStatus.UNDER_TIME);
        const isAbsent = statuses?.includes(AttendanceStatus.ABSENT);


        if (isAbsent) 
        {
            // If absent, set all hours to 0
            result.absentHours = this.calculateHours(timeIn, timeOut, schedule.breakTime);
            return result;
        }
        
        // Calculate regular and overtime hours
        const regularHours = this.calculateHours(timeIn, timeOut, schedule.breakTime);
        const overtimeHours = finalWorkHour.overTimeOut ? 
            this.calculateHours(timeOut, finalWorkHour.overTimeOut) : 0;

        result.tardinessHours = isLate ? this.calculateHours(scheduleStartTime, timeIn) : 0;
        result.undertimeHours = isUndertime ? this.calculateHours(timeOut, scheduleEndTime) : 0;

        // Calculate night differential hours
        const nightDiffHours = this.calculateNightDifferentialHours(
            timeIn, 
            timeOut,
            finalWorkHour.overTimeOut
        );
        
        // Categorize hours based on day type
        if (isRestDay && holidayType === HolidayType.REGULAR) {
            result.dayType = DayType.REGULAR_HOLIDAY_REST_DAY;
            result.regularHolidayHours = regularHours;
            result.overtimeRegularHolidayHours = overtimeHours;
        } 
        else if (isRestDay && (holidayType === HolidayType.SPECIAL_NON_WORKING)) {
            result.dayType = DayType.SPECIAL_HOLIDAY_REST_DAY;
            result.specialHolidayHours = regularHours;
            result.overtimeSpecialHolidayHours = overtimeHours;
        }
        else if (isRestDay) {
            result.dayType = DayType.REST_DAY;
            result.restDayHours = regularHours;
            result.overtimeRestDayHours = overtimeHours;
        }
        else if (holidayType === HolidayType.REGULAR) {
            result.dayType = DayType.REGULAR_HOLIDAY;
            result.regularHolidayHours = regularHours;
            result.overtimeRegularHolidayHours = overtimeHours;
        }
        else if (holidayType === HolidayType.SPECIAL_NON_WORKING || holidayType === HolidayType.SPECIAL_WORKING) {
            result.dayType = DayType.SPECIAL_HOLIDAY;
            result.specialHolidayHours = regularHours;
            result.overtimeSpecialHolidayHours = overtimeHours;
        }
        else {
            result.dayType = DayType.REGULAR_DAY;
            result.regularDayHours = regularHours;
            result.overtimeRegularDayHours = overtimeHours;
        }
        
        // Store night differential hours
        result.nightDifferentialHours = nightDiffHours.regular;
        result.overtimeNightDifferentialHours = nightDiffHours.overtime;
        
        // Calculate totals
        result.totalRegularHours = result.regularDayHours + 
            result.restDayHours + 
            result.specialHolidayHours + 
            result.regularHolidayHours;
            
        result.totalOvertimeHours = result.overtimeRegularDayHours + 
            result.overtimeRestDayHours + 
            result.overtimeSpecialHolidayHours + 
            result.overtimeRegularHolidayHours;
            
        result.totalHours = result.totalRegularHours + result.totalOvertimeHours;
        
        return result;
    }
    
    /**
     * Calculate night differential hours worked
     * @returns Object containing regular and overtime night differential hours
     */
    private calculateNightDifferentialHours(
        timeIn: Date,
        timeOut: Date,
        overTimeOut?: Date
    ): { regular: number, overtime: number } {
        const NIGHT_DIFF_START_HOUR = 22; // 10:00 PM
        const NIGHT_DIFF_END_HOUR = 6;    // 6:00 AM
        
        let regularNightDiffHours = 0;
        let overtimeNightDiffHours = 0;
        
        const timeInLocal = new Date(timeIn);
        const timeOutLocal = new Date(timeOut);
        const overTimeOutLocal = overTimeOut ? new Date(overTimeOut) : null;
        
        // Calculate regular night differential hours (between timeIn and timeOut)
        let currentHour = new Date(timeInLocal);
        while (currentHour < timeOutLocal) {
            const nextHour = new Date(currentHour);
            nextHour.setHours(nextHour.getHours() + 1);
            
            const hourEnd = new Date(Math.min(nextHour.getTime(), timeOutLocal.getTime()));
            const hourDiff = this.calculateHours(currentHour, hourEnd, 6);
            
            const hour = currentHour.getHours();
            if (hour >= NIGHT_DIFF_START_HOUR || hour < NIGHT_DIFF_END_HOUR) {
                regularNightDiffHours += hourDiff;
            }
            
            currentHour = nextHour;
        }
        
        // Calculate overtime night differential hours (between timeOut and overTimeOut)
        if (overTimeOutLocal) {
            currentHour = new Date(timeOutLocal);
            while (currentHour < overTimeOutLocal) {
                const nextHour = new Date(currentHour);
                nextHour.setHours(nextHour.getHours() + 1);
                
                const hourEnd = new Date(Math.min(nextHour.getTime(), overTimeOutLocal.getTime()));
                const hourDiff = this.calculateHours(currentHour, hourEnd, 6);
                
                const hour = currentHour.getHours();
                if (hour >= NIGHT_DIFF_START_HOUR || hour < NIGHT_DIFF_END_HOUR) {
                    overtimeNightDiffHours += hourDiff;
                }
                
                currentHour = nextHour;
            }
        }
        
        // Round to 2 decimal places
        return {
            regular: Math.round(regularNightDiffHours * 100) / 100,
            overtime: Math.round(overtimeNightDiffHours * 100) / 100
        };
    }
    
    /**
     * Calculate hours between two time points, subtracting break time
     * @param start Start date and time
     * @param end End date and time
     * @param breakTimeDuration Break time in minutes
     * @returns Number of hours worked, rounded to 2 decimal places
     */
    private calculateHours(start: Date, end: Date, breakTimeDuration: number = 0): number {
        // Calculate the time difference in milliseconds
        const diffMs = end.getTime() - start.getTime();
        
        // Convert to hours
        const diffHours = diffMs / (1000 * 60 * 60);
        
        // Convert break time from minutes to hours and subtract
        const breakTimeHours = breakTimeDuration / 60;
        const totalHours = diffHours - breakTimeHours;
        
        // Round to 2 decimal places
        return Math.round(totalHours * 100) / 100;
    }

    async recalculateByCutoffId(cutoffId: string, updatedBy: string) {
        // Check if cutoff exists
        const cutoff = await this.cutoffsService.findOneByOrFail({ id: cutoffId }, { relations: { attendances: true } });

        // get all processed attendances
        const processedAttendances = cutoff.attendances?.filter(attendance => {
            return attendance.isProcessed;
        });

        if (!processedAttendances || processedAttendances.length === 0) {
            throw new NotFoundException(`No processed attendances found for cutoff ID: ${cutoffId}`);
        }

        // emit event to recalculate final work hours
        this.eventEmitter.emit(ATTENDANCE_EVENTS.RECALCULATE_FINAL_WORK_HOURS, new RecalculateFinalWorkHoursEvent(cutoffId, updatedBy));        
    }
    
    /**
     * Updates a FinalWorkHour entity with calculated hours breakdown
     */
    async updateWorkHoursBreakdown(finalWorkHourId: string, createdBy?: string): Promise<FinalWorkHour> {
        const finalWorkHour = await this.findOneByOrFail(
            { id: finalWorkHourId },
            { relations: { attendance: { schedule: { holiday: true } } } }
        );
        
        const breakdown = this.calculateWorkHoursBreakdown(finalWorkHour);

        // log
        this.logger.log(`Updating final work hour ${finalWorkHourId}`);
        
        // Update the record with calculated hours
        return this.update(finalWorkHourId, {
            regularDayHours: breakdown.regularDayHours,
            restDayHours: breakdown.restDayHours,
            specialHolidayHours: breakdown.specialHolidayHours,
            regularHolidayHours: breakdown.regularHolidayHours,
            
            overtimeRegularDayHours: breakdown.overtimeRegularDayHours,
            overtimeRestDayHours: breakdown.overtimeRestDayHours,
            overtimeSpecialHolidayHours: breakdown.overtimeSpecialHolidayHours,
            overtimeRegularHolidayHours: breakdown.overtimeRegularHolidayHours,
            
            nightDifferentialHours: breakdown.nightDifferentialHours,
            
            dayType: breakdown.dayType,

            absentHours: breakdown.absentHours,
            tardinessHours: breakdown.tardinessHours,
            undertimeHours: breakdown.undertimeHours,
            
            totalRegularHours: breakdown.totalRegularHours,
            totalOvertimeHours: breakdown.totalOvertimeHours,
            totalHours: breakdown.totalHours,
        }, createdBy);
    }
}