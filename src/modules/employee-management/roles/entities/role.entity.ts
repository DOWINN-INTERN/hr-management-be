import { RoleScopeType } from '@/common/enums/role-scope-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Permission } from '@/modules/employee-management/roles/permissions/entities/permission.entity';
import { Department } from '@/modules/organization-management/branches/departments/entities/department.entity';
import { Branch } from '@/modules/organization-management/branches/entities/branch.entity';
import { Organization } from '@/modules/organization-management/entities/organization.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Employee } from '../../entities/employee.entity';

@Entity('roles')
export class Role extends BaseEntity<Role> {
    @Column({ unique: true })
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({
        type: 'enum',
        enum: RoleScopeType,
        default: RoleScopeType.OWNED,
    })
    scope!: RoleScopeType;

    @ManyToMany(() => Permission, (permission: Permission) => permission.roles, { nullable: true, cascade: true })
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    })
    permissions?: Permission[];

    @ManyToMany(() => Employee, (employee: Employee) => employee.roles, { nullable: true})
    employees?: Employee[];

    @ManyToOne(() => Organization, (organization: Organization) => organization.roles, { nullable: true })
    @JoinColumn({ name: 'organizationId' })
    organization?: Organization;

    @ManyToOne(() => Branch, (branch: Branch) => branch.roles, { nullable: true })
    @JoinColumn({ name: 'branchId' })
    branch?: Branch;

    @ManyToOne(() => Department, (department: Department) => department.roles, { nullable: true })
    @JoinColumn({ name: 'departmentId' })
    department?: Department;
}
