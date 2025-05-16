import { BaseEntity } from '@/database/entities/base.entity';
import { User } from '@/modules/account-management/users/entities/user.entity';
import { EmployeePayrollItemType } from '@/modules/employee-management/employee-payroll-item-types/entities/employee-payroll-item-type.entity';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Payroll } from '../../entities/payroll.entity';
import { PayrollItemType } from '../../payroll-item-types/entities/payroll-item-type.entity';
import { CalculationDetails } from '../../types/calculation-details.type';

@Entity('payroll-items')
export class PayrollItem extends BaseEntity<PayrollItem> {
    @ManyToOne(() => PayrollItemType, (payrollItemType: PayrollItemType) => payrollItemType.payrollItems)
    @JoinColumn({ name: 'payrollItemTypeId' })
    payrollItemType!: PayrollItemType;

    @ManyToOne(() => EmployeePayrollItemType, (employeePayrollItemType: EmployeePayrollItemType) => employeePayrollItemType.payrollItems)
    @JoinColumn({ name: 'employeePayrollItemTypeId' })
    employeePayrollItemType!: EmployeePayrollItemType;

    @ManyToOne(() => Payroll, (payroll: Payroll) => payroll.payrollItems, { nullable: true })
    @JoinColumn({ name: 'payrollId' })
    @Exclude({ toPlainOnly: true }) 
    payroll?: Payroll;

    @Column('decimal', { 
        precision: 15, 
        scale: 2,
        default: 0
    })
    amount!: number;
    
    @Column('decimal', { 
        precision: 15, 
        scale: 2,
        nullable: true
    })
    employerAmount?: number;

    @Column('json', { nullable: true })
    calculationDetails?: CalculationDetails;

    @Column('decimal', {
        precision: 10, 
        scale: 2,
        nullable: true
    })
    taxableAmount?: number;

    // Payment tracking fields
    @Column({ nullable: true })
    paymentStatus?: string;
    
    @Column({ nullable: true })
    paymentDate?: Date;
    
    @Column({ nullable: true })
    paymentReferenceNumber?: string;
    
    @Column({ nullable: true })
    paymentMethod?: string;
    
    @Column({ nullable: true })
    batchNumber?: string;
    
    @Column({ nullable: true })
    dueDate?: Date;
    
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'processedById' })
    processedBy?: User;
    
    @Column({ nullable: true })
    processedAt?: Date;
    
    @Column('json', { nullable: true })
    processingDetails?: Record<string, any>;
    
    @Column('text', { nullable: true })
    processingNotes?: string;
    
    // For tracking remittance to government agencies
    @Column({ nullable: true })
    remittanceId?: string;
    
    @Column({ nullable: true })
    remittanceDate?: Date;
    
    // Whether this item is included in a specific report
    @Column({ default: false })
    isIncludedInReport!: boolean;
    
    @Column({ nullable: true })
    reportId?: string;

    getCalculationType(): string | undefined {
        return this.calculationDetails?.calculationType;
    }
    
    getEmployeeContribution(): number {
        if (
        this.calculationDetails && 
            'employeeContribution' in this.calculationDetails
        ) {
            return this.calculationDetails.employeeContribution;
        }
        return this.amount;
    }
    
    getEmployerContribution(): number {
        if (
        this.calculationDetails && 
            'employerContribution' in this.calculationDetails
        ) {
            return this.calculationDetails.employerContribution;
        }
        return this.employerAmount || 0;
    }

}