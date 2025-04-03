import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchesService extends BaseService<Branch> {
    constructor(
        @InjectRepository(Branch)
        private readonly branchesRepository: Repository<Branch>,
        protected readonly usersService: UsersService
    ) {
        super(branchesRepository, usersService);
    }
}
