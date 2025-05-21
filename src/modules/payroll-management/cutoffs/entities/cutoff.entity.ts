import { CutoffType } from '@/common/enums/payroll/cutoff-type.enum';
import { BaseEntity } from '@/database/entities/base.entity';
import { Attendance } from '@/modules/attendance-management/entities/attendance.entity';
import { FinalWorkHour } from '@/modules/attendance-management/final-work-hours/entities/final-work-hour.entity';
import { WorkTimeRequest } from '@/modules/attendance-management/work-time-requests/entities/work-time-request.entity';
import { Shift } from '@/modules/shift-management/entities/shift.entity';
import { Schedule } from '@/modules/shift-management/schedules/entities/schedule.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { Payroll } from '../../entities/payroll.entity';
import { CutoffStatus } from '@/common/enums/payroll/cutoff-status.enum';

@Entity('cutoffs')
export class Cutoff extends BaseEntity<Cutoff> {
    @Column({ nullable: true })
    description?: string;

    @Column({ type: 'date' })
    startDate!: Date;

    @Column({ type: 'date' })
    endDate!: Date;

    @Column({ default: 1 })
    cutoffPlace!: number;

    @Column()
    cutoffNumber!: number;

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

    @OneToMany(() => Attendance, (attendance: Attendance) => attendance.cutoff, { nullable: true })
    attendances?: Attendance[];

    @OneToMany(() => WorkTimeRequest, (workTimeRequest: WorkTimeRequest) => workTimeRequest.cutoff, { nullable: true })
    workTimeRequests?: WorkTimeRequest[];
}