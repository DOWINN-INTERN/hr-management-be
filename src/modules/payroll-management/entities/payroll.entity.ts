import { BaseEntity } from '@/database/entities/base.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Cutoff } from '../cutoffs/entities/cutoff.entity';

@Entity('payrolls')
export class Payroll extends BaseEntity<Payroll> {
    

    @ManyToOne(() => Cutoff, (cutoff: Cutoff) => cutoff.payrolls)
    @JoinColumn({ name: 'cutoffId' })
    cutoff!: Cutoff;
}