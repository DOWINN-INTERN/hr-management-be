import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollItemType } from './entities/payroll-item-type.entity';

@Injectable()
export class PayrollItemTypesService extends BaseService<PayrollItemType> {
    constructor(
        @InjectRepository(PayrollItemType)
        private readonly payrollItemTypesRepository: Repository<PayrollItemType>,
        protected readonly usersService: UsersService
    ) {
        super(payrollItemTypesRepository, usersService);
    }
}