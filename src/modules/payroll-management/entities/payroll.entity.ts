import { PayrollStatus } from '@/common/enums/payroll-status.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { AfterLoad, Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
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
    
    // Summary of work hours
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalRegularHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalOvertimeHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalHolidayHours!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalHolidayOvertimeHours!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalSpecialHolidayHours!: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalSpecialHolidayOvertimeHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalRestDayHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalRestDayOvertimeHours!: number;
    
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    totalNightDifferentialHours!: number;
    
    // Core earnings
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
    
    // Summary calculations
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    grossPay!: number;
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    taxableIncome!: number;
    
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
    
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    netPay!: number;
    
    // Accruals for future payments
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    thirteenthMonthAccrual!: number;
    
    // Status tracking
    @Column({
        type: 'enum',
        enum: PayrollStatus,
        default: PayrollStatus.DRAFT
    })
    status!: PayrollStatus;
    
    // Payment details
    @Column({ nullable: true })
    paymentMethod?: string;
    
    @Column({ nullable: true })
    bankAccount?: string;
    
    @Column({ nullable: true })
    checkNumber?: string;
    
    @Column({ nullable: true })
    bankReferenceNumber?: string;
    
    @Column({ nullable: true })
    paymentDate?: Date;
    
    // Process tracking
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
    
    // Additional info
    @Column({ nullable: true })
    notes?: string;
    
    @Column('json', { nullable: true })
    calculationDetails?: Record<string, any>;

    @AfterLoad()
    calculateTotals() {
        if (!this.payrollItems) return;

        // Reset totals
        this.totalAllowances = 0;
        this.totalBonuses = 0;
        this.totalBenefits = 0;
        this.totalDeductions = 0;
        this.totalGovernmentContributions = 0;
        this.totalTaxes = 0;

        // Calculate based on payroll items
        this.payrollItems.forEach(item => {
            const category = item.payrollItemType.category.toLowerCase();
            
            // Sum by category
            if (category.includes('allowance')) {
                this.totalAllowances += +item.amount;
            } else if (category.includes('bonus')) {
                this.totalBonuses += +item.amount;
            } else if (category.includes('benefit')) {
                this.totalBenefits += +item.amount;
            } else if (category.includes('deduction')) {
                this.totalDeductions += +item.amount;
            } else if (category.includes('government')) {
                this.totalGovernmentContributions += +item.amount;
            } else if (category.includes('tax')) {
                this.totalTaxes += +item.amount;
            }
        });
    }
    
    // Helper methods to get government contributions by type
    getContributionByType(type: string): { employee: number; employer: number; total: number } {
        const result = { employee: 0, employer: 0, total: 0 };
        
        if (!this.payrollItems) return result;
        
        this.payrollItems.forEach(item => {
            if (item.payrollItemType.governmentContributionType?.toLowerCase() === type.toLowerCase()) {
                result.employee += +item.amount;
                result.employer += +(item.employerAmount || 0);
            }
        });
        
        result.total = result.employee + result.employer;
        return result;
    }
    
    get sssContribution() {
        return this.getContributionByType('sss');
    }
    
    get philHealthContribution() {
        return this.getContributionByType('philhealth');
    }
    
    get pagIbigContribution() {
        return this.getContributionByType('pagibig');
    }
    
    get withHoldingTax() {
        return this.getContributionByType('tax').employee;
    }
}