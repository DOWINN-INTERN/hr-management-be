import { Day } from '@/common/enums/day.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Group } from '../groups/entities/group.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { ShiftDay } from './shift-day.entity';

@Entity('shifts')
export class Shift extends BaseEntity<Shift> {
    @Column()
    name!: string;
    
    @Column({ nullable: true })
    description?: string;
    
    @Column({ type: 'time' })
    defaultStartTime!: string;
    
    @Column({ type: 'time' })
    defaultEndTime!: string;
    
    @Column({ type: 'int', nullable: true })
    defaultBreakTime!: number; // in minutes
    
    @Column({ type: 'int', nullable: true })
    defaultDuration!: number; // in hours
    
    @OneToMany(() => ShiftDay, (day: ShiftDay) => day.shift, 
    { 
        cascade: true, eager: true 
    })
    days!: ShiftDay[];
    
    // Getter methods to easily get shift details for a specific day
    getShiftDetailsForDay(day: Day): ShiftDay | null {
        if (!this.days || this.days.length === 0) {
            return null;
        }
        
        return this.days.find(detail => detail.day === day) || null;
    }
    
    // Helper methods from your existing Shift entity
    getStartTimeForDay(day: Day): string {
        const dayDetail = this.getShiftDetailsForDay(day);
        return dayDetail?.startTime || this.defaultStartTime;
    }
    
    getEndTimeForDay(day: Day): string {
        const dayDetail = this.getShiftDetailsForDay(day);
        return dayDetail?.endTime || this.defaultEndTime;
    }
    
    getBreakTimeForDay(day: Day): number {
        const dayDetail = this.getShiftDetailsForDay(day);
        return dayDetail?.breakTime || this.defaultBreakTime;
    }
    
    getDurationForDay(day: Day): number {
        const dayDetail = this.getShiftDetailsForDay(day);
        return dayDetail?.duration || this.defaultDuration;
    }
    
    isActiveOnDay(day: Day): boolean {
        return !!this.getShiftDetailsForDay(day);
    }
    
    getActiveDays(): Day[] {
        return this.days?.map(day => day.day) || [];
    }
    
    @OneToMany(() => Group, (group: Group) => group.shift, { nullable: true })
    groups?: Group[];
    
    @OneToMany(() => Schedule, (schedule: Schedule) => schedule.shift, { nullable: true})
    schedules?: Schedule[];
}