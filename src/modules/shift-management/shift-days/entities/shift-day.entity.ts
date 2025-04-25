import { Day } from '@/common/enums/day.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Shift } from '@/modules/shift-management/entities/shift.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('shift-days')
export class ShiftDay extends BaseEntity<ShiftDay> {
    @Column({
        type: 'enum',
        enum: Day
    })
    day!: Day;
    
    @Column({ type: 'time', nullable: true })
    startTime?: string;
    
    @Column({ type: 'time', nullable: true })
    endTime?: string;
    
    @Column({ type: 'int', nullable: true })
    breakTime?: number; // in minutes
    
    @Column({ type: 'int', nullable: true })
    duration?: number; // in hours

    @Column({ default: false })
    isOvernight!: boolean;
    
    @ManyToOne(() => Shift, (shift: Shift) => shift.days)
    @JoinColumn({ name: 'shiftId' })
    shift!: Shift;
}