import { Day } from "../enums/day.enum";

export const DayUtils = {
    isWeekend: (day: Day): boolean => {
        return day === Day.SATURDAY || day === Day.SUNDAY;
    },
    
    fromDate: (date: Date): Day => {
        const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
        return dayName.toUpperCase() as Day;
    }
};