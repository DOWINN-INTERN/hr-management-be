import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleChangeResponse } from './entities/schedule-change-response.entity';

@Injectable()
export class ScheduleChangeResponsesService extends BaseService<ScheduleChangeResponse> {
    constructor(
        @InjectRepository(ScheduleChangeResponse)
        private readonly scheduleChangeResponsesRepository: Repository<ScheduleChangeResponse>,
        protected readonly usersService: UsersService
    ) {
        super(scheduleChangeResponsesRepository, usersService);
    }
}