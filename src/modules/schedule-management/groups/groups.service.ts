import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService extends BaseService<Group> {
    constructor(
        @InjectRepository(Group)
        private readonly groupsRepository: Repository<Group>,
        protected readonly usersService: UsersService
    ) {
        super(groupsRepository, usersService);
    }
}