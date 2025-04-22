import { HolidayType } from '@/common/enums/holiday-type.enum';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DayType, FinalWorkHour } from './entities/final-work-hour.entity';

interface WorkHoursBreakdown {
    // Regular hours categories
    regularDayHours: number;
    restDayHours: number;
    specialHolidayHours: number;
    regularHolidayHours: number;

    // Overtime categories
    overtimeRegularDayHours: number;
    overtimeRestDayHours: number;
    overtimeSpecialHolidayHours: number; 
    overtimeRegularHolidayHours: number;

    // Night differential hours
    nightDifferentialHours: number;

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
        protected readonly usersService: UsersService
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
            
            overtimeRegularDayHours: 0,
            overtimeRestDayHours: 0,
            overtimeSpecialHolidayHours: 0,
            overtimeRegularHolidayHours: 0,
            
            nightDifferentialHours: 0,
            
            dayType: DayType.REGULAR_DAY,
            
            totalRegularHours: 0,
            totalOvertimeHours: 0,
            totalHours: 0
        };
        
        // Extract schedule information
        const { schedule } = finalWorkHour.attendance;
        const isRestDay = schedule.restDay === true;
        const holidayType = schedule.holiday?.type;
        
        // Calculate regular and overtime hours
        const regularHours = this.calculateHours(finalWorkHour.timeIn, finalWorkHour.timeOut);
        const overtimeHours = finalWorkHour.overTimeOut ? 
            this.calculateHours(finalWorkHour.timeOut, finalWorkHour.overTimeOut) : 0;
        
        // Calculate night differential hours
        const nightDiffHours = this.calculateNightDifferentialHours(
            finalWorkHour.timeIn, 
            finalWorkHour.timeOut,
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
        result.nightDifferentialHours = nightDiffHours;
        
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
     */
    private calculateNightDifferentialHours(
        timeIn: Date,
        timeOut: Date,
        overTimeOut?: Date
    ): number {
        const NIGHT_DIFF_START_HOUR = 22; // 10:00 PM
        const NIGHT_DIFF_END_HOUR = 6;    // 6:00 AM
        
        let nightDiffHours = 0;
        const timeInLocal = new Date(timeIn);
        const timeOutLocal = new Date(timeOut);
        const overTimeOutLocal = overTimeOut ? new Date(overTimeOut) : null;
        const finalTimeOut = overTimeOutLocal || timeOutLocal;
        
        // Check each hour between timeIn and finalTimeOut
        let currentHour = new Date(timeInLocal);
        
        while (currentHour < finalTimeOut) {
            const nextHour = new Date(currentHour);
            nextHour.setHours(nextHour.getHours() + 1);
            
            const hourEnd = new Date(Math.min(nextHour.getTime(), finalTimeOut.getTime()));
            const hourDiff = this.calculateHours(currentHour, hourEnd);
            
            // Check if this hour falls within night differential period
            const hour = currentHour.getHours();
            if (hour >= NIGHT_DIFF_START_HOUR || hour < NIGHT_DIFF_END_HOUR) {
                nightDiffHours += hourDiff;
            }
            
            currentHour = nextHour;
        }
        
        return Math.round(nightDiffHours * 100) / 100; // Round to 2 decimal places
    }
    
    /**
     * Calculate hours between two time points
     */
    private calculateHours(start: Date, end: Date): number {
        const diffMs = end.getTime() - start.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
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
            
            totalRegularHours: breakdown.totalRegularHours,
            totalOvertimeHours: breakdown.totalOvertimeHours,
            totalHours: breakdown.totalHours,
        }, createdBy);
    }
}