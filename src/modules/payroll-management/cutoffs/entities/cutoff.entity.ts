import { CutoffStatus } from '@/common/enums/cutoff-status.enum';
import { CutoffType } from '@/common/enums/cutoff-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { FinalWorkHour } from '@/modules/attendance-management/final-work-hours/entities/final-work-hour.entity';
import { Shift } from '@/modules/shift-management/entities/shift.entity';
import { Schedule } from '@/modules/shift-management/schedules/entities/schedule.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { Payroll } from '../../entities/payroll.entity';

@Entity('cutoffs')
export class Cutoff extends BaseEntity<Cutoff> {
    @Column({ nullable: true })
    description?: string;

    @Column({ type: 'date' })
    startDate!: Date;

    @Column({ type: 'date' })
    endDate!: Date;

    @Column({ type: 'enum', enum: CutoffStatus, default: CutoffStatus.ACTIVE })
    status!: CutoffStatus;
    
    @Column({ type: 'enum', enum: CutoffType, default: CutoffType.BI_WEEKLY })
    cutoffType!: CutoffType;

    @OneToMany(() => Payroll, (payroll: Payroll) => payroll.cutoff, { nullable: true })
    payrolls?: Payroll[];

    @OneToMany(() => Schedule, (schedule: Schedule) => schedule.cutoff, { nullable: true })
    schedules?: Schedule[];

    @OneToMany(() => FinalWorkHour, (finalWorkHour: FinalWorkHour) => finalWorkHour.cutoff, { nullable: true })
    finalWorkHours?: FinalWorkHour[];

    @ManyToMany(() => Shift, (shift: Shift) => shift.cutoffs, { nullable: true })
    shifts?: Shift[];
}