import { Day } from '@/common/enums/day.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Schedule } from '../../entities/schedule.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity('shifts')
export class Shift extends BaseEntity<Shift> {
    @Column({ type: 'time' })
    startTime!: string;
    
    @Column({ type: 'time' })
    endTime!: string;
    
    @Column({ type: 'int', nullable: true })
    breakTime!: number; // in minutes
    
    @Column({ type: 'int', nullable: true })
    duration!: number; // in hours
    
    @Column({
        type: 'simple-array',
    })
    days!: Day[];
    
    @OneToMany(() => Group, (group: Group) => group.shift)
    groups?: Group[];
    
    @OneToMany(() => Schedule, (schedule: Schedule) => schedule.shift)
    schedules?: Schedule[];
}