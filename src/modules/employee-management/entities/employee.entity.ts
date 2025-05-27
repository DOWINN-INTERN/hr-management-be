import { EmploymentCondition } from '@/common/enums/employment/employment-condition.enum';
import { EmploymentStatus } from '@/common/enums/employment/employment-status.enum';
import { EmploymentType } from '@/common/enums/employment/employment-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { User } from '@/modules/account-management/users/entities/user.entity';
import { Attendance } from '@/modules/attendance-management/entities/attendance.entity';
import { FinalWorkHour } from '@/modules/attendance-management/final-work-hours/entities/final-work-hour.entity';
import { WorkTimeRequest } from '@/modules/attendance-management/work-time-requests/entities/work-time-request.entity';
import { Memorandum } from '@/modules/compliance-management/memorandums/entities/memorandum.entity';
import { MemorandumFlow } from '@/modules/compliance-management/memorandums/memorandum-flows/entities/memorandum-flow.entity';
import { MemorandumRecipient } from '@/modules/compliance-management/memorandums/memorandum-recipients/entities/memorandum-recipient.entity';
import { Role } from '@/modules/employee-management/roles/entities/role.entity';
import { Payroll } from '@/modules/payroll-management/entities/payroll.entity';
import { Group } from '@/modules/shift-management/groups/entities/group.entity';
import { Schedule } from '@/modules/shift-management/schedules/entities/schedule.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { EmployeePayrollItemType } from '../employee-payroll-item-types/entities/employee-payroll-item-type.entity';

@Entity('employees')
export class Employee extends BaseEntity<Employee> {
    @Column({ unique: true })
    employeeNumber!: number;
    
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
    biometricsPassword?: string;

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

    @Column({ type: 'date' })
    commencementDate!: Date;

    @Column({ default: 0 })
    leaveCredits!: number;

    @Column({ default: 0 })
    offsetLeaveCredits!: number;

    @OneToOne(() => User, (user) => user.employee, { eager: true })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ManyToMany(() => Role, (role: Role) => role.employees, { nullable: true })
    @JoinTable({
        name: 'employee_roles',
        joinColumn: { name: 'employee_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles?: Role[];

    @OneToMany(() => EmployeePayrollItemType, (employeePayrollItemType: EmployeePayrollItemType) => employeePayrollItemType.employee, { nullable: true })
    payrollItemTypes?: EmployeePayrollItemType[];

    @ManyToOne(() => Group, (group: Group) => group.employees, { nullable: true, eager: true })
    @JoinColumn({ name: 'groupId' })
    group?: Group;

    @OneToMany(() => Schedule, (schedule: Schedule) => schedule.employee, { nullable: true })
    schedules?: Schedule[];

    @OneToMany(() => Attendance, (attendance: Attendance) => attendance.employee, { nullable: true })
    attendances?: Attendance[];

    @OneToMany(() => FinalWorkHour, (finalWorkHour: FinalWorkHour) => finalWorkHour.employee, { nullable: true })
    finalWorkHours?: FinalWorkHour[];

    @OneToMany(() => Payroll, (payroll: Payroll) => payroll.employee, { nullable: true })
    payrolls?: Payroll[];

    @OneToMany(() => WorkTimeRequest, (workTimeRequest: WorkTimeRequest) => workTimeRequest.employee, { nullable: true })
    workTimeRequests?: WorkTimeRequest[];

    @OneToMany(() => Memorandum, (memorandum: Memorandum) => memorandum.issuer, { nullable: true })
    issuedMemos?: Memorandum[];

    @OneToMany(() => MemorandumRecipient, (memorandumRecipient: MemorandumRecipient) => memorandumRecipient.employee, { nullable: true })
    receivedMemos?: MemorandumRecipient[];

    @OneToMany(() => MemorandumFlow, (memorandumFlow: MemorandumFlow) => memorandumFlow.approver, { nullable: true })
    approvalSteps?: MemorandumFlow[];
}