import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Email } from '../../entities/email.entity';

@Entity('email-configurations')
export class EmailConfiguration extends BaseEntity<EmailConfiguration> {
    @Column({ unique: true })
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column()
    host!: string;

    @Column({ type: 'int' })
    port!: number;

    @Column({ default: false })
    secure!: boolean;

    @Column()
    username!: string;

    @Column({ select: false })
    password!: string;

    @Column()
    fromEmail!: string;

    @Column({ nullable: true })
    fromName?: string;

    @Column({ default: false })
    isDefault!: boolean;

    @OneToMany(() => Email, (email: Email) => email.emailConfiguration, { cascade: true, nullable: true })
    emails?: Email[];
}