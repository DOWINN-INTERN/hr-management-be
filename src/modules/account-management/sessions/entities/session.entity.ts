
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('sessions')
export class Session extends BaseEntity<Session> {
  @Column()
  refreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastActiveAt?: Date;

  @ManyToOne(() => User, (user: User) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  deviceId?: string;
}