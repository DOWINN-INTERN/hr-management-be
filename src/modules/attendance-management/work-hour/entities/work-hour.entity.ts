import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('work-hours')
export class WorkHour extends BaseEntity<WorkHour> {
    @Column()
    name?: string;
    
    // Add your entity fields here
}