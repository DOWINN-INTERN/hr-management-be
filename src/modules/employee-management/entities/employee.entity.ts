import { EmploymentCondition } from '@/common/enums/employment/employment-condition.enum';
import { EmploymentStatus } from '@/common/enums/employment/employment-status.enum';
import { EmploymentType } from '@/common/enums/employment/employment-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { User } from '@/modules/account-management/users/entities/user.entity';
import { Role } from '@/modules/employee-management/roles/entities/role.entity';
import { PayrollItem } from '@/modules/payroll-management/payroll-items/entities/payroll-item.entity';
import { Group } from '@/modules/schedule-management/groups/entities/group.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from 'typeorm';

@Entity('employees')
export class Employee extends BaseEntity<Employee> {
    @Column({ unique: true })
    employeeNumber?: string;

    @Column({
        type: 'enum',
        enum: EmploymentStatus,
        default: EmploymentStatus.PENDING
    })
    employmentStatus!: EmploymentStatus;

    @Column({
        type: 'enum',
        enum: EmploymentCondition,
        default: EmploymentCondition.PROBATIONARY
    })
    employmentCondition!: EmploymentCondition;


    @Column({ nullable: true })
    biometricsRole?: number;

    @Column({ nullable: true })
    cardNumber?: string;


    @Column({
        type: 'enum',
        enum: EmploymentType,
        default: EmploymentType.FULL_TIME
    })
    employmentType!: EmploymentType;

    @Column({ type: 'date', nullable: true })
    commencementDate?: Date;

    @Column({ type: 'float', nullable: true, default: 0 })
    leaveCredits?: number;

    @OneToOne(() => User, (user) => user.employee)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ManyToMany(() => Role, (role: Role) => role.employees, { nullable: true, cascade: true })
    @JoinTable({
        name: 'employee_roles',
        joinColumn: { name: 'employee_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles?: Role[];

    @OneToMany(() => PayrollItem, (payrollItem: PayrollItem) => payrollItem.employee)
    payrollItems?: PayrollItem[];

    @ManyToOne(() => Group, (group: Group) => group.employees, { nullable: true })
    @JoinColumn({ name: 'groupId' })
    group?: Group;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    monthlyRate!: number;

    get dailyRate(): number {
        return Number(this.monthlyRate) / 20;
    }
}