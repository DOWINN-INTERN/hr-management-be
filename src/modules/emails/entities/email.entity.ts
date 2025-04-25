import { EmailStatus } from '@/common/enums/email-status.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { EmailConfiguration } from '../email-configurations/entities/email-configuration.entity';

@Entity('emails')
export class Email extends BaseEntity<Email> {
    @Column()
    to!: string;

    @Column({ nullable: true })
    cc?: string;

    @Column({ nullable: true })
    bcc?: string;

    @Column()
    subject!: string;

    @Column('text', { nullable: true })
    htmlContent?: string;

    @Column('text', { nullable: true })
    textContent?: string;

    @Column()
    sentAt!: Date;

    @Column({ type: 'enum', enum: EmailStatus })
    status!: EmailStatus

    @Column({ nullable: true })
    error?: string;

    @Column({ nullable: true })
    templateName?: string;

    @ManyToOne(() => EmailConfiguration, (emailConfiguration: EmailConfiguration) => emailConfiguration.emails)
    @JoinColumn({ name: 'emailConfigurationId' })
    emailConfiguration!: EmailConfiguration;
}