import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Schedule } from '../../entities/schedule.entity';
import { ScheduleChangeRequest } from './schedule-change-request.entity';

@Entity('alternative-schedules')
export class AlternativeSchedule extends BaseEntity<AlternativeSchedule> {
    @Column({ type: 'date' })
    date!: Date;

    @Column({ type: 'time' })
    startTime!: string;
    
    @Column({ type: 'time' })
    endTime!: string;
    
    @Column({ type: 'int', nullable: true })
    breakTime?: number;
    
    @Column({ nullable: true })
    notes?: string;
    
    @ManyToOne(() => ScheduleChangeRequest, scheduleChangeRequest => scheduleChangeRequest.alternativeSchedules)
    @JoinColumn({ name: 'scheduleChangeRequestId' })
    scheduleChangeRequest!: ScheduleChangeRequest;
    
    @ManyToOne(() => Schedule, { nullable: true })
    @JoinColumn({ name: 'resultingScheduleId' })
    resultingSchedule?: Schedule;
}