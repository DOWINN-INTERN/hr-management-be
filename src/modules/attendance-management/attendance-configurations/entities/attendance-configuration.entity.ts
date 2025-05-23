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

    @Column({ default: false, comment: 'Consider early time as over time' })
    considerEarlyTimeAsOvertime!: boolean;
    
    @Column({ default: true, comment: 'Apply deduction for missing time in' })
    noTimeInDeduction!: boolean;
    
    @Column({ default: true, comment: 'Apply deduction for missing time out' })
    noTimeOutDeduction!: boolean;
    
    @Column({ default: 60, comment: 'Minutes to deduct for missing time in' })
    noTimeInDeductionMinutes!: number;
    
    @Column({ default: 60, comment: 'Minutes to deduct for missing time out' })
    noTimeOutDeductionMinutes!: number;
}