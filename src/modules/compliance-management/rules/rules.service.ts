import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule } from './entities/rule.entity';

@Injectable()
export class RulesService extends BaseService<Rule> {
    constructor(
        @InjectRepository(Rule)
        private readonly rulesRepository: Repository<Rule>,
        protected readonly usersService: UsersService
    ) {
        super(rulesRepository, usersService);
    }
}