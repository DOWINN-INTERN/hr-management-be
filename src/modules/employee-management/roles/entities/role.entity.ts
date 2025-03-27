import { RoleScopeType } from '@/common/enums/role-scope-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Permission } from '@/modules/employee-management/roles/permissions/entities/permission.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
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
    scope: RoleScopeType = RoleScopeType.OWNED;

    @ManyToMany(() => Permission, (permission: Permission) => permission.roles, { nullable: true })
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    })
    permissions?: Permission[];

    @ManyToMany(() => Employee, (employee: Employee) => employee.roles)
    employees?: Employee[];
}
