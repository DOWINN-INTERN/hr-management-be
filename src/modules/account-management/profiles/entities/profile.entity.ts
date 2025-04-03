import { BaseEntity } from '@/database/entities/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne
} from 'typeorm';
import { Address } from '../../../addresses/entities/address.entity';
import { User } from '../../users/entities/user.entity';

@Entity('profiles')
export class Profile extends BaseEntity<Profile> {
  @Column()
  firstName!: string;

  @Column({ nullable: true })
  middleName?: string;

  @Column()
  lastName!: string;

  @Column({ nullable: true })
  suffix?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  sex?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ nullable: true })
  birthDate?: Date;

  @Column({ nullable: true })
  civilStatus?: string;

  @Column({ nullable: true })
  citizenship?: string;

  @Column({ nullable: true })
  nationality?: string;

  @Column({ nullable: true })
  religion?: string;

  @OneToOne(() => User, (user: User) => user.profile)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ unique: true })
  userId!: string;

  @OneToOne(() => Address, (address: Address) => address.profile, {
    cascade: true
  })
  address?: Address;
}
