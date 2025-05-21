import { WORK_TIME_EVENTS, WorkTimeRespondedEvent } from '@/common/events/work-time.event';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { WorkTimeRequestsService } from '../work-time-requests.service';
import { WorkTimeResponseDto } from './dtos/work-time-response.dto';
import { WorkTimeResponse } from './entities/work-time-response.entity';

@Injectable()
export class WorkTimeResponsesService extends BaseService<WorkTimeResponse> {
    constructor(
        @InjectRepository(WorkTimeResponse)
        private readonly workTimeResponsesRepository: Repository<WorkTimeResponse>,
        protected readonly usersService: UsersService,
        private readonly workTimeRequestsService: WorkTimeRequestsService,
        private readonly eventEmitter: EventEmitter2,
    ) {
        super(workTimeResponsesRepository, usersService);
    }

    override async validateBefore(dto: WorkTimeResponseDto): Promise<void> {
      // Validate that the worktime request exists and doesn't already have a response
      dto = await this.validateReferences(dto, [
        {
          field: 'workTimeRequest',
          service: this.workTimeRequestsService,
          required: true
        }
      ]);
    }

    override async create(createDto: DeepPartial<WorkTimeResponse>, createdBy?: string): Promise<WorkTimeResponse> {
        const workTimeResponse = await super.create(createDto, createdBy);
        this.eventEmitter.emit(WORK_TIME_EVENTS.WORK_TIME_RESPONDED, new WorkTimeRespondedEvent(createDto.workTimeRequest?.id, createDto.approved, createdBy));
        return workTimeResponse;
    }

    override async update(id: string, updateDto: DeepPartial<WorkTimeResponse>, updatedBy?: string): Promise<WorkTimeResponse> {
        const workTimeResponse = await super.update(id, updateDto, updatedBy);
        this.eventEmitter.emit(WORK_TIME_EVENTS.WORK_TIME_RESPONDED, new WorkTimeRespondedEvent(updateDto.workTimeRequest?.id, updateDto.approved, updatedBy));
        return workTimeResponse;
    }

    // override async softDelete(id: string, deletedBy?: string): Promise<GeneralResponseDto> {
    //     const result = await super.softDelete(id, deletedBy);
    //     this.eventEmitter.emit(WORK_TIME_EVENTS.WORK_TIME_RESPONDED, new WorkTimeRespondedEvent(id, undefined, deletedBy));
    //     return result;
    // }
}