import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeesService extends BaseService<Employee> {
    constructor(
        @InjectRepository(Employee)
        private readonly employeesRepository: Repository<Employee>,
        protected readonly usersService: UsersService
    ) {
        super(employeesRepository, usersService);
    }
}