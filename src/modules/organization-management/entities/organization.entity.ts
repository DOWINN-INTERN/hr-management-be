import { Address } from "@/modules/addresses/entities/address.entity";
import { AttendanceConfiguration } from "@/modules/attendance-management/attendance-configurations/entities/attendance-configuration.entity";
import { Role } from "@/modules/employee-management/roles/entities/role.entity";
import { Column, Entity, OneToMany, OneToOne } from "typeorm";
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

    @OneToMany(() => Role, (role: Role) => role.organization, { nullable: true, cascade: true })
    roles?: Role[];

    @OneToOne(() => AttendanceConfiguration, (attendanceConfiguration: AttendanceConfiguration) => attendanceConfiguration.organization, { nullable: true, cascade: true })
    attendanceConfiguration?: AttendanceConfiguration;
}