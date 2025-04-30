import { ScheduleStatus } from '@/common/enums/schedule-status';
import { BaseEntity } from '@/database/entities/base.entity';
import { Attendance } from '@/modules/attendance-management/entities/attendance.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Cutoff } from '@/modules/payroll-management/cutoffs/entities/cutoff.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Shift } from '../../entities/shift.entity';
import { Holiday } from '../../holidays/entities/holiday.entity';
import { ScheduleChangeRequest } from '../schedule-change-requests/entities/schedule-change-request.entity';

@Entity('schedules')
export class Schedule extends BaseEntity<Schedule> {
    @Column({ type: 'date' })
    date!: Date;

    @Column({ nullable: true })
    notes?: string;

    @Column({ type: 'enum', enum: ScheduleStatus, default: ScheduleStatus.DEFAULT })
    status?: ScheduleStatus;

    @OneToOne(() => Attendance, (attendance: Attendance) => attendance.schedule, { nullable: true })
    @JoinColumn({ name: 'attendanceId' })
    attendance?: Attendance;

    @Column({ type: 'time', nullable: true })
    startTime!: string;
    
    @Column({ type: 'time', nullable: true })
    endTime!: string;
    
    @Column({ type: 'int', nullable: true })
    breakTime!: number; // in minutes
    
    @Column({ type: 'int', nullable: true })
    duration!: number; // in hours

    @ManyToOne(() => Shift, (shift: Shift) => shift.schedules)
    @JoinColumn({ name: 'shiftId' })
    shift!: Shift;

    @ManyToOne(() => Holiday, (holiday: Holiday) => holiday.schedules, { nullable: true, eager: true })
    @JoinColumn({ name: 'holidayId' })
    holiday?: Holiday;

    @Column({ type: 'boolean', default: false })
    restDay?: boolean;

    @ManyToOne(() => Employee, (employee: Employee) => employee.schedules)
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @OneToMany(() => ScheduleChangeRequest, (scheduleChangeRequest: ScheduleChangeRequest) => scheduleChangeRequest.schedule)
    scheduleChangeRequests?: ScheduleChangeRequest[];

    @ManyToOne(() => Cutoff, (cutoff: Cutoff) => cutoff.schedules)
    @JoinColumn({ name: 'cutoffId' })
    cutoff!: Cutoff;
}