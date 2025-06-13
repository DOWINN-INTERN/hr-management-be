import { Role } from "@/modules/employee-management/roles/entities/role.entity";
import { ForbiddenException } from "@nestjs/common";
import path from "path";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { RoleScopeType } from "../enums/role-scope-type.enum";

export class UtilityHelper {
    static isEmpty(value: any): boolean {
        return value === null || value === undefined || value === '';
    }

    static isEmailValid(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static generateRandomString(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    static hashPassword(password: string): string {
        // Implement password hashing logic here (e.g., using bcrypt)
        return password; // Placeholder, replace with actual hashing
    }

    static comparePasswords(plainPassword: string, hashedPassword: string): boolean {
        // Implement password comparison logic here (e.g., using bcrypt)
        return plainPassword === hashedPassword; // Placeholder, replace with actual comparison
    }

    static formatCriteria(criteria: Partial<any>): string {
        return Object.entries(criteria)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    }

    static determineEffectiveScope(roles: Partial<Role>[]): Partial<Role> {
        if (!roles.length) {
            return { scope: RoleScopeType.OWNED, name: 'Staff' };
        }

        let effectiveScopeType = RoleScopeType.OWNED;
        let effectiveRoleName = 'Staff';
        
        for (const role of roles) {
            const roleScope = role.scope || RoleScopeType.OWNED;
            
            if (roleScope === RoleScopeType.GLOBAL) {
                return role;
            }
            
            if (this.isBroaderScope(roleScope, effectiveScopeType)) {
                effectiveScopeType = roleScope;
                effectiveRoleName = role.name || 'Staff';
            }
        }
        
        return { scope: effectiveScopeType, name: effectiveRoleName };
    }
    
    static isBroaderScope(scopeA: RoleScopeType, scopeB: RoleScopeType): boolean {
        const scopePriority = {
            [RoleScopeType.GLOBAL]: 4,
            [RoleScopeType.ORGANIZATION]: 3,
            [RoleScopeType.BRANCH]: 2,
            [RoleScopeType.DEPARTMENT]: 1,
            [RoleScopeType.OWNED]: 0
        };
        
        return scopePriority[scopeA] > scopePriority[scopeB];
    }

    /**
     * Ensures a value is a Date object
     */
    static ensureDate(date: string | Date): Date {
        if (date instanceof Date) {
        return date;
        }
        return new Date(date);
    }

    /**
     * Calculate business days between two dates
     */
    static getBusinessDays(start: string | Date, end: string | Date): number {
        const startDate = this.ensureDate(start);
        const endDate = this.ensureDate(end);
        
        let count = 0;
        const currentDate = new Date(startDate.getTime());
        
        // Iterate from start to end date
        while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        // Count if it's not a weekend (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return count;
    }

    /**
     * Validates tenant access for file operations and returns the effective tenant directory
     * @param scope The user's resource scope
     * @param tenantContext The requested tenant context from DTO
     * @returns The validated tenant directory path
     */
    static validateAndGetTenantDirectory(
        scope: any, // ResourceScope type
        tenantContext: {
            organizationId?: string;
            branchId?: string;
            departmentId?: string;
            userId?: string;
        }
    ): string {
        const { type, organizations, branches, departments, userId } = scope;

        switch (type) {
            case RoleScopeType.GLOBAL:
                // Global scope can access any directory structure
                if (tenantContext.userId) {
                    return `users/${tenantContext.userId}`;
                }
                if (tenantContext.organizationId) {
                    let path = `organizations/${tenantContext.organizationId}`;
                    if (tenantContext.branchId) {
                        path += `/branches/${tenantContext.branchId}`;
                        if (tenantContext.departmentId) {
                            path += `/departments/${tenantContext.departmentId}`;
                        }
                    }
                    return path;
                }
                return '';

            case RoleScopeType.ORGANIZATION:
                // Must provide organizationId and it must be in their allowed organizations
                if (!tenantContext.organizationId) {
                    throw new ForbiddenException('Organization scope requires organizationId');
                }
                if (!organizations?.includes(tenantContext.organizationId)) {
                    throw new ForbiddenException(
                        `You don't have access to organization: ${tenantContext.organizationId}`
                    );
                }
                
                let orgPath = `organizations/${tenantContext.organizationId}`;
                if (tenantContext.branchId) {
                    orgPath += `/branches/${tenantContext.branchId}`;
                    if (tenantContext.departmentId) {
                        orgPath += `/departments/${tenantContext.departmentId}`;
                    }
                }
                return orgPath;

            case RoleScopeType.BRANCH:
                // Must provide branchId and it must be in their allowed branches
                if (!tenantContext.branchId) {
                    throw new ForbiddenException('You must provide branchId to upload files');
                }

                // Check if user has access to the branch resource
                if (!branches?.includes(tenantContext.branchId)) {
                    throw new ForbiddenException(
                        `You don't have access to branch: ${tenantContext.branchId}`
                    );
                }
                
                // For branch scope, we need to validate organization-branch relationship
                let userOrgId: string;
                
                // Check if user provided organization Id
                if (tenantContext.organizationId) {
                    // If organizationId is provided, validate that the branch belongs to this organization
                    userOrgId = tenantContext.organizationId;
                    
                    // Check if the user has access to this organization
                    if (!organizations?.includes(userOrgId)) {
                        throw new ForbiddenException(
                            `You don't have access to organization: ${userOrgId}`
                        );
                    }
                    
                    // Find the index of the branch to get corresponding organization
                    const branchIndex = branches?.indexOf(tenantContext.branchId);
                    const correspondingOrgId = organizations?.[branchIndex];
                    
                    if (correspondingOrgId !== userOrgId) {
                        throw new ForbiddenException(
                            `Branch ${tenantContext.branchId} does not belong to organization ${userOrgId}`
                        );
                    }
                } else {
                    // If no organizationId provided, derive it from branch scope
                    const branchIndex = branches?.indexOf(tenantContext.branchId);
                    userOrgId = organizations?.[branchIndex];
                    
                    if (!userOrgId) {
                        throw new ForbiddenException(
                            'Cannot determine organization context for the specified branch'
                        );
                    }
                }

                
                let branchPath = `organizations/${userOrgId}/branches/${tenantContext.branchId}`;

                // If user provided departmentId, validate it
                if (tenantContext.departmentId) {
                    // Validate that the department exists and belongs to the user's accessible branch
                    if (!departments?.includes(tenantContext.departmentId)) {
                        throw new ForbiddenException(
                            `You don't have access to department: ${tenantContext.departmentId}`
                        );
                    }
                    
                    // Additional validation: ensure department belongs to the specified branch
                    // This assumes departments array corresponds to branches array by index
                    const departmentBranchIndex = departments.indexOf(tenantContext.departmentId);
                    const associatedBranchId = branches?.[departmentBranchIndex];
                    
                    if (associatedBranchId !== tenantContext.branchId) {
                        throw new ForbiddenException(
                            `Department ${tenantContext.departmentId} does not belong to branch ${tenantContext.branchId}`
                        );
                    }
                    
                    branchPath += `/departments/${tenantContext.departmentId}`;
                }
                return branchPath;

            case RoleScopeType.DEPARTMENT:
                // Must provide departmentId and it must be in their allowed departments
                if (!tenantContext.departmentId) {
                    throw new ForbiddenException('You must provide departmentId to upload files');
                }
                if (!departments?.includes(tenantContext.departmentId)) {
                    throw new ForbiddenException(
                        `You don't have access to department: ${tenantContext.departmentId}`
                    );
                }
                
                // For department scope, we need to validate organization-branch-department relationship
                let departmentOrgId: string;
                let departmentBranchId: string;
                // Check if user provided organizationId
                if (tenantContext.organizationId) {
                    // If organizationId is provided, validate that the department belongs to this organization
                    departmentOrgId = tenantContext.organizationId;
                    // Check if the user has access to this organization
                    if (!organizations?.includes(departmentOrgId)) {
                        throw new ForbiddenException(
                            `You don't have access to organization: ${departmentOrgId}`
                        );
                    }
                    // Find the index of the department to get corresponding branch
                    const departmentIndex = departments?.indexOf(tenantContext.departmentId);
                    departmentBranchId = branches?.[departmentIndex];
                    if (!departmentBranchId) {
                        throw new ForbiddenException(
                            `Department ${tenantContext.departmentId} does not belong to organization ${departmentOrgId}`
                        );
                    }
                } else {
                    // If no organizationId provided, derive it from department scope
                    const departmentIndex = departments?.indexOf(tenantContext.departmentId);
                    departmentOrgId = organizations?.[departmentIndex];
                    departmentBranchId = branches?.[departmentIndex];
                    if (!departmentOrgId || !departmentBranchId) {
                        throw new ForbiddenException(
                            'Cannot determine organization or branch context for the specified department'
                        );
                    }
                }
                // Check if user provided branchId
                if (tenantContext.branchId) {
                    // Validate that the branchId matches the department's branch
                    if (tenantContext.branchId !== departmentBranchId) {
                        throw new ForbiddenException(
                            `Department ${tenantContext.departmentId} does not belong to branch ${tenantContext.branchId}`
                        );
                    }
                    // Validate that the branchId belongs to the user's accessible organization
                    if (!branches?.includes(tenantContext.branchId)) {
                        throw new ForbiddenException(
                            `You don't have access to branch: ${tenantContext.branchId}`
                        );
                    }
                } else {
                    // If no branchId provided, dervice it from department scope
                    const departmentIndex = departments?.indexOf(tenantContext.departmentId);
                    departmentBranchId = branches?.[departmentIndex];
                    if (!departmentBranchId) {
                        throw new ForbiddenException(
                            `Cannot determine branch context for the specified department ${tenantContext.departmentId}`
                        );
                    }
                }
                // Construct the department path
                return `organizations/${departmentOrgId}/branches/${departmentBranchId}/departments/${tenantContext.departmentId}`;
            case RoleScopeType.OWNED:
                // Can only upload to their own user directory
                if (tenantContext.userId && tenantContext.userId !== userId) {
                    throw new ForbiddenException('You can only upload files to your own directory');
                }
                return `users/${userId}`;

            default:
                throw new ForbiddenException('Invalid scope type');
        }
    }

    /**
     * Validates that a file path is within the allowed tenant directory
     * @param filePath The file path to validate
     * @param allowedTenantPath The allowed tenant directory path
     * @returns boolean indicating if the path is valid
     */
    static validateFilePath(filePath: string, allowedTenantPath: string): boolean {
        // Normalize paths to prevent directory traversal attacks
        const normalizedFilePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
        const normalizedTenantPath = path.normalize(allowedTenantPath);
        
        // Check if the file path starts with the allowed tenant path
        return normalizedFilePath.startsWith(normalizedTenantPath);
    }

    /**
     * Check if a resource has access based on its scope configuration
     * @param resource The resource to check access for
     * @param resourceScope The scope configuration containing access rules
     * @returns boolean indicating if access is granted
     */
    static checkScopeAccess(resource: any, resourceScope: any): boolean {
        const { type, organizations, branches, departments, userId } = resourceScope;
        let hasAccess = false;
        switch (type) {
            case RoleScopeType.GLOBAL:
                return true;

            case RoleScopeType.ORGANIZATION:
                if (!resource.organizationId) {
                    console.warn('Resource missing organizationId for ORGANIZATION scope check');
                    return true;
                }
                hasAccess = organizations?.includes(resource.organizationId) ?? false;

                if (!hasAccess) {
                    throw new ForbiddenException(
                        `You do not have access or manage this resource in organization: ${resource.organizationId}`
                    );
                }

                return hasAccess;

            case RoleScopeType.BRANCH:
                if (!resource.branchId) {
                    console.warn('Resource missing branchId for BRANCH scope check');
                    return true;
                }
                hasAccess = branches?.includes(resource.branchId) ?? false;
                if (!hasAccess) {
                    throw new ForbiddenException(
                        `You do not have access or manage this resource in branch: ${resource.branchId}`
                    );
                }
                return hasAccess;

            case RoleScopeType.DEPARTMENT:
                if (!resource.departmentId) {
                    console.warn('Resource missing departmentId for DEPARTMENT scope check');
                    return true;
                }
                hasAccess = departments?.includes(resource.departmentId) ?? false;
                if (!hasAccess) {
                    throw new ForbiddenException(
                        `You do not have access or manage this resource in department: ${resource.departmentId}`
                    );
                }
                return hasAccess;

            case RoleScopeType.OWNED:
                if (!resource.userId) {
                    console.warn('Resource missing userId for OWNED scope check');
                    return true;
                }
                hasAccess = userId === resource.userId;
                if (!hasAccess) {
                    throw new ForbiddenException(
                        `You do not have access or manage this resource owned by user: ${resource.userId}`
                    );
                }
                return hasAccess;

            default:
                return false;
        }
    }

    /**
     * Get business days in a month of a given date
     */
    static getBusinessDaysInMonth(date: string | Date): number {
        const inputDate = this.ensureDate(date);
        
        // Create first and last day of the month
        const firstDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
        const lastDay = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0);
        
        // Calculate business days between these dates
        return this.getBusinessDays(firstDay, lastDay);
    }

    // Helper method to parse relations string into TypeORM relations object
    static parseRelations(relations: string): FindOptionsRelations<any> {
        const relationsObj: FindOptionsRelations<any> = {};
        
        relations.split(',').forEach(relation => {
            relation = relation.trim();
            if (!relation) return;
            
            if (relation.includes('.')) {
                // Handle nested relation (e.g., "comments.author")
                const parts = relation.split('.');
                let currentLevel = relationsObj;
                
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    
                    if (i === parts.length - 1) {
                        // Last part in the chain
                        currentLevel[part] = true;
                    } else {
                        // Create nested object if it doesn't exist
                        if (!currentLevel[part] || currentLevel[part] === true) {
                            currentLevel[part] = {};
                        }
                        // Move to next level in the object
                        currentLevel = currentLevel[part] as Record<string, any>;
                    }
                }
            } else {
                // Handle simple relation
                relationsObj[relation] = true;
            }
        });
        
        return relationsObj;
    }

    // Helper method to parse select string into TypeORM select object
    static parseSelect(select: string): FindOptionsSelect<any> {
        const selectObj: FindOptionsSelect<any> = {};
        
        select.split(',').forEach(field => {
            field = field.trim();
            if (!field) return;
            
            if (field.includes('.')) {
                // Handle nested selection (e.g., "profile.avatar")
                const parts = field.split('.');
                let currentLevel = selectObj;
                
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    
                    if (i === parts.length - 1) {
                        // Last part in the chain
                        currentLevel[part] = true;
                    } else {
                        // Create nested object if it doesn't exist
                        if (!currentLevel[part] || typeof currentLevel[part] === 'boolean') {
                            currentLevel[part] = {};
                        }
                        // Move to next level in the object
                        currentLevel = currentLevel[part] as Record<string, any>;
                    }
                }
            } else {
                // Handle simple field
                selectObj[field] = true;
            }
        });
        
        return selectObj;
    }

    // Helper method to check if a string is a valid email
    static isEmail(email: string): boolean {
        if (!email) return false;
        
        // Regular expression for email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        return emailRegex.test(email);
    }
}