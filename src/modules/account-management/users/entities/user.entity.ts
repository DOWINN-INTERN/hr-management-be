
import { Document } from '@/modules/documents/entities/document.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { ActivityLog } from '@/modules/logs/activity-logs/entities/activity-log.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../../database/entities/base.entity';
import { Profile } from '../../profiles/entities/profile.entity';
import { Session } from '../../sessions/entities/session.entity';

@Entity('users')
export class User extends BaseEntity<User> {
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ unique: true })
  userName!: string;

  @OneToOne(() => Profile, (profile: Profile) => profile.user, { cascade: true, eager: true, nullable: true })
  profile?: Profile;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ default: false })
  phoneNumberVerified!: boolean;

  @Column({ default: 0 })
  accessFailedCount!: number;

  @Column({ default: false })
  lockoutEnabled!: boolean;

  @Column()
  lockedOut: boolean = false;

  @Column({ type: 'timestamp', nullable: true })
  lockOutStart?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lockOutEnd?: Date;

  @Column({ nullable: true })
  verificationToken?: string;

  @Column({ nullable: true })
  verificationTokenExpires?: Date;

  @OneToMany(() => Session, (session: Session) => session.user, { nullable: true })
  sessions?: Session[];

  @OneToMany(() => ActivityLog, (activityLog: ActivityLog) => activityLog.user, { nullable: true})
  activityLogs?: ActivityLog[];

  @OneToMany(() => Document, (document: Document) => document.user, { nullable: true })
  documents?: Document[];

  @OneToMany(() => Notification, (notification: Notification) => notification.user, { nullable: true })
  notifications?: Notification[];

  @OneToOne(() => Employee, (employee) => employee.user, { nullable: true })
  employee?: Employee;

  // @OneToMany(() => SocialLogin, (socialLogin) => socialLogin.user)
  // socialLogins?: SocialLogin[];
}