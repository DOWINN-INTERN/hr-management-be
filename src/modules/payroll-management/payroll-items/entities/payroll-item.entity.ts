import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PayrollItemType } from '../../payroll-item-types/entities/payroll-item-type.entity';

@Entity('payroll-items')
export class PayrollItem extends BaseEntity<PayrollItem> {
    @ManyToOne(() => Employee, (employee: Employee) => employee.payrollItems)
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @ManyToOne(() => PayrollItemType, (payrollItemType: PayrollItemType) => payrollItemType.payrollItems)
    @JoinColumn({ name: 'payrollItemTypeId' })
    payrollItemType!: PayrollItemType;

    @Column('decimal', { 
        precision: 10, 
        scale: 2
    })
    amount!: number;

    @Column('json', { nullable: true })
    parameters?: Record<string, number>;

    @Column()
    occurrence!: string;

    @Column({ default: true })
    isActive: boolean = true;
}