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

    @Column()
    computationFormula!: string;

    @Column('decimal', { 
        precision: 10, 
        scale: 2, 
        nullable: true 
    })
    defaultAmount?: number | null;

    @Column({ default: true })
    isActive: boolean = true;

    @OneToMany(() => PayrollItem, (payrollItem: PayrollItem) => payrollItem.payrollItemType)
    payrollItems?: PayrollItem[];
}