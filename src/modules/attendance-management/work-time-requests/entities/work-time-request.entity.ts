import { AttendanceStatus } from '@/common/enums/attendance-status.enum';
import { RequestStatus } from '@/common/enums/request-status.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Attendance } from '../../entities/attendance.entity';
import { WorkTimeResponse } from '../work-time-responses/entities/work-time-response.entity';

@Entity('work-time-requests')
export class WorkTimeRequest extends BaseEntity<WorkTimeRequest> {
    @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
    status!: RequestStatus;

    @Column({ type: 'enum', enum: AttendanceStatus })
    type!: AttendanceStatus;

    @ManyToOne(() => Attendance, (attendance: Attendance) => attendance.workTimeRequests)
    @JoinColumn({ name: 'attendanceId' })
    attendance!: Attendance;

    @OneToOne(() => WorkTimeResponse, (workTimeResponse: WorkTimeResponse) => workTimeResponse.workTimeRequest, { eager: true, nullable: true, cascade: true })
    @JoinColumn({ name: 'workTimeResponseId' })
    workTimeResponse?: WorkTimeResponse;
}