// import { Injectable } from '@nestjs/common';
// import { format, toZonedTime, zonedTimeToUtc } from 'date-fns-tz';

// @Injectable()
// export class TimezoneService {
//   /**
//    * Convert a UTC date to a client's timezone
//    */
//   toClientTime(date: Date, timezone: string = 'UTC'): Date {
//     return utcToZonedTime(date, timezone);
//   }

//   /**
//    * Convert a date from client timezone to UTC
//    */
//   toUTC(date: Date, timezone: string = 'UTC'): Date {
//     return zonedTimeToUtc(date, timezone);
//   }

//   /**
//    * Format a date in client's timezone
//    */
//   formatInTimezone(date: Date, format: string, timezone: string = 'UTC'): string {
//     const zonedDate = utcToZonedTime(date, timezone);
//     return format(zonedDate, format, { timeZone: timezone });
//   }
// }