import { BaseEntity } from '@/database/entities/base.entity';
import { Organization } from '@/modules/organization-management/entities/organization.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity('attendance-configurations')
export class AttendanceConfiguration extends BaseEntity<AttendanceConfiguration> {
    @OneToOne(() => Organization, (organization: Organization) => organization.attendanceConfiguration, { eager: true, nullable: true })
    @JoinColumn({ name: 'organizationId' })
    organization?: Organization;

    @Column({ default: false, comment: 'Allow early check-ins' })
    allowEarlyTime!: boolean;

    @Column({ default: false, comment: 'Allow late check-ins' })
    allowLate!: boolean;
    
    @Column({ default: false, comment: 'Allow early check-outs' })
    allowUnderTime!: boolean;
    
    @Column({ default: true, comment: 'Allow overtime check-outs' })
    allowOvertime!: boolean;

    @Column({ default: 15, comment: 'Minutes before which check-in is considered early' })
    earlyTimeThresholdMinutes!: number;
    
    @Column({ default: 5, comment: 'Minutes after which an attendance is considered late' })
    gracePeriodMinutes!: number;
    
    @Column({ default: 0, comment: 'Minutes before which check-out is considered under time' })
    underTimeThresholdMinutes!: number;

    @Column({ default: 30, comment: 'Minutes after which check-out is considered overtime' })
    overtimeThresholdMinutes!: number;

    @Column({ default: false, comment: 'Round down early time to nearest specified minutes' })
    roundDownEarlyTime!: boolean;

    @Column({ default: 30, comment: 'Minutes to round down early time to' })
    roundDownEarlyTimeMinutes!: number;

    @Column({ default: false, comment: 'Round up late time to nearest specified minutes' })
    roundUpLate!: boolean;
    
    @Column({ default: 30, comment: 'Minutes to round up late time to' })
    roundUpLateMinutes!: number;
    
    @Column({ default: false, comment: 'Round down under time to nearest specified minutes' })
    roundDownUnderTime!: boolean;

    @Column({ default: 30, comment: 'Minutes to round down under time to' })
    roundDownUnderTimeMinutes!: number;
    
    @Column({ default: false, comment: 'Round up overtime to nearest specified minutes' })
    roundUpOvertime!: boolean;
    
    @Column({ default: 30, comment: 'Minutes to round up overtime to' })
    roundUpOvertimeMinutes!: number;

    @Column({ default: true, comment: 'Apply deduction for missing time in' })
    noTimeInDeduction!: boolean;
    
    @Column({ default: true, comment: 'Apply deduction for missing time out' })
    noTimeOutDeduction!: boolean;
    
    @Column({ default: 60, comment: 'Minutes to deduct for missing time in' })
    noTimeInDeductionMinutes!: number;
    
    @Column({ default: 60, comment: 'Minutes to deduct for missing time out' })
    noTimeOutDeductionMinutes!: number;
}

//  if (!isViolationAllowed) {
//       // Calculate minutes difference
//       const minutesDiff = type === AttendanceStatus.LATE 
//         ? differenceInMinutes(actualTime, expectedTime)
//         : differenceInMinutes(expectedTime, actualTime);

//       // Check if minutes difference exceeds threshold
//       const thresholdMinutes = type === AttendanceStatus.LATE 
//         ? config.gracePeriodMinutes 
//         : config.underTimeThresholdMinutes;
        
//       if (minutesDiff > thresholdMinutes) {
//         // Mark attendance with violation status
//         if (!attendanceStatuses.includes(type)) {
//           attendanceStatuses.push(type);
//         }
        
//         this.logger.log(`Employee ${employee.user.email} ${type === AttendanceStatus.LATE ? 'is late' : 'is leaving early'} by ${minutesDiff} minutes`);
        
//         let roundedMinutes = minutesDiff;
        
//         const roundingConfig = type === AttendanceStatus.LATE
//           ? { round: config.roundUpLate, roundMinutes: config.roundUpLateMinutes }
//           : { round: config.roundDownUnderTime, roundMinutes: config.roundDownUnderTimeMinutes };

//         // Handle rounding based on configuration
//         if (roundingConfig.round) {
//           // Round up or down based on configuration
//           this.logger.log(`Rounding ${type === AttendanceStatus.LATE ? 'late time' : 'undertime'} based on configuration`);
//           roundedMinutes = type === AttendanceStatus.LATE 
//             ? Math.ceil(minutesDiff / roundingConfig.roundMinutes) * roundingConfig.roundMinutes
//             : Math.floor(minutesDiff / roundingConfig.roundMinutes) * roundingConfig.roundMinutes;
//           // Log rounded minutes
//           this.logger.log(`Rounded ${type === AttendanceStatus.LATE ? 'late time' : 'undertime'} to ${roundedMinutes} minutes`);
//         }
        
//         // Create work time request
//         await this.createWorkTimeRequest(dayType, employee.id, type, existingAttendance, roundedMinutes);
        
//         // Notify employee
//         const notificationTitle = type === AttendanceStatus.LATE ? 'Late Check-in' : 'Under Time Alert';
//         const notificationMessage = type === AttendanceStatus.LATE 
//           ? `You are late by ${minutesDiff} minutes on ${punchDate} at ${punchTimeStr}.${config.roundUpLate ? ` This was rounded up to ${roundedMinutes} minutes.` : ''}`
//           : `You are leaving early by ${minutesDiff} minutes on ${punchDate} at ${punchTimeStr}.${config.roundDownUnderTime ? ` This was rounded down to ${roundedMinutes} minutes.` : ''}`;
        
//         await this.notificationsService.create({
//           title: notificationTitle,
//           message: notificationMessage,
//           type: NotificationType.WARNING,
//           category: 'ATTENDANCE',
//           user: { id: employee.user.id },
//         });
//       } else {
//         this.logger.log(`Minutes ${type === AttendanceStatus.LATE ? 'late' : 'early'} is not considered as ${type.toLowerCase()}`);
//       }
//     } else {
//       this.logger.log(`Organization allows ${type.toLowerCase()}`);
//     }