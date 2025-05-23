import { SCHEDULE_CHANGE_EVENTS, ScheduleChangeRespondedEvent } from '@/common/events/schedule-change.event';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { ScheduleChangeRequestsService } from '../schedule-change-requests.service';
import { ScheduleChangeResponse } from './entities/schedule-change-response.entity';

@Injectable()
export class ScheduleChangeResponsesService extends BaseService<ScheduleChangeResponse> {
    constructor(
        @InjectRepository(ScheduleChangeResponse)
        private readonly scheduleChangeResponsesRepository: Repository<ScheduleChangeResponse>,
        protected readonly usersService: UsersService,
        private readonly scheduleChangeRequestsService: ScheduleChangeRequestsService,
        private readonly eventEmitter: EventEmitter2,
    ) {
        super(scheduleChangeResponsesRepository, usersService);
    }

    override async validateBefore(dto: DeepPartial<ScheduleChangeResponse>): Promise<void> {
        dto = await this.validateReferences(dto, [
            {
                field: 'scheduleChangeRequest',
                service: this.scheduleChangeRequestsService,
                required: true
            }
        ]);
    }

    override async create(createDto: DeepPartial<ScheduleChangeResponse>, createdBy?: string): Promise<ScheduleChangeResponse> {
        const scheduleChangeResponse = await super.create(createDto, createdBy);
        this.eventEmitter.emit(SCHEDULE_CHANGE_EVENTS.SCHEDULE_CHANGE_RESPONDED, new ScheduleChangeRespondedEvent(createDto.scheduleChangeRequest?.id, createDto.approved, createdBy));
        return scheduleChangeResponse;
    }

    override async update(id: string, updateDto: DeepPartial<ScheduleChangeResponse>, updatedBy?: string): Promise<ScheduleChangeResponse> {
        const scheduleChangeResponse = await super.update(id, updateDto, updatedBy);
        this.eventEmitter.emit(SCHEDULE_CHANGE_EVENTS.SCHEDULE_CHANGE_RESPONDED, new ScheduleChangeRespondedEvent(updateDto.scheduleChangeRequest?.id, updateDto.approved, updatedBy));
        return scheduleChangeResponse;        
    }
}