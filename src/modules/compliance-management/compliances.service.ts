import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Compliance } from './entities/compliance.entity';

@Injectable()
export class CompliancesService extends BaseService<Compliance> {
    constructor(
        @InjectRepository(Compliance)
        private readonly compliancesRepository: Repository<Compliance>,
        protected readonly usersService: UsersService
    ) {
        super(compliancesRepository, usersService);
    }
}