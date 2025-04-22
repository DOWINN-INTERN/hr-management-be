import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Payroll } from '../../entities/payroll.entity';
import { PayrollItemType } from '../../payroll-item-types/entities/payroll-item-type.entity';

@Entity('payroll-items')
export class PayrollItem extends BaseEntity<PayrollItem> {
    @ManyToOne(() => Employee, (employee: Employee) => employee.payrollItems)
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @ManyToOne(() => PayrollItemType, (payrollItemType: PayrollItemType) => payrollItemType.payrollItems)
    @JoinColumn({ name: 'payrollItemTypeId' })
    payrollItemType!: PayrollItemType;
    
    @ManyToOne(() => Payroll, (payroll: Payroll) => payroll.payrollItems)
    @JoinColumn({ name: 'payrollId' })
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
        default: 0,
        nullable: true
    })
    employerAmount?: number;

    @Column('json', { nullable: true })
    parameters?: Record<string, any>;

    @Column({
        default: 'MONTHLY',
        comment: 'How often the item is applied (ONCE, DAILY, WEEKLY, MONTHLY, etc.)'
    })
    occurrence!: string;

    @Column({ default: true })
    isActive: boolean = true;
    
    @Column({ default: true })
    isTaxable: boolean = true;
    
    @Column({ nullable: true })
    effectiveFrom?: Date;
    
    @Column({ nullable: true })
    effectiveTo?: Date;
    
    @Column({ nullable: true })
    reference?: string;
    
    @Column({ nullable: true, comment: 'For tax reporting and verification' })
    governmentReferenceNumber?: string;
    
    @Column('json', { nullable: true })
    calculationDetails?: {
        formula: string;
        inputs: Record<string, any>;
        steps?: string[];
        result: number;
    };
}