import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkTimeResponse } from './entities/work-time-response.entity';

@Injectable()
export class WorkTimeResponsesService extends BaseService<WorkTimeResponse> {
    constructor(
        @InjectRepository(WorkTimeResponse)
        private readonly workTimeResponsesRepository: Repository<WorkTimeResponse>,
        protected readonly usersService: UsersService
    ) {
        super(workTimeResponsesRepository, usersService);
    }
}