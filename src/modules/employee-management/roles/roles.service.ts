import { BaseService } from '@/common/services/base.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../account-management/users/users.service';
import { Role } from './entities/role.entity';
@Injectable()
export class RolesService extends BaseService<Role> {
    constructor(
        @InjectRepository(Role)
        private readonly rolesRepository: Repository<Role>,
        protected readonly usersService: UsersService
    ) {
        super(rolesRepository, usersService);
    }

    async getAllRoles(): Promise<Role[]> {
        return this.rolesRepository.find({ relations: ['permissions'] });
    }

    async findRoleWithPermissions(roleId: string): Promise<Role> {
        const role = await this.rolesRepository.findOne({
            where: { id: roleId },
            relations: ['permissions'],
        });

        if (!role) {
            throw new NotFoundException(`Role with ID ${roleId} not found`);
        }
        
        return role;
    }

    // getHighestScopeRole(roles: Role[]): Role | undefined {
    //   if (!roles.length) return undefined;
      
    //   // Define scope priority (higher number = higher priority)
    //   const scopePriority: Record<RoleScopeType, number> = {
    //     [RoleScopeType.GLOBAL]: 5,
    //     [RoleScopeType.ORGANIZATION]: 4,
    //     [RoleScopeType.BRANCH]: 3,
    //     [RoleScopeType.DEPARTMENT]: 2,
    //     [RoleScopeType.OWNED]: 1
    //   };
      
    //   // Sort roles by scope priority (highest first)
    //   const sortedRoles = [...roles].sort((a, b) => 
    //     scopePriority[b.scope] - scopePriority[a.scope]
    //   );
      
    //   return sortedRoles[0];
    // }

}