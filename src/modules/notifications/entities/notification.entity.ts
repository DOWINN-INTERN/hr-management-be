import { NotificationType } from '@/common/enums/notification-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { User } from '@/modules/account-management/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notifications')
export class Notification extends BaseEntity<Notification> {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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
  type: NotificationType = NotificationType.INFO;

  @Column({ nullable: true })
  link?: string;

  @Column({ default: false })
  read: boolean = false;

  @Column()
  readAt?: Date;

  @Column()
  targetType!: string;

  @Column()
  category!: string;

  @Column({ nullable: true })
  targetId!: string;

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @Column()
  userId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_Id' })
  user!: User;
}