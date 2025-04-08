import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('attendances')
export class Attendance extends BaseEntity<Attendance> {
    @Column()
    name?: string;
    
    // Add your entity fields here
}