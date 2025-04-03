import { BaseService } from '@/common/services/base.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../account-management/users/users.service';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService extends BaseService<Organization> {
    constructor(
        @InjectRepository(Organization)
        private readonly organizationsRepository: Repository<Organization>,
        protected readonly usersService: UsersService
    ) {
        super(organizationsRepository, usersService);
    }
}
