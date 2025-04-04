import { Role } from '@/common/enums/role.enum';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { RolesService } from './roles/roles.service';

@Injectable()
export class EmployeesService extends BaseService<Employee> {
    constructor(
        @InjectRepository(Employee)
        private readonly employeesRepository: Repository<Employee>,
        protected readonly usersService: UsersService,
        private readonly rolesService: RolesService
    ) {
        super(employeesRepository, usersService);
    }

    override async create(createDto: DeepPartial<Employee>, createdBy?: string): Promise<Employee> {
        // find employee role by name
        const employeeRole = await this.rolesService.findOneByOrFail({
            name: Role.EMPLOYEE,
        });

        // assign employee role to employee by adding to the roles array
        createDto.roles = createDto.roles || [];
        if (!createDto.roles.some(role => role.id === employeeRole.id)) {
            createDto.roles.push(employeeRole);
        }
        
        return await super.create(createDto, createdBy);
    }
}