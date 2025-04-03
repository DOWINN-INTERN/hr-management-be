
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { ActivityLog } from '@/modules/logs/entities/activity-logs.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../../database/entities/base.entity';
import { Profile } from '../../profiles/entities/profile.entity';
import { Session } from '../../sessions/entities/session.entity';

@Entity()
export class User extends BaseEntity<User> {
  @Column({ unique: true })
  email?: string;

  @Column()
  password!: string;

  @Column({ unique: true })
  userName!: string;

  @OneToOne(() => Profile, (profile: Profile) => profile.user, { cascade: true })
  profile?: Profile;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ default: false })
  emailVerified: boolean = false;

  @Column({ default: false })
  phoneNumberVerified: boolean = false;

  @Column({ default: 0 })
  accessFailedCount: number = 0;

  @Column({ default: false })
  lockoutEnabled: boolean = false;

  @Column()
  lockedOut: boolean = false;

  @Column({ type: 'timestamp', nullable: true })
  lockOutStart?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lockOutEnd?: Date;

  @OneToMany(() => Session, (session: Session) => session.user)
  sessions?: Session[];

  @OneToMany(() => ActivityLog, (activityLog: ActivityLog) => activityLog.actor)
  activityLogs?: ActivityLog[];

  @OneToOne(() => Employee, (employee) => employee.user)
  employee?: Employee;

  // @OneToMany(() => SocialLogin, (socialLogin) => socialLogin.user)
  // socialLogins?: SocialLogin[];
}