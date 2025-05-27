import { Role } from '@/common/enums/role.enum';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
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
        
        // Get the highest employee number
        const highestEmpNum = await this.employeesRepository
            .createQueryBuilder('employee')
            .select('MAX(employee.employeeNumber)', 'max')
            .getRawOne();
        
        // Increment by 1 (or start at 1000 if no employees exist)
        const nextEmpNum = (highestEmpNum?.max || 999) + 1;
        
        // check if createDto has employeeNumber
        if (!createDto.employeeNumber) {
            createDto.employeeNumber = nextEmpNum;
        }
        
        // find employee role by name
        const employeeRole = await this.rolesService.findOneByOrFail({
            name: Role.EMPLOYEE,
        });

        // store temporary roles
        const tempRoles = createDto.roles || [];

        // filter out non existing roles
        const existingRoles = await this.rolesService.getRepository().findBy({
            id: In(tempRoles.map(role => role.id)),
        });

        // map existing roles id to the createDto
        createDto.roles = existingRoles.map(role => {
            return {
                id: role.id,
            };
        });

        // assign employee role to employee by adding to the roles array
        if (!createDto.roles?.some(role => role.id === employeeRole.id)) {
            createDto.roles?.push(employeeRole);
        }

        

        // find the user id
        if (createDto.userId) {
            const user = await this.usersService.findOneByOrFail({ id: createDto.userId });
            user.isEmployee = true;
            await this.usersService.update(user.id, user, createdBy);
            createDto.user = user;
        } else {
            // if no userId is provided, throw an error
            throw new NotFoundException('User ID is required to create an employee');
        }
        
        return await super.create(createDto, createdBy);
    }

    async getEmployeesByIds(employeeIds: string[]): Promise<Employee[]> {
        const employees = await this.employeesRepository.findBy({
            id: In(employeeIds),
        });

        if (employees.length !== employeeIds.length) {
            throw new NotFoundException('Employee/s does not exist');
        }

        return employees;
    }

    // async getHigherManagement(employeeId: string): Promise<Employee[]> {
    //     // get employee organization, branch, department, and role scope
    //     const employee = await this.findOneByOrFail({ id: employeeId }, { relations: { roles: true } });
    
    //     const { organizationId, branchId, departmentId, roles } = employee;
    
    //     if (!roles || roles.length === 0) {
    //         // log 
    //         this.logger.warn(`Employee ${employeeId} has no roles`);
    //         throw new NotFoundException('Employee has no roles');
    //     }
    
    //     // get employee highest role
    //     const employeeHighestRole = await this.rolesService.getHighestScopeRole(roles);
    //     if (!employeeHighestRole) {
    //         throw new NotFoundException('Could not determine employee role scope');
    //     }
    
    //     // Define query parameters to find employees with higher scope
    //     const queryBuilder = this.createQueryBuilder('employee')
    //         .leftJoinAndSelect('employee.roles', 'role')
    //         .where('employee.organizationId = :organizationId', { organizationId })
    //         .andWhere('employee.id != :employeeId', { employeeId }); // Exclude the current employee
        
    //     // Add conditions based on role scope hierarchy
    //     switch (employeeHighestRole.scope) {
    //         case RoleScopeType.OWNED:
    //             // All higher scopes are relevant
    //             queryBuilder.andWhere('role.scope IN (:...scopes)', { 
    //                 scopes: [
    //                     RoleScopeType.DEPARTMENT, 
    //                     RoleScopeType.BRANCH, 
    //                     RoleScopeType.ORGANIZATION, 
    //                     RoleScopeType.GLOBAL
    //                 ] 
    //             });
                
    //             // If employee has a department, include department managers
    //             if (departmentId) {
    //                 queryBuilder.andWhere('(role.scope != :deptScope OR (role.scope = :deptScope AND employee.departmentId = :departmentId))', 
    //                     { deptScope: RoleScopeType.DEPARTMENT, departmentId });
    //             }
    //             break;
                
    //         case RoleScopeType.DEPARTMENT:
    //             // Branch, organization and global scopes are higher
    //             queryBuilder.andWhere('role.scope IN (:...scopes)', { 
    //                 scopes: [RoleScopeType.BRANCH, RoleScopeType.ORGANIZATION, RoleScopeType.GLOBAL] 
    //             });
                
    //             // If employee has a branch, include branch managers
    //             if (branchId) {
    //                 queryBuilder.andWhere('(role.scope != :branchScope OR (role.scope = :branchScope AND employee.branchId = :branchId))', 
    //                     { branchScope: RoleScopeType.BRANCH, branchId });
    //             }
    //             break;
                
    //         case RoleScopeType.BRANCH:
    //             // Only organization and global scopes are higher
    //             queryBuilder.andWhere('role.scope IN (:...scopes)', { 
    //                 scopes: [RoleScopeType.ORGANIZATION, RoleScopeType.GLOBAL] 
    //             });
    //             break;
                
    //         case RoleScopeType.ORGANIZATION:
    //             // Only global scope is higher
    //             queryBuilder.andWhere('role.scope = :scope', { scope: RoleScopeType.GLOBAL });
    //             break;
                
    //         case RoleScopeType.GLOBAL:
    //             // No higher scopes exist
    //             return [];
    //     }
    
    //     // Get unique employees (an employee might have multiple roles)
    //     const employees = await queryBuilder.getMany();
        
    //     // Filter to ensure we get unique employees (in case the query returns duplicates)
    //     const uniqueEmployees = [...new Map(employees.map(e => [e.id, e])).values()];
        
    //     return uniqueEmployees;
    // }
}