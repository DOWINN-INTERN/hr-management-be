import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Shift } from '../../entities/shift.entity';

@Entity('groups')
export class Group extends BaseEntity<Group> {
    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @OneToMany(() => Employee, (employee: Employee) => employee.group, { cascade: true, nullable: true})
    employees?: Employee[];

    @ManyToOne(() => Shift, (shift: Shift) => shift.groups, { nullable: true, cascade: true, eager: true })
    @JoinColumn({ name: 'shiftId' })
    shift?: Shift;
}