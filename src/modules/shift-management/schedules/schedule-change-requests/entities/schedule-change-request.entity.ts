import { RequestStatus } from '@/common/enums/request-status.enum';
import { ScheduleChangeRequestType } from '@/common/enums/schedule-change-request-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Document } from '@/modules/documents/entities/document.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne } from 'typeorm';
import { Schedule } from '../../entities/schedule.entity';
import { ScheduleChangeResponse } from '../schedule-change-responses/entities/schedule-change-response.entity';
import { AlternativeSchedule } from './alternative-schedule.entity';

@Entity('schedule-change-requests')
export class ScheduleChangeRequest extends BaseEntity<ScheduleChangeRequest> {
    @Column()
    description!: string;

    @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
    status!: RequestStatus;

    @Column({ type: 'enum', enum: ScheduleChangeRequestType })
    type!: ScheduleChangeRequestType;

    @ManyToMany(() => Schedule, { cascade: false })
    @JoinTable({
        name: 'schedule_change_request_originals',
        joinColumn: { name: 'scheduleChangeRequestId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'scheduleId', referencedColumnName: 'id' },
    })
    originalSchedules!: Schedule[];
    
    @OneToMany(() => AlternativeSchedule, alternativeSchedule => alternativeSchedule.scheduleChangeRequest, { cascade: true })
    alternativeSchedules!: AlternativeSchedule[];

    @OneToMany(() => Document, (document: Document) => document.scheduleChangeRequest, { nullable: true, cascade: true })
    documents?: Document[];

    @OneToOne(() => ScheduleChangeResponse, (scheduleChangeResponse: ScheduleChangeResponse) => scheduleChangeResponse.scheduleChangeRequest, { eager: true, nullable: true})
    scheduleChangeResponse?: ScheduleChangeResponse;
}