import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Payroll } from '../../entities/payroll.entity';
import { PayrollItemType } from '../../payroll-item-types/entities/payroll-item-type.entity';

@Entity('payroll-items')
export class PayrollItem extends BaseEntity<PayrollItem> {
    @ManyToOne(() => PayrollItemType, (payrollItemType: PayrollItemType) => payrollItemType.payrollItems)
    @JoinColumn({ name: 'payrollItemTypeId' })
    payrollItemType!: PayrollItemType;

    @ManyToOne(() => Payroll, (payroll: Payroll) => payroll.payrollItems, { nullable: true })
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
        nullable: true
    })
    employerAmount?: number;
}