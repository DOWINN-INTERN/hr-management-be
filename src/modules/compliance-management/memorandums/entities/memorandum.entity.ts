import { MemoStatus } from '@/common/enums/memo-status.enum';
import { MemoType } from '@/common/enums/memo-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { MemorandumFlow } from '../memorandum-flows/entities/memorandum-flow.entity';
import { MemorandumRecipient } from '../memorandum-recipients/entities/memorandum-recipient.entity';
import { MemorandumTemplate } from '../memorandum-templates/entities/memorandum-template.entity';

@Entity('memorandums')
export class Memorandum extends BaseEntity<Memorandum> {
    @Index()
    @Column({ type: 'varchar', length: 200 })
    title!: string;

    @Column({ type: 'text' })
    content!: string;

    @Index()
    @Column({ type: 'enum', enum: MemoType })
    type!: MemoType;

    @Column({ type: 'timestamp', nullable: true })
    issueDate?: Date;

    @Column({ type: 'timestamp', nullable: true })
    effectiveDate?: Date;

    @Column({ type: 'timestamp', nullable: true })
    complianceDate?: Date;
    
    @Index()
    @Column({ type: 'enum', enum: MemoStatus, default: MemoStatus.DRAFT })
    status!: MemoStatus;

    @ManyToOne(() => Employee, (employee: Employee) => employee.issuedMemos, { nullable: false, eager: true })
    @JoinColumn({ name: 'issuerId' })
    issuer!: Employee;

    @ManyToOne(() => MemorandumTemplate, (template: MemorandumTemplate) => template.memorandums, { nullable: true })
    @JoinColumn({ name: 'templateId' })
    template?: MemorandumTemplate;

    @OneToMany(() => MemorandumRecipient, (recipient) => recipient.memorandum, { cascade: ['insert', 'update'] })
    recipients!: MemorandumRecipient[];

    @OneToMany(() => MemorandumFlow, (flow) => flow.memorandum, { cascade: ['insert', 'update'], eager: true })
    approvalFlows!: MemorandumFlow[];
}