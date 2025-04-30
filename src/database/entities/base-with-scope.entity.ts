import {
    Column,
    Index
} from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class BaseEntityWithScope<T> extends BaseEntity<T> {
    @Column({ nullable: true })
    @Index("idx_organization")
    organizationId?: string;

    @Column({ nullable: true })
    @Index("idx_branch")
    branchId?: string;

    @Column({ nullable: true })
    @Index("idx_department")
    departmentId?: string;

    @Column({ nullable: true })
    @Index("idx_user")
    userId?: string;
}