import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('groups')
export class Group extends BaseEntity<Group> {
    @Column()
    name?: string;
    
    // Add your entity fields here
}