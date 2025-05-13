import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollItemTypesService } from '../payroll-item-types/payroll-item-types.service';
import { PayrollItem } from './entities/payroll-item.entity';

@Injectable()
export class PayrollItemsService extends BaseService<PayrollItem> {
    constructor(
        @InjectRepository(PayrollItem)
        private readonly payrollItemsRepository: Repository<PayrollItem>,
        protected readonly usersService: UsersService,
        private readonly payrollItemTypesService: PayrollItemTypesService,
    ) {
        super(payrollItemsRepository, usersService);
    }
}