import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity as TypeOrmBaseEntity,
    UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity<T> extends TypeOrmBaseEntity {
    constructor(item: Partial<T>) {
        super();
        Object.assign(this, item);
    }
    
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updatedAt?: Date;

    @Column({ nullable: true })
    createdBy?: string;

    @Column({ nullable: true })
    updatedBy?: string;

    @Column({ default: false })
    isDeleted: boolean = false;

    @Column({ nullable: true })
    deletedBy?: string;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deletedAt?: Date;
}