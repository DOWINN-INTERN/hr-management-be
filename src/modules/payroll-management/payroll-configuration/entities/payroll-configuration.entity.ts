import { BaseEntity } from '@/database/entities/base.entity';
import { Entity } from 'typeorm';

@Entity('payroll-configurations')
export class PayrollConfiguration extends BaseEntity<PayrollConfiguration> {
    
}