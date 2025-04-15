import { HolidayType } from '@/common/enums/holiday-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Schedule } from '../../entities/schedule.entity';

@Entity('holidays')
export class Holiday extends BaseEntity<Holiday> {
    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;
    
    @Column({ type: 'enum', enum: HolidayType })
    type!: HolidayType;

    @OneToOne(() => Schedule, (schedule: Schedule) => schedule.holiday)
    @JoinColumn({ name: 'scheduleId' })
    schedule!: Schedule;
}