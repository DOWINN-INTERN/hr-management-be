import { Action } from '@/common/enums/action.enum';
import { LogType } from '@/common/enums/log-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { User } from '@/modules/account-management/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('activity_logs')
export class ActivityLog extends BaseEntity<ActivityLog> {
    @Column({ type: 'enum', enum: Action, nullable: false, default: Action.READ })
    action!: Action;

    @Column({ nullable: false })
    subject!: string;

    @Column({ type: 'enum', enum: LogType, default: LogType.INFO, nullable: false })
    logType!: LogType;

    @ManyToOne(() => User, (user: User) => user.activityLogs)
    @JoinColumn({ name: 'userId' })
    actor!: User;

    @Column({ nullable: true })
    message?: string;

    @Column({ type: 'json', nullable: true })
    details: any;
}