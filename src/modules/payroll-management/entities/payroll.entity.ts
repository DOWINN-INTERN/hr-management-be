import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('payrolls')
export class Payroll extends BaseEntity<Payroll> {
    @Column()
    name?: string;
    
    // Add your entity fields here
}