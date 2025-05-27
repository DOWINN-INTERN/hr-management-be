import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemorandumRecipient } from './entities/memorandum-recipient.entity';

@Injectable()
export class MemorandumRecipientsService extends BaseService<MemorandumRecipient> {
    constructor(
        @InjectRepository(MemorandumRecipient)
        private readonly memorandumRecipientsRepository: Repository<MemorandumRecipient>,
        protected readonly usersService: UsersService
    ) {
        super(memorandumRecipientsRepository, usersService);
    }
}