import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('compliances')
export class Compliance extends BaseEntity<Compliance> {
    @Column()
    name?: string;
    
    // Add your entity fields here
}