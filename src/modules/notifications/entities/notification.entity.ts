import { NotificationType } from '@/common/enums/notification-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { User } from '@/modules/account-management/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('notifications')
export class Notification extends BaseEntity<Notification> {
  @Column()
  title!: string;

  @Column()
  message!: string;

  @Column()
  iconOrImage?: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO
  })
  type!: NotificationType;

  @Column({ nullable: true })
  link?: string;

  @Column({ default: false })
  read!: boolean;

  @Column({ nullable: true })
  readAt?: Date;

  @Column()
  category!: string;

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => User, (user: User) => user.notifications, { eager: true, cascade: true })
  @JoinColumn({ name: 'userId' })
  user!: User;
}