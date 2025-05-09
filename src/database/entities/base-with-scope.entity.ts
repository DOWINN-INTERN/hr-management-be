// import { User } from '@/modules/account-management/users/entities/user.entity';
// import { Department } from '@/modules/organization-management/branches/departments/entities/department.entity';
// import { Branch } from '@/modules/organization-management/branches/entities/branch.entity';
// import { Organization } from '@/modules/organization-management/entities/organization.entity';
// import {
//     Index,
//     JoinColumn,
//     ManyToOne
// } from 'typeorm';
// import { BaseEntity } from './base.entity';

// export abstract class BaseEntityWithScope<T> extends BaseEntity<T> {
//     @ManyToOne(() => Organization, (organization: Organization) => organization.resources, { nullable: true })
//     @Index("idx_organization")
//     @JoinColumn({ name: 'organizationId' })
//     organization?: Organization;

//     @ManyToOne(() => Branch, (branch: Branch) => branch.resources, { nullable: true })
//     @Index("idx_branch")
//     @JoinColumn({ name: 'branchId' })
//     branch?: Branch;

//     @ManyToOne(() => Department, (department: Department) => department.resources, { nullable: true })
//     @Index("idx_department")
//     @JoinColumn({ name: 'departmentId' })
//     department?: Department;

//     @ManyToOne(() => User, (user: User) => user.resources, { nullable: true })
//     @Index("idx_user")
//     @JoinColumn({ name: 'userId' })
//     user?: User;
// }