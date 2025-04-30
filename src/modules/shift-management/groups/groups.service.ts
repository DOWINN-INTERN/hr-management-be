import { EmployeeAssignedEvent, GROUP_EVENTS } from '@/common/events/employee-assigned.event';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { EmployeesService } from '@/modules/employee-management/employees.service';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService extends BaseService<Group> {
    protected readonly logger = new Logger(GroupsService.name);
    constructor(
        @InjectRepository(Group)
        private readonly groupsRepository: Repository<Group>,
        protected readonly usersService: UsersService,
        private readonly employeesService: EmployeesService,
        private readonly eventEmitter: EventEmitter2,
    ) {
        super(groupsRepository, usersService);
    }

    override async create(createDto: DeepPartial<Group>, createdBy?: string): Promise<Group> {
        // Extract employee references before creating the group
        const employeeRefs = createDto.employees;

        const employeeRefsIds = employeeRefs ? employeeRefs.map(ref => ref.id).filter((id): id is string => id !== undefined) : [];
        
        const employees = await this.employeesService.getEmployeesByIds(employeeRefsIds);

        // Create the group first (without employees)
        const group = await super.create(createDto, createdBy);

        // Emit event for employee assignment to group
        this.eventEmitter.emit(
            GROUP_EVENTS.EMPLOYEE_ASSIGNED,
            new EmployeeAssignedEvent(group, employees, createdBy)
        );
        
        return group;
    }

    override async update(id: string, updateDto: DeepPartial<Group>, updatedBy?: string): Promise<Group> {
        // Extract employee references before updating the group
        const employeeRefs = updateDto.employees;
        
        const employeeRefsIds = employeeRefs ? employeeRefs.map(ref => ref.id).filter((id): id is string => id !== undefined) : [];
        
        await this.employeesService.getEmployeesByIds(employeeRefsIds);

        const currentEmployees = await this.employeesService.getRepository().findBy({
            group: { id }
        });

        const currentEmployeeIds = currentEmployees ? currentEmployees.map(emp => emp.id).filter((id): id is string => id !== undefined) : [];
        // Update the group first (without employees)
        const group = await super.update(id, updateDto, updatedBy);
        
        const employeesToRemove = currentEmployeeIds.filter(id => !employeeRefsIds.includes(id));
        const employeesToAdd = employeeRefsIds.filter(id => !currentEmployeeIds.includes(id));

        // Remove employees from the group
        if (employeesToRemove.length > 0) {
            const removedEmployees = await this.employeesService.getRepository().findBy({
                id: In(employeesToRemove)
            });

            this.eventEmitter.emit(
                GROUP_EVENTS.EMPLOYEE_REMOVED,
                new EmployeeAssignedEvent(group, removedEmployees, updatedBy)
            );
        }

        // Add new employees to the group
        if (employeesToAdd.length > 0) {
            const employees = await this.employeesService.getRepository().findBy({ 
                id: In(employeesToAdd)
            });
            
            this.eventEmitter.emit(
                GROUP_EVENTS.EMPLOYEE_ASSIGNED,
                new EmployeeAssignedEvent(group, employees, updatedBy)
            );
        }
        
        return group;
    }
}