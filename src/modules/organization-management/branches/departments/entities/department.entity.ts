import { BaseEntity } from "@/database/entities/base.entity";
import { Address } from "@/modules/addresses/entities/address.entity";
import { Role } from "@/modules/employee-management/roles/entities/role.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { Branch } from "../../entities/branch.entity";

@Entity('departments')
export class Department extends BaseEntity<Department> {
    @Column()
    name!: string;

    @Column({ nullable: true, type: 'text' })
    description?: string;

    @Column({ nullable: true })
    logo?: string;

    @Column()
    alias!: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    phoneNumber?: string;

    @OneToOne(() => Address, (address: Address) => address.department, {
        cascade: true
    })
    address?: Address;

    @ManyToOne(() => Branch, (branch: Branch) => branch.departments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branchId' })
    branch!: Branch

    @OneToMany(() => Role, (role: Role) => role.department, { nullable: true, cascade: true })
    roles?: Role[];
}