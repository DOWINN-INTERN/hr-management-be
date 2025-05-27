import { PolicyCategory } from '@/common/enums/compliance/policy-category.enum';
import { MemoType } from '@/common/enums/memo-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { MemorandumTemplate } from '../../memorandums/memorandum-templates/entities/memorandum-template.entity';
import { Rule } from '../../rules/entities/rule.entity';

@Entity('policies')
export class Policy extends BaseEntity<Policy> {
    @Index()
    @Column()
    name!: string;

    @Column({ type: 'text' })
    description!: string;
    
    @Column({ type: 'enum', enum: PolicyCategory })
    category!: PolicyCategory;

    @Column({ type: 'enum', enum: MemoType, default: MemoType.POLICY })
    memoType!: MemoType;
    
    @Column({ default: true })
    isActive!: boolean;
    
    @Column({ default: false })
    autoGenerateMemo!: boolean;
    
    @Column({ nullable: true })
    violationThreshold?: number; // Used for policies that track occurrences
    
    @Column({ type: 'json', nullable: true })
    escalationPath?: string; // JSON string with escalation steps

    @OneToMany(() => Rule, (rule: Rule) => rule.policy, {
        cascade: ['insert', 'update']
    })
    rules!: Rule[];

    @ManyToOne(() => MemorandumTemplate)
    @JoinColumn({ name: 'templateId' })
    template?: MemorandumTemplate;
}