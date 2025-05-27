import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemorandumFlow } from './entities/memorandum-flow.entity';

@Injectable()
export class MemorandumFlowsService extends BaseService<MemorandumFlow> {
    constructor(
        @InjectRepository(MemorandumFlow)
        private readonly memorandumFlowsRepository: Repository<MemorandumFlow>,
        protected readonly usersService: UsersService
    ) {
        super(memorandumFlowsRepository, usersService);
    }
}