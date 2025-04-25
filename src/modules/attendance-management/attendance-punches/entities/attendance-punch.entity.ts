import { BaseEntity } from '@/database/entities/base.entity';
import { BiometricDevice } from '@/modules/biometrics/entities/biometric-device.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Attendance } from '../../entities/attendance.entity';

@Entity('attendance-punches')
export class AttendancePunch extends BaseEntity<AttendancePunch> {
    @ManyToOne(() => Attendance, (attendance: Attendance) => attendance.attendancePunches)
    @JoinColumn({ name: 'attendanceId' })
    attendance!: Attendance;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    time!: Date;

    @Column()
    punchType!: string;

    @Column()
    employeeNumber!: number;

    @ManyToOne(() => BiometricDevice, (biometricDevice: BiometricDevice) => biometricDevice.attendancePunches)
    @JoinColumn({ name: 'biometricDeviceId' })
    biometricDevice!: BiometricDevice;
}