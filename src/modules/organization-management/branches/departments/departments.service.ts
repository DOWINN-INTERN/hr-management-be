import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsService extends BaseService<Department> {
    constructor(
        @InjectRepository(Department)
        private readonly departmentsRepository: Repository<Department>,
        protected readonly usersService: UsersService
    ) {
        super(departmentsRepository, usersService);
    }
}
