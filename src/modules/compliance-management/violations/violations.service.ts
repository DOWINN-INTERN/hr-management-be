import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Violation } from './entities/violation.entity';

@Injectable()
export class ViolationsService extends BaseService<Violation> {
    constructor(
        @InjectRepository(Violation)
        private readonly violationsRepository: Repository<Violation>,
        protected readonly usersService: UsersService
    ) {
        super(violationsRepository, usersService);
    }
}