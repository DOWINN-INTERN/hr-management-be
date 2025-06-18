import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { RequestStatus } from '@/common/enums/request-status.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Document } from '@/modules/documents/entities/document.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Cutoff } from '@/modules/payroll-management/cutoffs/entities/cutoff.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Attendance } from '../../entities/attendance.entity';
import { DayType } from '../../final-work-hours/entities/final-work-hour.entity';
import { WorkTimeResponse } from '../work-time-responses/entities/work-time-response.entity';

@Entity('work-time-requests')
export class WorkTimeRequest extends BaseEntity<WorkTimeRequest> {
    @ManyToOne(() => Employee, (employee: Employee) => employee.workTimeRequests)
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
    status!: RequestStatus;

    @Column({ type: 'enum', enum: AttendanceStatus })
    type!: AttendanceStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    duration?: number; // in minutes

    @Column({ type: 'date' })
    date!: Date;

    @Column({ 
        type: 'enum', 
        enum: DayType,
        default: DayType.REGULAR_DAY
    })
    dayType!: DayType;

    @ManyToOne(() => Attendance, (attendance: Attendance) => attendance.workTimeRequests, { nullable: true })
    @JoinColumn({ name: 'attendanceId' })
    attendance?: Attendance;

    @ManyToOne(() => Cutoff, (cutoff: Cutoff) => cutoff.workTimeRequests, { nullable: true })
    @JoinColumn({ name: 'cutoffId' })
    cutoff?: Cutoff;

    @OneToMany(() => Document, (document: Document) => document.workTimeRequest, { nullable: true, cascade: true })
    documents?: Document[];

    @Column({ type: 'text', nullable: true })
    reason?: string;

    @Column({ default: false })
    earlyTimeAsOvertime!: boolean;

    @Column({ type: 'boolean', default: false })
    managementRequested!: boolean;

    @ManyToOne(() => Employee, { nullable: true })
    @JoinColumn({ name: 'requestedByManagerId' })
    requestedByManager?: Employee;

    @OneToOne(() => WorkTimeResponse, (workTimeResponse: WorkTimeResponse) => workTimeResponse.workTimeRequest, { eager: true, nullable: true})
    workTimeResponse?: WorkTimeResponse;
}