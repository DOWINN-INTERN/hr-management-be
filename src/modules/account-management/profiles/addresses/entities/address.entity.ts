import { BaseEntity } from '@/database/entities/base.entity';
import {
    Column,
    Entity,
    JoinColumn,
    OneToOne
} from 'typeorm';
import { Profile } from '../../entities/profile.entity';

@Entity()
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

    @OneToOne(() => Profile, (profile: Profile) => profile.address)
    @JoinColumn()
    profile!: Profile;
}
