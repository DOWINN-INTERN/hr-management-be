import { Action } from '@/common/enums/action.enum';
import { BaseService } from '@/common/services/base.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../../account-management/users/users.service';
import { RolesService } from '../roles.service';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService extends BaseService<Permission> {
    private cachedPermissions: Map<string, Permission> = new Map();

    constructor(
        @InjectRepository(Permission)
        private readonly permissionsRepository: Repository<Permission>,
        protected readonly usersService: UsersService,
        protected readonly rolesService: RolesService
    ) {
        super(permissionsRepository, usersService);
        this.preloadPermissions();
    }

    async getAllPermissions(): Promise<Permission[]> {
        return this.permissionsRepository.find();
    }

    private async preloadPermissions() {
        try {
            const permissions = await this.permissionsRepository.find();
            this.cachedPermissions.clear();
            
            for (const permission of permissions) {
                const key = this.getPermissionKey(permission.action, permission.subject);
                this.cachedPermissions.set(key, permission);
            }
            
            this.logger.log(`Preloaded ${this.cachedPermissions.size} permissions into cache`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to preload permissions: ${errorMessage}`);
        }
    }

    private getPermissionKey(action: Action, subject: string): string {
        return `${action}:${subject}`;
    }

    /**
     * Find or create a permission
     * @param action The action (Create, Read, Update, Delete, Manage)
     * @param subject The subject (resource name)
     * @param name Optional name for the permission
     * @param description Optional description
     * @returns The permission entity
     */
    async findOrCreate(
        action: Action,
        subject: string,
        name?: string,
        description?: string
    ): Promise<Permission> {
        const permissionKey = this.getPermissionKey(action, subject);
        
        // Check cache first
        if (this.cachedPermissions.has(permissionKey)) {
            return this.cachedPermissions.get(permissionKey)!;
        }
        
        // Find in database
        const existingPermission = await this.permissionsRepository.findOne({
            where: { action, subject }
        });
        
        if (existingPermission) {
            // Update cache and return
            this.cachedPermissions.set(permissionKey, existingPermission);
            return existingPermission;
        }
        
        // Create new permission
        const newPermission = this.permissionsRepository.create({
            action,
            subject,
            name: name || `${action}_${subject}`.toUpperCase(),
            description: description || `Permission to ${action.toLowerCase()} ${subject}`
        });
        
        const savedPermission = await this.permissionsRepository.save(newPermission);
        
        // Update cache
        this.cachedPermissions.set(permissionKey, savedPermission);
        this.logger.log(`Created new permission: ${permissionKey}`);
        
        return savedPermission;
    }

    /**
     * Create multiple permissions in a transaction
     * @param permissionsData Array of permission data
     * @returns Created or found permissions
     */
    async createMultiple(permissionsData: Array<{
        action: Action;
        subject: string;
        name?: string;
        description?: string;
    }>): Promise<Permission[]> {
        return this.transactionService.executeInTransaction(async (queryRunner) => {
            const results: Permission[] = [];
            
            for (const data of permissionsData) {
                const key = this.getPermissionKey(data.action, data.subject);
                
                // Check cache first
                if (this.cachedPermissions.has(key)) {
                    results.push(this.cachedPermissions.get(key)!);
                    continue;
                }
                
                // Find or create in transaction
                const existingPermission = await queryRunner.manager.findOne(Permission, {
                    where: { action: data.action, subject: data.subject }
                });
                
                if (existingPermission) {
                    this.cachedPermissions.set(key, existingPermission);
                    results.push(existingPermission);
                    continue;
                }
                
                // Create new
                const newPermission = queryRunner.manager.create(Permission, {
                    action: data.action,
                    subject: data.subject,
                    name: data.name || `${data.action}_${data.subject}`.toUpperCase(),
                    description: data.description || `Permission to ${data.action.toLowerCase()} ${data.subject}`
                });
                
                const savedPermission = await queryRunner.manager.save(newPermission);
                this.cachedPermissions.set(key, savedPermission);
                results.push(savedPermission);
            }
            
            return results;
        }).catch(error => {
            this.logger.error(`Failed to create permissions: ${error.message}`);
            throw error;
        });
    }

    /**
     * Get all permissions by subject
     * @param subject The subject name
     * @returns Array of permissions
     */
    async getPermissionsBySubject(subject: string): Promise<Permission[]> {
        // Try to get from cache first
        const cachedPermissions = Array.from(this.cachedPermissions.values())
            .filter(permission => permission.subject === subject);
        
        if (cachedPermissions.length > 0) {
            return cachedPermissions;
        }
        
        // Fetch from database
        const permissions = await this.permissionsRepository.find({ 
            where: { subject }
        });
        
        // Update cache
        for (const permission of permissions) {
            const key = this.getPermissionKey(permission.action, permission.subject);
            this.cachedPermissions.set(key, permission);
        }
        
        return permissions;
    }

}