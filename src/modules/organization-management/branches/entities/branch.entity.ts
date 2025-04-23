import { BaseEntity } from "@/database/entities/base.entity";
import { Address } from "@/modules/addresses/entities/address.entity";
import { Role } from "@/modules/employee-management/roles/entities/role.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { Organization } from "../../entities/organization.entity";
import { Department } from "../departments/entities/department.entity";

@Entity('branches')
export class Branch extends BaseEntity<Branch> {
    @Column({ unique: true })
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    logo?: string;

    @Column({ unique: true })
    alias!: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    phoneNumber?: string;

    @OneToOne(() => Address, (address: Address) => address.branch, {
        cascade: true
    })
    address?: Address;

    @ManyToOne(() => Organization, (organization: Organization) => organization.branches, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization!: Organization

    @OneToMany(() => Department, (department: Department) => department.branch, { cascade: true })
    departments?: Branch[];

    @OneToMany(() => Role, (role: Role) => role.branch, { nullable: true, cascade: true })
    roles?: Role[];
}