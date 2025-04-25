import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ScheduleChangeRequest } from '../../entities/schedule-change-request.entity';

@Entity('schedule-change-responses')
export class ScheduleChangeResponse extends BaseEntity<ScheduleChangeResponse> {
    @Column()
    approved!: boolean;
    
    @Column()
    message!: string;

    @OneToOne(() => ScheduleChangeRequest, (scheduleChangeRequest: ScheduleChangeRequest) => scheduleChangeRequest.scheduleChangeResponse)
    @JoinColumn({ name: 'scheduleChangeRequestId' })
    scheduleChangeRequest!: ScheduleChangeRequest;
}