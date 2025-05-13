import { PayrollProcessingState } from '@/common/enums/payroll-processing-state.enum';
import { PayrollStatus } from '@/common/enums/payroll-status.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Cutoff } from '../cutoffs/entities/cutoff.entity';
import { PayrollItem } from '../payroll-items/entities/payroll-item.entity';

@Entity('payrolls')
export class Payroll extends BaseEntity<Payroll> {
    @ManyToOne(() => Employee, (employee: Employee) => employee.payrolls)
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @ManyToOne(() => Cutoff, (cutoff: Cutoff) => cutoff.payrolls)
    @JoinColumn({ name: 'cutoffId' })
    cutoff!: Cutoff;
    
    @OneToMany(() => PayrollItem, (payrollItem: PayrollItem) => payrollItem.payroll, { 
        cascade: true,
        eager: true
    })
    payrollItems?: PayrollItem[];
    
    // Fundamental rates
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    monthlyRate!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    dailyRate!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    hourlyRate!: number;
    
    // Deduction hours
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalNoTimeInHours!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalNoTimeOutHours!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalAbsentHours!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalTardinessHours!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalUndertimeHours!: number;
    
    // Summary of work hours
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalRegularHours!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalHolidayHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalSpecialHolidayHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalRestDayHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalOvertimeHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalHolidayOvertimeHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalSpecialHolidayOvertimeHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalRestDayOvertimeHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalNightDifferentialHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalHours!: number;
    
    // Pay components
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    basicPay!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    overtimePay!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    holidayPay!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    holidayOvertimePay!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    specialHolidayPay!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    specialHolidayOvertimePay!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    restDayPay!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    restDayOvertimePay!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    nightDifferentialPay!: number;

    // Deductions
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    absences!: number;

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    tardiness!: number;

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    undertime!: number;

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    noTimeIn!: number;

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    noTimeOut!: number;
    
    // Summarized pay components by category
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    totalAllowances!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    totalBonuses!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    totalBenefits!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    totalDeductions!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    totalGovernmentContributions!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    totalTaxes!: number;
    
    // Payment totals
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    grossPay!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    taxableIncome!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    netPay!: number;
    
    // Payment information
    @Column({ nullable: true })
    paymentMethod?: string;
    
    @Column({ nullable: true })
    bankAccount?: string;
    
    @Column({ nullable: true })
    bankReferenceNumber?: string;
    
    @Column({ nullable: true })
    checkNumber?: string;
    
    @Column({ nullable: true })
    paymentDate?: Date;
    
    // Processing metadata
    @Column({
        type: 'enum',
        enum: PayrollStatus,
        default: PayrollStatus.DRAFT
    })
    status!: PayrollStatus;
    
    // State machine status
    @Column({
        type: 'enum',
        enum: PayrollProcessingState,
        default: PayrollProcessingState.DRAFT
    })
    processingState!: PayrollProcessingState;
    
    @Column('json', { nullable: true })
    stateHistory?: Array<{
        from: PayrollProcessingState;
        to: PayrollProcessingState;
        timestamp: Date;
        note?: string;
        details?: any;
    }>;
    
    @Column({ nullable: true })
    processedAt?: Date;
    
    @Column({ nullable: true })
    processedBy?: string;
    
    @Column({ nullable: true })
    approvedAt?: Date;
    
    @Column({ nullable: true })
    approvedBy?: string;
    
    @Column({ nullable: true })
    releasedAt?: Date;
    
    @Column({ nullable: true })
    releasedBy?: string;
    
    @Column('json', { nullable: true })
    calculationDetails?: any;
    
    @Column({ nullable: true })
    notes?: string;
    
    // Virtual properties for better contribution access
    get sssContribution(): { employee: number; employer: number; total: number } {
        const sssItem = this.payrollItems?.find(item => 
            item.payrollItemType?.governmentContributionType === 'SSS'
        );
        return {
            employee: sssItem?.amount || 0,
            employer: sssItem?.employerAmount || 0,
            total: (sssItem?.amount || 0) + (sssItem?.employerAmount || 0)
        };
    }
    
    get philHealthContribution(): { employee: number; employer: number; total: number } {
        const philhealthItem = this.payrollItems?.find(item => 
            item.payrollItemType?.governmentContributionType === 'PHILHEALTH'
        );
        return {
            employee: philhealthItem?.amount || 0,
            employer: philhealthItem?.employerAmount || 0,
            total: (philhealthItem?.amount || 0) + (philhealthItem?.employerAmount || 0)
        };
    }
    
    get pagIbigContribution(): { employee: number; employer: number; total: number } {
        const pagibigItem = this.payrollItems?.find(item => 
            item.payrollItemType?.governmentContributionType === 'PAGIBIG'
        );
        return {
            employee: pagibigItem?.amount || 0,
            employer: pagibigItem?.employerAmount || 0,
            total: (pagibigItem?.amount || 0) + (pagibigItem?.employerAmount || 0)
        };
    }
    
    get withHoldingTax(): number {
        const taxItem = this.payrollItems?.find(item => 
            item.payrollItemType?.governmentContributionType === 'TAX'
        );
        return taxItem?.amount || 0;
    }
}