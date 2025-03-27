import { Column, Entity, ManyToMany } from 'typeorm';
import { Action } from '../../../../../common/enums/action.enum';
import { BaseEntity } from '../../../../../database/entities/base.entity';
import { Role } from '../../entities/role.entity';

@Entity()
export class Permission extends BaseEntity<Permission> {
    @Column({nullable: true})
    name?: string;

    @Column({nullable: true})
    description?: string;

    @Column({
        type: 'enum',
        enum: Action,
    })
    action!: Action;
      
    @Column()
    subject!: string;

    @ManyToMany(() => Role, Role => Role.permissions)
    roles!: Role[];
}
