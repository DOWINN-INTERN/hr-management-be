import { GovernmentMandatedType } from '@/common/enums/payroll/government-contribution-type.enum';
import { PayrollState } from '@/common/enums/payroll/payroll-state.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Cutoff } from '../cutoffs/entities/cutoff.entity';
import { PayrollItem } from '../payroll-items/entities/payroll-item.entity';

@Entity('payrolls')
export class Payroll extends BaseEntity<Payroll> {
    @ManyToOne(() => Employee, (employee: Employee) => employee.payrolls)
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @ManyToOne(() => Cutoff, (cutoff: Cutoff) => cutoff.payrolls, { eager: true })
    @JoinColumn({ name: 'cutoffId' })
    cutoff!: Cutoff;
    
    @OneToMany(() => PayrollItem, (payrollItem: PayrollItem) => payrollItem.payroll, { 
        cascade: true,
        nullable: true
    })
    @Type(() => PayrollItem)
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
    totalNightDifferentialOvertimeHours!: number;
    
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

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    nightDifferentialOvertimePay!: number;

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

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    totalBasicDeductions!: number;

    @Column('json', { nullable: true })
    comparisonWithPreviousPayroll?: {
        previousPayrollId: string;
        netPayDifference: number;
        grossPayDifference: number;
        significantChanges: Array<{
            field: string;
            previousValue: number;
            currentValue: number;
            percentageChange: number;
        }>;
    };

    @Column({ nullable: true })
    currency?: string;

    @Column('decimal', { precision: 10, scale: 6, nullable: true })
    exchangeRate?: number;
    
    // Summarized pay components by category
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    totalAllowances!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    totalDeductions!: number;
    
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

    @Column({ nullable: true })
    batchId?: string;
    
    // State machine status
    @Column({
        type: 'enum',
        enum: PayrollState,
        default: PayrollState.DRAFT
    })
    state!: PayrollState;
    
    @Column('json', { nullable: true })
    stateHistory?: Array<{
        from: PayrollState;
        to: PayrollState;
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
    rejectedAt?: Date;

    @Column({ nullable: true })
    rejectedBy?: string;

    @Column({ nullable: true })
    rejectionReason?: string;
    
    @Column({ nullable: true })
    releasedAt?: Date;
    
    @Column({ nullable: true })
    releasedBy?: string;

    @Column({ nullable: true })
    voidedAt?: Date;

    @Column({ nullable: true })
    voidedBy?: string;
    
    @Column('json', { nullable: true })
    calculationDetails?: any;

    @Column({ default: 0})
    reprocessedCount!: number;
    
    @Column({ nullable: true })
    notes?: string;
    
    // Virtual properties for better contribution access
    get sssContribution(): { employee: number; employer: number; total: number } {
        const sssItem = this.payrollItems?.find(item => 
            item.payrollItemType?.governmentMandatedType === GovernmentMandatedType.SSS
        );

        const employee = Number(Number(sssItem?.amount || 0).toFixed(2));
        const employer = Number(Number(sssItem?.employerAmount || 0).toFixed(2));
        return {
            employee,
            employer,
            total: Number((employee + employer).toFixed(2))
        };
    }
    
    get philHealthContribution(): { employee: number; employer: number; total: number } {
        const philhealthItem = this.payrollItems?.find(item => 
            item.payrollItemType?.governmentMandatedType === GovernmentMandatedType.PHILHEALTH
        );
        const employee = Number(Number(philhealthItem?.amount || 0).toFixed(2));
        const employer = Number(Number(philhealthItem?.employerAmount || 0).toFixed(2));
        return {
            employee,
            employer,
            total: Number((employee + employer).toFixed(2))
        };
    }
    
    get pagIbigContribution(): { employee: number; employer: number; total: number } {
        const pagibigItem = this.payrollItems?.find(item => 
            item.payrollItemType?.governmentMandatedType === GovernmentMandatedType.PAGIBIG
        );
        const employee = Number(Number(pagibigItem?.amount || 0).toFixed(2));
        const employer = Number(Number(pagibigItem?.employerAmount || 0).toFixed(2));
        return {
            employee,
            employer,
            total: Number((employee + employer).toFixed(2))
        };
    }
    
    get withholdingTax(): number {
        const taxItem = this.payrollItems?.find(item => 
            item.payrollItemType?.governmentMandatedType === GovernmentMandatedType.TAX
        );
        return Number(Number(taxItem?.amount || 0).toFixed(2));
    }
}