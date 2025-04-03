import { Address } from "@/modules/addresses/entities/address.entity";
import { Role } from "@/modules/employee-management/roles/entities/role.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "../../../database/entities/base.entity";
import { Branch } from "../branches/entities/branch.entity";

@Entity('organizations')
export class Organization extends BaseEntity<Organization> {
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

    @OneToOne(() => Address, (address: Address) => address.organization, {
        cascade: true
    })
    address?: Address;

    @OneToMany(() => Branch, (branch: Branch) => branch.organization, { cascade: true })
    branches?: Branch[];

    @ManyToMany(() => Role, (role: Role) => role.organizations, { nullable: true, cascade: true })
    @JoinTable({
        name: 'organization_roles',
        joinColumn: { name: 'organization_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles?: Role[];
}