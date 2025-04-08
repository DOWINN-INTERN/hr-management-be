import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkHour } from './entities/work-hour.entity';

@Injectable()
export class WorkHourService extends BaseService<WorkHour> {
    constructor(
        @InjectRepository(WorkHour)
        private readonly workHourRepository: Repository<WorkHour>,
        protected readonly usersService: UsersService
    ) {
        super(workHourRepository, usersService);
    }
}