import { BaseEntity } from '@/database/entities/base.entity';
import { Department } from '@/modules/organization-management/branches/departments/entities/department.entity';
import { Organization } from '@/modules/organization-management/entities/organization.entity';
import {
    Column,
    Entity,
    JoinColumn,
    OneToOne
} from 'typeorm';
import { Profile } from '../../account-management/profiles/entities/profile.entity';
import { Branch } from '@/modules/organization-management/branches/entities/branch.entity';

@Entity('addresses')
export class Address extends BaseEntity<Address> {
    @Column()
    streetNameBuildingHouseNumber!: string;

    @Column()
    barangay!: string;

    @Column()
    cityOrMunicipality!: string;

    @Column()
    province!: string;

    @Column()
    region!: string;

    @Column()
    postalCode!: number;

    @OneToOne(() => Profile, (profile: Profile) => profile.address, {
        onDelete: 'CASCADE', nullable: true
      })
    @JoinColumn()
    profile?: Profile;

    @OneToOne(() => Organization, (organization: Organization) => organization.address, {
        onDelete: 'CASCADE', nullable: true
      })
    @JoinColumn()
    organization?: Organization;

    @OneToOne(() => Branch, (branch: Branch) => branch.address, {
        onDelete: 'CASCADE', nullable: true
      })
    @JoinColumn()
    branch?: Branch;

    @OneToOne(() => Department, (department: Department) => department.address, {
        onDelete: 'CASCADE', nullable: true
      })
    @JoinColumn()
    department?: Department;
}
