import { BaseEntity } from '@/database/entities/base.entity';
import { PayrollItemType } from '@/modules/payroll-management/payroll-item-types/entities/payroll-item-type.entity';
import { PayrollItem } from '@/modules/payroll-management/payroll-items/entities/payroll-item.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Employee } from '../../entities/employee.entity';

@Entity('employee-payroll-item-types')
export class EmployeePayrollItemType extends BaseEntity<EmployeePayrollItemType> {
    @ManyToOne(() => Employee, (employee: Employee) => employee.payrollItemTypes, { cascade: true })
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @ManyToOne(() => PayrollItemType, (payrollItemType: PayrollItemType) => payrollItemType.employeePayrollItemTypes, { cascade: true })
    @JoinColumn({ name: 'payrollItemTypeId' })
    payrollItemType!: PayrollItemType;

    @OneToMany(() => PayrollItem, (payrollItem: PayrollItem) => payrollItem.employeePayrollItemType, { nullable: true})
    payrollItems!: PayrollItem[];

    @Column({ nullable: true })
    referenceNumber?: string;

    @Column({ default: true })
    isActive!: boolean;

    @Column({ default: true })
    isApplicable!: boolean;

    @Column('decimal', { 
        precision: 15, 
        scale: 2,
        nullable: true
    })
    amount?: number;

    @Column('decimal', { 
        precision: 15, 
        scale: 2,
        nullable: true
    })
    percentage?: number;

    // @Column('decimal', {
    //     precision: 15,
    //     scale: 2,
    //     nullable: true
    // })
    // fee?: number;

    // @Column({ nullable: true })
    // term?: string;
}