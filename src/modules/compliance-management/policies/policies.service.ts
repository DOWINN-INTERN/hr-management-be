import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy } from './entities/policy.entity';

@Injectable()
export class PoliciesService extends BaseService<Policy> {
    constructor(
        @InjectRepository(Policy)
        private readonly policiesRepository: Repository<Policy>,
        protected readonly usersService: UsersService
    ) {
        super(policiesRepository, usersService);
    }
}