import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('schedules')
export class Schedule extends BaseEntity<Schedule> {
    @Column()
    name?: string;
    
    // Add your entity fields here
}