import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memorandum } from './entities/memorandum.entity';

@Injectable()
export class MemorandumsService extends BaseService<Memorandum> {
    constructor(
        @InjectRepository(Memorandum)
        private readonly memorandumsRepository: Repository<Memorandum>,
        protected readonly usersService: UsersService
    ) {
        super(memorandumsRepository, usersService);
    }
}