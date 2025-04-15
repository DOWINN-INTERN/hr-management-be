import { ScheduleChangeRequestStatus } from '@/common/enums/schedule-change-request-status.enum';
import { ScheduleChangeRequestType } from '@/common/enums/schedule-change-request-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Document } from '@/modules/documents/entities/document.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Schedule } from '../../entities/schedule.entity';
import { ScheduleChangeResponse } from '../schedule-change-responses/entities/schedule-change-response.entity';

@Entity('schedule-change-requests')
export class ScheduleChangeRequest extends BaseEntity<ScheduleChangeRequest> {
    @Column()
    reason!: string;

    @Column({ type: 'enum', enum: ScheduleChangeRequestStatus, default: ScheduleChangeRequestStatus.PENDING })
    status!: ScheduleChangeRequestStatus;

    @Column({ type: 'enum', enum: ScheduleChangeRequestType })
    type!: ScheduleChangeRequestType;

    @ManyToOne(() => Schedule, (schedule: Schedule) => schedule.scheduleChangeRequests)
    schedule!: Schedule[];

    @OneToMany(() => Document, (document: Document) => document.scheduleChangeRequest)
    documents!: Document[];

    @OneToOne(() => ScheduleChangeResponse, (scheduleChangeResponse: ScheduleChangeResponse) => scheduleChangeResponse.scheduleChangeRequest)
    @JoinColumn({ name: 'scheduleChangeResponseId' })
    scheduleChangeResponse?: ScheduleChangeResponse;
}