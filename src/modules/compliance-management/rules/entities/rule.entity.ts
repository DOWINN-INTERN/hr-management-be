import { RuleOperator } from '@/common/enums/compliance/rule-operator.enum';
import { DataSource } from '@/common/enums/data-source.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Policy } from '../../policies/entities/policy.entity';

@Entity('rules')
export class Rule extends BaseEntity<Rule> {
    @ManyToOne(() => Policy, (policy: Policy) => policy.rules, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'policyId' })
    policy!: Policy;
    
    @Column({ type: 'varchar', length: 50 })
    name!: string;

    @Column({ type: 'enum', enum: DataSource })
    dataSource!: DataSource;
    
    @Column({ type: 'varchar', length: 100 })
    dataPath!: string; // Path to the data field (e.g., "attendance.lateCount")
    
    @Column({ type: 'enum', enum: RuleOperator })
    operator!: RuleOperator;
    
    @Column({ type: 'json' }) // MySQL JSON type for flexible value storage
    value!: any; // The value to compare against
    
    @Column({ type: 'int', default: 1 })
    weight!: number; // For weighted rule evaluation
    
    @Column({ type: 'text', nullable: true })
    errorMessage?: string; // Custom message when rule is violated
}