import { instanceToPlain } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Index,
    PrimaryGeneratedColumn,
    BaseEntity as TypeOrmBaseEntity,
    UpdateDateColumn
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
    isDeleted!: boolean;

    @Column({ nullable: true })
    deletedBy?: string;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deletedAt?: Date;

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

    /**
     * Soft delete the entity by setting isDeleted flag and deletedAt timestamp
     */
    softDelete(deletedBy?: string): void {
        this.isDeleted = true;
        this.deletedAt = new Date();
        if (deletedBy) {
            this.deletedBy = deletedBy;
        }
    }

    /**
     * Restore a soft-deleted entity
     */
    restore(): void {
        this.isDeleted = false;
        this.deletedAt = undefined;
        this.deletedBy = undefined;
    }

    /**
     * Check if entity belongs to specific organization
     */
    belongsToOrganization(organizationId: string): boolean {
        return this.organizationId === organizationId;
    }

    /**
     * Check if entity belongs to specific user
     */
    belongsToUser(userId: string): boolean {
        return this.userId === userId;
    }

    /**
     * Convert entity to plain object with optional group-based serialization
     * @param groups - Array of groups to include in serialization
     * @returns Plain object representation
     */
    toPlain(groups?: string[]): Record<string, any> {
        return instanceToPlain(this, {
            excludeExtraneousValues: false,
            exposeDefaultValues: true,
            groups: groups || []
        });
    }

    /**
     * Get public-safe representation (excludes sensitive data)
     */
    toPublic(): Record<string, any> {
        return this.toPlain(['public']);
    }

    /**
     * Get admin representation (includes all data)
     */
    toAdmin(): Record<string, any> {
        return this.toPlain(['admin', 'public']);
    }

    /**
     * Get audit representation (includes audit fields)
     */
    toAudit(): Record<string, any> {
        return this.toPlain(['audit', 'public']);
    }
}