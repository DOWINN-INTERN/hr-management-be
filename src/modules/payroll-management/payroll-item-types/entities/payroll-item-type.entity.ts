import { Occurrence } from '@/common/enums/occurrence.enum';
import { GovernmentMandatedType } from '@/common/enums/payroll/government-contribution-type.enum';
import { PayrollItemCategory } from '@/common/enums/payroll/payroll-item-category.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { EmployeePayrollItemType } from '@/modules/employee-management/employee-payroll-item-types/entities/employee-payroll-item-type.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { PayrollItem } from '../../payroll-items/entities/payroll-item.entity';

// TODO: Add formula jexl logic for formula types
@Entity('payroll-item-types')
export class PayrollItemType extends BaseEntity<PayrollItemType> {
    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    imageOrIcon?: string;

    @Column({
        type: 'enum',
        enum: PayrollItemCategory,
    })
    category!: PayrollItemCategory;

    @Column({ type: 'enum', enum: Occurrence, default: Occurrence.MONTHLY })
    defaultOccurrence!: Occurrence;

    @Column()
    type!: 'fixed' | 'formula';

    @Column('decimal', { 
        precision: 10, 
        scale: 2, 
        nullable: true 
    })
    defaultAmount?: number;

    @Column({ default: true })
    isActive!: boolean;
    
    @Column({ type: 'enum', enum: GovernmentMandatedType, nullable: true })
    governmentMandatedType?: GovernmentMandatedType;
    
    @Column({ default: true })
    isRequired!: boolean;

    @Column({ nullable: true })
    group?: string;

    @Column({ default: false })
    hasAmount!: boolean;

    @Column({ default: false })
    hasPercentage!: boolean;

    @Column({ default: false })
    hasEffectivity!: boolean;

    @Column({ nullable: true })
    effectiveFrom?: Date;
    
    @Column({ nullable: true })
    effectiveTo?: Date;

    @Column('decimal', 
    { 
        precision: 10, 
        scale: 2,
        nullable: true
    })
    percentage?: number;

    @Column({ nullable: true })
    processEvery?: 1 | 2;
    
    @Column('decimal', 
    { 
        precision: 10, 
        scale: 2,
        nullable: true
    })
    employerPercentage?: number;

    @Column({ default: true })
    includeInPayrollItemsProcessing!: boolean;

    @Column({ default: false })
    includeInBaseCompensation!: boolean;
    
    @Column({ default: false })
    isTaxable!: boolean;
    
    @Column({ default: false })
    isTaxDeductible!: boolean;

    @Column('decimal', 
    { 
        precision: 10, 
        scale: 2,
        nullable: true
    })
    taxExemptionAmount?: number;

    // Calculation Params
    @Column('decimal', 
    { 
        precision: 10, 
        scale: 2,
        nullable: true
    })
    minAmount?: number;

    @Column({ default: false })
    isAddableToBaseCompensation!: boolean;

    @Column('decimal', 
    { 
        precision: 10, 
        scale: 2,
        nullable: true
    })
    maxAmount?: number;

    @Column('decimal', 
    { 
        precision: 10, 
        scale: 2,
        nullable: true
    })
    minAdditionalAmount?: number;

    @Column('decimal', 
    { 
        precision: 10, 
        scale: 2,
        nullable: true
    })
    maxAdditionalAmount?: number;

    @Column('decimal', 
    { 
        precision: 10, 
        scale: 2,
        nullable: true
    })
    minContribution?: number;

    @Column('decimal', 
    { 
        precision: 10, 
        scale: 2,
        nullable: true
    })
    maxContribution?: number;
    
    @OneToMany(() => PayrollItem, (payrollItem: PayrollItem) => payrollItem.payrollItemType, { nullable: true })
    payrollItems?: PayrollItem[];

    @OneToMany(() => EmployeePayrollItemType, (employeePayrollItemType: EmployeePayrollItemType) => employeePayrollItemType.payrollItemType, { nullable: true })
    employeePayrollItemTypes?: EmployeePayrollItemType[];
}