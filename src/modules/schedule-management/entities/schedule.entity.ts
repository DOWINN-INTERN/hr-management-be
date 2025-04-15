import { ScheduleStatus } from '@/common/enums/schedule-status';
import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Holiday } from '../holidays/entities/holiday.entity';
import { ScheduleChangeRequest } from '../schedule-change-requests/entities/schedule-change-request.entity';
import { Shift } from '../shifts/entities/shift.entity';

@Entity('schedules')
export class Schedule extends BaseEntity<Schedule> {
    @Column({ type: 'date' })
    date!: Date;

    @Column({ nullable: true })
    notes?: string;

    @Column({ type: 'enum', enum: ScheduleStatus, default: ScheduleStatus.DEFAULT })
    status?: ScheduleStatus;

    @ManyToOne(() => Shift, (shift: Shift) => shift.schedules)
    @JoinColumn({ name: 'shiftId' })
    shift!: Shift;

    @OneToOne(() => Holiday, (holiday: Holiday) => holiday.schedule)
    @JoinColumn({ name: 'holidayId' })
    holiday?: Holiday;

    @OneToMany(() => ScheduleChangeRequest, (scheduleChangeRequest: ScheduleChangeRequest) => scheduleChangeRequest.schedule)
    scheduleChangeRequests?: ScheduleChangeRequest[];
}