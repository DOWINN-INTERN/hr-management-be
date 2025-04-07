import { EmploymentCondition } from '@/common/enums/employment/employment-condition.enum';
import { EmploymentStatus } from '@/common/enums/employment/employment-status.enum';
import { EmploymentType } from '@/common/enums/employment/employment-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { User } from '@/modules/account-management/users/entities/user.entity';
import { Role } from '@/modules/employee-management/roles/entities/role.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne } from 'typeorm';

@Entity('employees')
export class Employee extends BaseEntity<Employee> {
    @Column({ unique: true })
    employeeNumber?: string;

    @Column({
        type: 'enum',
        enum: EmploymentStatus,
        default: EmploymentStatus.PENDING
    })
    employmentStatus?: EmploymentStatus = EmploymentStatus.PENDING;

    @Column({
        type: 'enum',
        enum: EmploymentCondition,
        default: EmploymentCondition.PROBATIONARY
    })
    employmentCondition?: EmploymentCondition = EmploymentCondition.PROBATIONARY;

    @Column({
        type: 'enum',
        enum: EmploymentType,
        default: EmploymentType.FULL_TIME
    })
    employmentType?: EmploymentType = EmploymentType.FULL_TIME;

    @Column({ type: 'date', nullable: true })
    commencementDate?: Date;

    @Column({ type: 'float', nullable: true, default: 0 })
    leaveCredits?: number;

    @OneToOne(() => User, (user) => user.employee)
    @JoinColumn({ name: 'userId' }) // Foreign key column
    user!: User;

    @ManyToMany(() => Role, (role: Role) => role.employees, { nullable: true, cascade: true })
    @JoinTable({
        name: 'employee_roles',
        joinColumn: { name: 'employee_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles?: Role[];
}