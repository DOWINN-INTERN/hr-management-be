import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Memorandum } from '../../entities/memorandum.entity';

@Entity('memorandum-recipients')
@Index(['memorandum', 'employee'], { unique: true })
export class MemorandumRecipient extends BaseEntity<MemorandumRecipient> {
    @ManyToOne(() => Memorandum, (memorandum: Memorandum) => memorandum.recipients, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'memorandumId' })
    memorandum!: Memorandum;

    @ManyToOne(() => Employee, (employee: Employee) => employee.receivedMemos, { eager: true })
    @JoinColumn({ name: 'employeeId' })
    employee!: Employee;

    @Column({ type: 'boolean', default: false })
    read!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    readAt?: Date;

    @Column({ type: 'boolean', default: false })
    acknowledged!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    acknowledgedAt?: Date;
}