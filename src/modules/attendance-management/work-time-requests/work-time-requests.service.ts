import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkTimeRequest } from './entities/work-time-request.entity';

@Injectable()
export class WorkTimeRequestsService extends BaseService<WorkTimeRequest> {
    constructor(
        @InjectRepository(WorkTimeRequest)
        private readonly workTimeRequestsRepository: Repository<WorkTimeRequest>,
        protected readonly usersService: UsersService
    ) {
        super(workTimeRequestsRepository, usersService);
    }
}