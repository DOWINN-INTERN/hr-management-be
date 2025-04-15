import { ScheduleStatus } from '@/common/enums/schedule-status';
import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Cutoff } from '@/modules/payroll-management/cutoffs/entities/cutoff.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Holiday } from '../holidays/entities/holiday.entity';
import { ScheduleChangeRequest } from '../schedule-change-requests/entities/schedule-change-request.entity';
import { Shift } from '../shifts/entities/shift.entity';

@Entity('schedules')
export class Schedule extends BaseEntity<Schedule> {
    @Column({ type: 'date' })
    date!: Date;

    @Column({ nullable: true })
    notes?: string;

    @Column({ type: 'enum', enum: ScheduleStatus, default: ScheduleStatus.DEFAULT })
    status?: ScheduleStatus;

    @ManyToOne(() => Shift, (shift: Shift) => shift.schedules)
    @JoinColumn({ name: 'shiftId' })
    shift!: Shift;

    @ManyToOne(() => Holiday, (holiday: Holiday) => holiday.schedules, { nullable: true })
    @JoinColumn({ name: 'holidayId' })
    holiday?: Holiday;

    @ManyToOne(() => Employee, (employee: Employee) => employee.schedules)
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @OneToMany(() => ScheduleChangeRequest, (scheduleChangeRequest: ScheduleChangeRequest) => scheduleChangeRequest.schedule)
    scheduleChangeRequests?: ScheduleChangeRequest[];

    @ManyToOne(() => Cutoff, (cutoff: Cutoff) => cutoff.schedules)
    @JoinColumn({ name: 'cutoffId' })
    cutoff!: Cutoff;
}