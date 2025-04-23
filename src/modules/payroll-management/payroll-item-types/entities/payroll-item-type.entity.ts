import { PayrollItemCategory } from '@/common/enums/payroll-item-category.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { PayrollItem } from '../../payroll-items/entities/payroll-item.entity';

@Entity('payroll-item-types')
export class PayrollItemType extends BaseEntity<PayrollItemType> {
    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({
        type: 'enum',
        enum: PayrollItemCategory,
    })
    category!: PayrollItemCategory;

    @Column()
    defaultOccurrence!: string;

    @Column()
    unit!: string;

    @Column('text')
    computationFormula!: string;

    @Column('decimal', { 
        precision: 10, 
        scale: 2, 
        nullable: true 
    })
    defaultAmount?: number | null;

    @Column({ default: true })
    isActive: boolean = true;
    
    // New fields for dynamic configuration
    @Column({ default: false })
    isSystemGenerated!: boolean;
    
    @Column({ default: false })
    isGovernmentMandated!: boolean;
    
    @Column({ nullable: true })
    governmentContributionType?: string; // SSS, PHILHEALTH, PAGIBIG, TAX, etc.
    
    @Column({ default: false })
    hasEmployerShare!: boolean;
    
    @Column('text', { nullable: true })
    employerFormulaPercentage?: string;
    
    @Column({ default: false })
    isPartOfTaxCalculation!: boolean;
    
    @Column({ default: true })
    isTaxable!: boolean;
    
    @Column({ default: false })
    isTaxDeductible!: boolean;
    
    @Column({ default: true })
    isDisplayedInPayslip!: boolean;
    
    @Column('simple-array', { nullable: true })
    applicableTo?: string[];
    
    @Column({ default: true })
    isRequired!: boolean;
    
    @Column({ nullable: true })
    effectiveFrom?: Date;
    
    @Column({ nullable: true })
    effectiveTo?: Date;
    
    @Column('json', { nullable: true })
    calculationParameters?: Record<string, any>;
    
    @Column('json', { nullable: true })
    validationRules?: {
        minAmount?: number;
        maxAmount?: number;
        minSalary?: number;
        maxSalary?: number;
    };

    @OneToMany(() => PayrollItem, (payrollItem: PayrollItem) => payrollItem.payrollItemType)
    payrollItems?: PayrollItem[];
}