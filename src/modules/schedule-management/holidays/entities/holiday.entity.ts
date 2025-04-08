import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('holidays')
export class Holiday extends BaseEntity<Holiday> {
    @Column()
    name?: string;
    
    // Add your entity fields here
}