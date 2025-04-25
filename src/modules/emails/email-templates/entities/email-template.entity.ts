import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('email-templates')
export class EmailTemplate extends BaseEntity<EmailTemplate> {
    @Column({ unique: true })
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column()
    subject!: string;

    @Column('text', { nullable: true })
    htmlContent?: string;

    @Column('text', { nullable: true })
    textContent?: string;

    @Column({ default: true })
    isActive!: boolean;

    @Column('json', { nullable: true })
    requiredVariables?: string[];

    @Column('json', { nullable: true })
    optionalVariables?: string[];
}