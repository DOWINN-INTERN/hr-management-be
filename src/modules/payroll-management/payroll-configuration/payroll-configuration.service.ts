import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollConfiguration } from './entities/payroll-configuration.entity';

@Injectable()
export class PayrollConfigurationService extends BaseService<PayrollConfiguration> {
    constructor(
        @InjectRepository(PayrollConfiguration)
        private readonly payrollConfigurationRepository: Repository<PayrollConfiguration>,
        protected readonly usersService: UsersService
    ) {
        super(payrollConfigurationRepository, usersService);
    }
}