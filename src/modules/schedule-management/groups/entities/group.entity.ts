import { BaseEntity } from '@/database/entities/base.entity';
import { Employee } from '@/modules/employee-management/entities/employee.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Shift } from '../../shifts/entities/shift.entity';

@Entity('groups')
export class Group extends BaseEntity<Group> {
    @Column()
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @OneToMany(() => Employee, (employee: Employee) => employee.group)
    employees?: Employee[];

    @ManyToOne(() => Shift, (shift: Shift) => shift.groups)
    @JoinColumn({ name: 'shiftId' })
    shift?: Shift;
}