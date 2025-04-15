import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleChangeRequest } from './entities/schedule-change-request.entity';

@Injectable()
export class ScheduleChangeRequestsService extends BaseService<ScheduleChangeRequest> {
    constructor(
        @InjectRepository(ScheduleChangeRequest)
        private readonly scheduleChangeRequestsRepository: Repository<ScheduleChangeRequest>,
        protected readonly usersService: UsersService
    ) {
        super(scheduleChangeRequestsRepository, usersService);
    }
}