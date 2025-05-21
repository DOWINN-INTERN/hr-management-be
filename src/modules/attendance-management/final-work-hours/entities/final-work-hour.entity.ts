import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Cutoff } from '@/modules/payroll-management/cutoffs/entities/cutoff.entity';
import { AfterLoad, Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Attendance } from '../../entities/attendance.entity';

// Define day type enum for better type safety
export enum DayType {
    REGULAR_DAY = 'REGULAR_DAY',
    REST_DAY = 'REST_DAY',
    SPECIAL_HOLIDAY = 'SPECIAL_HOLIDAY',
    REGULAR_HOLIDAY = 'REGULAR_HOLIDAY',
    SPECIAL_HOLIDAY_REST_DAY = 'SPECIAL_HOLIDAY_REST_DAY',
    REGULAR_HOLIDAY_REST_DAY = 'REGULAR_HOLIDAY_REST_DAY'
}

@Entity('final-work-hours')
export class FinalWorkHour extends BaseEntity<FinalWorkHour> {
    @ManyToOne(() => Employee, (employee: Employee) => employee.finalWorkHours)
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @OneToOne(() => Attendance, (attendance: Attendance) => attendance.finalWorkHour)
    @JoinColumn({ name: 'attendanceId' })
    attendance!: Attendance;

    @ManyToOne(() => Cutoff, (cutoff: Cutoff) => cutoff.finalWorkHours)
    @JoinColumn({ name: 'cutoffId' })
    cutoff!: Cutoff;

    @Column({ type: 'timestamp', nullable: true })
    timeIn?: Date;

    @Column({ type: 'timestamp', nullable: true })
    timeOut?: Date;

    @Column({ type: 'timestamp', nullable: true })
    overTimeOut?: Date;

    // Deduction hours
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    noTimeInHours!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    noTimeOutHours!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    absentHours!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    tardinessHours!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    undertimeHours!: number;
    
    // Basic hour categories - strictly tracking hours, no pay calculations
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    regularDayHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    restDayHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    specialHolidayHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    regularHolidayHours!: number;
    
    // Overtime categories
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    overtimeRegularDayHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    overtimeRestDayHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    overtimeSpecialHolidayHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    overtimeRegularHolidayHours!: number;
    
    // Night differential
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    nightDifferentialHours!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    overtimeNightDifferentialHours!: number;
    
    @Column({ 
        type: 'enum', 
        enum: DayType,
        default: DayType.REGULAR_DAY
    })
    dayType!: DayType;
    
    // Total fields that will be calculated by the service
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalRegularHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalOvertimeHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalHours!: number;
    
    @Column({ default: false })
    isApproved!: boolean;

    @Column({ nullable: true })
    approvedBy?: string;

    @Column('timestamp', { nullable: true })
    approvedAt?: Date;

    @Column()
    batchId!: string;

    @Column({ nullable: true })
    payrollBatchId?: string;

    @Column({ default: true })
    isProcessed!: boolean;

    @Column({ nullable: true })
    processedBy?: string;

    @Column('timestamp', { nullable: true })
    processedAt?: Date;
    
    @Column({ type: 'date' })
    workDate!: Date;
    
    @Column({ nullable: true })
    notes?: string;
    
    // Calculate derived values after loading from database
    @AfterLoad()
    calculateDerivedFields() {
        // Calculate totals if not already set
        if (this.totalRegularHours === 0) {
            this.totalRegularHours = +this.regularDayHours + +this.restDayHours + 
                                    +this.specialHolidayHours + +this.regularHolidayHours;
        }
        
        if (this.totalOvertimeHours === 0) {
            this.totalOvertimeHours = +this.overtimeRegularDayHours + +this.overtimeRestDayHours + 
                                     +this.overtimeSpecialHolidayHours + +this.overtimeRegularHolidayHours;
        }
        
        if (this.totalHours === 0) {
            this.totalHours = +this.totalRegularHours + +this.totalOvertimeHours;
        }
    }
}