import { ViolationSeverity } from '@/common/enums/compliance/violation-severity.enum';
import { ViolationStatus } from '@/common/enums/compliance/violation-status.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Memorandum } from '../../memorandums/entities/memorandum.entity';
import { Policy } from '../../policies/entities/policy.entity';

@Entity('violations')
export class Violation extends BaseEntity<Violation> {
    @ManyToOne(() => Policy)
    @JoinColumn({ name: 'policyId' })
    policy!: Policy;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;
    
    @Column({ type: 'json' })
    violationDetails!: any; // Details about the violation
    
    @Column({ type: 'timestamp' })
    violationDate!: Date;
    
    @Column({ type: 'enum', enum: ViolationSeverity, default: ViolationSeverity.MEDIUM })
    severity!: ViolationSeverity;
    
    @Column({ type: 'enum', enum: ViolationStatus, default: ViolationStatus.OPEN })
    status!: ViolationStatus;
    
    @Column({ type: 'text', nullable: true })
    resolutionNotes?: string;

    @OneToOne(() => Memorandum, { nullable: true })
    @JoinColumn({ name: 'memorandumId' })
    memorandum?: Memorandum;
}