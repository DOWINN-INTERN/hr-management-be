import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Schedule } from '@/modules/shift-management/schedules/entities/schedule.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { AttendancePunch } from '../attendance-punches/entities/attendance-punch.entity';
import { DayType, FinalWorkHour } from '../final-work-hours/entities/final-work-hour.entity';
import { WorkTimeRequest } from '../work-time-requests/entities/work-time-request.entity';

@Entity('attendances')
export class Attendance extends BaseEntity<Attendance> {
    @ManyToOne(() => Employee, (employee: Employee) => employee.attendances, { eager: true })
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @Column({ 
        type: 'simple-array',
        nullable: true,
    })
    statuses?: AttendanceStatus[];

    @Column({ type: 'timestamp', nullable: true })
    timeIn?: Date;

    @Column({ type: 'timestamp', nullable: true })
    timeOut?: Date;

    @Column({ default: false })
    isProcessed!: boolean;

    @Column({ type: 'enum', enum: DayType })
    dayType!: DayType;

    @OneToOne(() => Schedule, (schedule: Schedule) => schedule.attendance, { eager: true })
    @JoinColumn({ name: 'scheduleId' })
    schedule!: Schedule;

    @OneToMany(() => AttendancePunch, (attendancePunches: AttendancePunch) => attendancePunches.attendance, { cascade: true })
    attendancePunches!: AttendancePunch[];

    @OneToMany(() => WorkTimeRequest, (workTimeRequest: WorkTimeRequest) => workTimeRequest.attendance, { cascade: true, nullable: true })
    workTimeRequests?: WorkTimeRequest[];

    @OneToOne(() => FinalWorkHour, (finalWorkHour: FinalWorkHour) => finalWorkHour.attendance, { cascade: true, nullable: true })
    @JoinColumn({ name: 'finalWorkHourId' })
    finalWorkHour?: FinalWorkHour;
}