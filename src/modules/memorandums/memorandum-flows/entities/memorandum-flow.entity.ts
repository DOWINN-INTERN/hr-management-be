import { Decision } from '@/common/enums/decision.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Memorandum } from '../../entities/memorandum.entity';

@Entity('memorandum-flows')
@Index(['memorandum', 'sequence'], { unique: true })
export class MemorandumFlow extends BaseEntity<MemorandumFlow> {
    @ManyToOne(() => Memorandum, (memorandum: Memorandum) => memorandum.approvalFlows, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'memorandumId' })
    memorandum!: Memorandum;

    @ManyToOne(() => Employee, (employee:Employee) => employee.approvalSteps, { eager: true })
    @JoinColumn({ name: 'approverId' })
    approver!: Employee;

    @Index()
    @Column({ type: 'int' })
    sequence!: number;

    @Index()
    @Column({ type: 'enum', enum: Decision, default: Decision.PENDING })
    decision!: Decision;

    @Column({ type: 'text', nullable: true })
    comments?: string;

    @Column({ type: 'timestamp', nullable: true })
    decisionAt?: Date;
}