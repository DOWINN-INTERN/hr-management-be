// import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { TimezoneService } from '../services/timezone.service';

// @Injectable()
// export class TimezoneInterceptor implements NestInterceptor {
//   constructor(private timezoneService: TimezoneService) {}

//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const request = context.switchToHttp().getRequest();
//     const timezone = request.headers['x-timezone'] || 'UTC';

//     return next.handle().pipe(
//       map(data => this.transformDates(data, timezone))
//     );
//   }

//   private transformDates(data: any, timezone: string): any {
//     if (!data) return data;
    
//     if (Array.isArray(data)) {
//       return data.map(item => this.transformDates(item, timezone));
//     }
    
//     if (typeof data === 'object' && data !== null) {
//       const transformed = { ...data };
      
//       Object.keys(transformed).forEach(key => {
//         const value = transformed[key];
        
//         if (value instanceof Date) {
//           // Convert UTC date to client timezone
//           transformed[key] = this.timezoneService.toClientTime(value, timezone);
//         } else if (typeof value === 'object' && value !== null) {
//           transformed[key] = this.transformDates(value, timezone);
//         }
//       });
      
//       return transformed;
//     }
    
//     return data;
//   }
// }