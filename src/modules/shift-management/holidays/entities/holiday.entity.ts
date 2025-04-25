import { Day } from '@/common/enums/day.enum';
import { HolidayType } from '@/common/enums/holiday-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Schedule } from '../../schedules/entities/schedule.entity';

@Entity('holidays')
export class Holiday extends BaseEntity<Holiday> {
    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;
    
    @Column({ type: 'enum', enum: HolidayType })
    type!: HolidayType;

    @Column({ type: 'date' })
    date!: Date;

    @Column({ type: 'enum', enum: Day })
    day!: Day;

    @OneToMany(() => Schedule, (schedule: Schedule) => schedule.holiday)
    schedules?: Schedule[];
}