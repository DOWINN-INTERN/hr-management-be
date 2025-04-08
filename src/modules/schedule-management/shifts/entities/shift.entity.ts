import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('shifts')
export class Shift extends BaseEntity<Shift> {
    @Column()
    name?: string;
    
    // Add your entity fields here
}