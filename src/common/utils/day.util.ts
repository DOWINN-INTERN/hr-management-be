import { LogLevel } from "@nestjs/common";
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

export const getLogLevels = (isDevelopment: boolean): LogLevel[] => {
  if (isDevelopment) {
    return ['log', 'error', 'warn', 'debug', 'verbose'];
  }
  return ['log', 'error', 'warn'];
};