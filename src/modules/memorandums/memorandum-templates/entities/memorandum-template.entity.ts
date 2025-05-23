import { MemoType } from '@/common/enums/memo-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Memorandum } from '../../entities/memorandum.entity';

@Entity('memorandum-templates')
export class MemorandumTemplate extends BaseEntity<MemorandumTemplate> {
    @OneToMany(() => Memorandum, (memorandum: Memorandum) => memorandum.template, { nullable: true })
    memorandums?: Memorandum[];
    
    @Index({ unique: true })
    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description?: string;

    @Column({ type: 'text' })
    content!: string; // rich-text with placeholders like {{EmployeeName}}

    @Index()
    @Column({ type: 'enum', enum: MemoType })
    type!: MemoType;

    @Column({ type: 'boolean', default: false })
    isDefault!: boolean;
}