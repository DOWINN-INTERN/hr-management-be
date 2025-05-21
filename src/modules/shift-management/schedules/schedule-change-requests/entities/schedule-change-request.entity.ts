import { RequestStatus } from '@/common/enums/request-status.enum';
import { ScheduleChangeRequestType } from '@/common/enums/schedule-change-request-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Document } from '@/modules/documents/entities/document.entity';
import { Column, Entity, ManyToMany, OneToMany, OneToOne } from 'typeorm';
import { Schedule } from '../../entities/schedule.entity';
import { ScheduleChangeResponse } from '../schedule-change-responses/entities/schedule-change-response.entity';

@Entity('schedule-change-requests')
export class ScheduleChangeRequest extends BaseEntity<ScheduleChangeRequest> {
    @Column()
    description!: string;

    @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
    status!: RequestStatus;

    @Column({ type: 'enum', enum: ScheduleChangeRequestType })
    type!: ScheduleChangeRequestType;

    @ManyToMany(() => Schedule, (schedule: Schedule) => schedule.scheduleChangeRequests)
    schedules!: Schedule[];

    @OneToMany(() => Document, (document: Document) => document.scheduleChangeRequest, { nullable: true, cascade: true })
    documents?: Document[];

    @OneToOne(() => ScheduleChangeResponse, (scheduleChangeResponse: ScheduleChangeResponse) => scheduleChangeResponse.scheduleChangeRequest, { nullable: true})
    scheduleChangeResponse?: ScheduleChangeResponse;
}