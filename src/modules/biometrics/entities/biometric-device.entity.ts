import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('biometric_devices')
export class BiometricDevice extends BaseEntity<BiometricDevice> {
    @Column()
    ipAddress!: string;

    @Column()
    port!: number;

    @Column({ nullable: true })
    model?: string;

    @Column({ nullable: true })
    serialNumber?: string;

    @Column()
    provider!: string;

    @Column({ nullable: true })
    firmware?: string;

    @Column({ nullable: true })
    platform?: string;

    @Column({ nullable: true })
    deviceVersion?: string;

    @Column({ nullable: true })
    os?: string;

    @Column({ default: false })
    isConnected!: boolean;
}