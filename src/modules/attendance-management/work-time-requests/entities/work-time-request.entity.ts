import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { RequestStatus } from '@/common/enums/request-status.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Document } from '@/modules/documents/entities/document.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Attendance } from '../../entities/attendance.entity';
import { WorkTimeResponse } from '../work-time-responses/entities/work-time-response.entity';

@Entity('work-time-requests')
export class WorkTimeRequest extends BaseEntity<WorkTimeRequest> {
    // employee
    @ManyToOne(() => Employee, (employee: Employee) => employee.workTimeRequests)
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
    status!: RequestStatus;

    @Column({ type: 'enum', enum: AttendanceStatus })
    type!: AttendanceStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    duration?: number; // in minutes

    @ManyToOne(() => Attendance, (attendance: Attendance) => attendance.workTimeRequests)
    @JoinColumn({ name: 'attendanceId' })
    attendance!: Attendance;

    @OneToMany(() => Document, (document: Document) => document.workTimeRequest, { nullable: true })
    documents?: Document[];

    @Column({ type: 'text', nullable: true })
    reason?: string;

    @OneToOne(() => WorkTimeResponse, (workTimeResponse: WorkTimeResponse) => workTimeResponse.workTimeRequest, { eager: true, nullable: true, cascade: true })
    @JoinColumn({ name: 'workTimeResponseId' })
    workTimeResponse?: WorkTimeResponse;
}