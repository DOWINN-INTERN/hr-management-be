import { BaseEntity } from '@/database/entities/base.entity';
import { PayrollItemType } from '@/modules/payroll-management/payroll-item-types/entities/payroll-item-type.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Employee } from '../../entities/employee.entity';

@Entity('employee-payroll-item-types')
export class EmployeePayrollItemType extends BaseEntity<EmployeePayrollItemType> {
    @ManyToOne(() => Employee, (employee: Employee) => employee.payrollItemTypes)
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @ManyToOne(() => PayrollItemType, (payrollItemType: PayrollItemType) => payrollItemType.employeePayrollItemTypes)
    @JoinColumn({ name: 'payrollItemTypeId' })
    payrollItemType!: PayrollItemType;

    @Column({ nullable: true })
    referenceNumber?: string;

    @Column({ default: true })
    isActive!: boolean;

    @Column('decimal', { 
        precision: 15, 
        scale: 2,
        nullable: true
    })
    amount?: number;
}