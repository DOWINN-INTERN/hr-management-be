import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { EmployeesService } from '@/modules/employee-management/employees.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService extends BaseService<Group> {
    constructor(
        @InjectRepository(Group)
        private readonly groupsRepository: Repository<Group>,
        protected readonly usersService: UsersService,
        private readonly employeesService: EmployeesService,
    ) {
        super(groupsRepository, usersService);
    }

    override async create(createDto: DeepPartial<Group>, createdBy?: string): Promise<Group> {
        // Extract employee references before creating the group
        const employeeRefs = createDto.employees;
        delete createDto.employees; // Remove from the DTO to avoid TypeORM trying to create new employees
        
        // Create the group first (without employees)
        const group = await super.create(createDto, createdBy);
        
        // If employee references exist, handle the relationship
        if (employeeRefs && employeeRefs.length > 0) {
            // Find all the employees by their IDs
            const employeeIds = employeeRefs.map(ref => ref.id);
            const employees = await this.employeesService.getRepository().findBy({ 
                id: In(employeeIds)
            });
            
            // Update each employee with the new group
            if (employees.length > 0) {
                await this.employeesService.getRepository().update(
                    { id: In(employeeIds) },
                    { group: { id: group.id } }
                );
            }
        }
        
        // Return the created group with employees loaded
        return this.findOneByOrFail(
            { id: group.id },
            { relations: { employees: true } }
        );
    }
}