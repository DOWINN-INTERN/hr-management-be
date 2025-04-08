import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('work-times')
export class WorkTime extends BaseEntity<WorkTime> {
    @Column()
    name?: string;
    
    // Add your entity fields here
}