import { BaseService } from '@/common/services/base.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../../account-management/users/users.service';
import { RolesService } from '../roles.service';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService extends BaseService<Permission> {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionsRepository: Repository<Permission>,
        protected readonly usersService: UsersService,
        protected readonly rolesService: RolesService
    ) {
        super(permissionsRepository, usersService);
    }

    async getAllPermissions(): Promise<Permission[]> {
        return this.permissionsRepository.find();
    }

    async userHasPermissions(userId: string, permissions: string[]): Promise<boolean> {
        return true;
    }

    // async assignPermissionsToRole(
    //     roleId: string,
    //     permissionIds: string[],
    //   ): Promise<Role> {
    //     // Find the role
    //     const role = await this.rolesService.findRoleWithPermissions(roleId);
        
    //     // Find all permissions
    //     const permissions = await this.permissionsRepository.findBy({
    //       id: In(permissionIds),
    //     });
    
    //     if (permissions.length !== permissionIds.length) {
    //       throw new NotFoundException('Some permission IDs were not found');
    //     }
    
    //     // Update the role's permissions
    //     role.permissions = permissions;
    //     return this.roleRepository.save(role);
    //   }
      
    //   async addPermissionsToRole(
    //     roleId: string,
    //     permissionIds: string[],
    //   ): Promise<Role> {
    //     const role = await this.findRoleWithPermissions(roleId);
        
    //     const permissions = await this.permissionRepository.findBy({
    //       id: In(permissionIds),
    //     });
    
    //     if (permissions.length !== permissionIds.length) {
    //       throw new NotFoundException('Some permission IDs were not found');
    //     }
    
    //     // Add new permissions without removing existing ones
    //     const existingIds = role.permissions.map(p => p.id);
    //     const newPermissions = permissions.filter(p => !existingIds.includes(p.id));
        
    //     role.permissions = [...role.permissions, ...newPermissions];
    //     return this.roleRepository.save(role);
    //   }
    
    //   async removePermissionsFromRole(
    //     roleId: string,
    //     permissionIds: string[],
    //   ): Promise<Role> {
    //     const role = await this.findRoleWithPermissions(roleId);
        
    //     // Filter out the permissions to remove
    //     role.permissions = role.permissions.filter(
    //       permission => !permissionIds.includes(permission.id)
    //     );
        
    //     return this.roleRepository.save(role);
    //   }
      
    //   async assignPermissionsByFilter(
    //     roleId: string,
    //     filter: { 
    //       actions?: Action[], 
    //       subjects?: string[], 
    //       names?: string[]
    //     },
    //     operation: 'set' | 'add' | 'remove' = 'set'
    //   ): Promise<Role> {
    //     const role = await this.findRoleWithPermissions(roleId);
        
    //     // Build query
    //     const where: any = {};
    //     if (filter.actions?.length) where.action = In(filter.actions);
    //     if (filter.subjects?.length) where.subject = In(filter.subjects);
    //     if (filter.names?.length) where.name = In(filter.names);
        
    //     if (Object.keys(where).length === 0) {
    //       throw new Error('At least one filter criteria must be provided');
    //     }
        
    //     const permissions = await this.permissionRepository.find({ where });
        
    //     this.logger.log(`Found ${permissions.length} permissions matching filter criteria`);
        
    //     // Apply operation
    //     if (operation === 'set') {
    //       role.permissions = permissions;
    //     } else if (operation === 'add') {
    //       const existingIds = role.permissions.map(p => p.id);
    //       const newPermissions = permissions.filter(p => !existingIds.includes(p.id));
    //       role.permissions = [...role.permissions, ...newPermissions];
    //     } else if (operation === 'remove') {
    //       const permissionIdsToRemove = permissions.map(p => p.id);
    //       role.permissions = role.permissions.filter(
    //         p => !permissionIdsToRemove.includes(p.id)
    //       );
    //     }
        
    //     return this.roleRepository.save(role);
    //   }
}