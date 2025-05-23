import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemorandumTemplate } from './entities/memorandum-template.entity';

@Injectable()
export class MemorandumTemplatesService extends BaseService<MemorandumTemplate> {
    constructor(
        @InjectRepository(MemorandumTemplate)
        private readonly memorandumTemplatesRepository: Repository<MemorandumTemplate>,
        protected readonly usersService: UsersService
    ) {
        super(memorandumTemplatesRepository, usersService);
    }
}