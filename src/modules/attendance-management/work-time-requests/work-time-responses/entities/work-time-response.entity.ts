import { BaseEntity } from '@/database/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { WorkTimeRequest } from '../../entities/work-time-request.entity';

@Entity('work-time-responses')
export class WorkTimeResponse extends BaseEntity<WorkTimeResponse> {
    @Column()
    approved!: boolean;
    
    @Column()
    message!: string;

    @OneToOne(() => WorkTimeRequest, (workTimeRequest: WorkTimeRequest) => workTimeRequest.workTimeResponse, { cascade: true})
    @JoinColumn({ name: 'workTimeRequestId' })
    workTimeRequest!: WorkTimeRequest;
}