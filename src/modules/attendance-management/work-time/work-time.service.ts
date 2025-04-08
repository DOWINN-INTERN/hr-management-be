import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkTime } from './entities/work-time.entity';

@Injectable()
export class WorkTimeService extends BaseService<WorkTime> {
    constructor(
        @InjectRepository(WorkTime)
        private readonly workTimeRepository: Repository<WorkTime>,
        protected readonly usersService: UsersService
    ) {
        super(workTimeRepository, usersService);
    }
}