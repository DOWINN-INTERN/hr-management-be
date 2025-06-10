import { Role } from "@/modules/employee-management/roles/entities/role.entity";
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
        
        for (const role of roles) {
            const roleScope = role.scope || RoleScopeType.OWNED;
            
            if (roleScope === RoleScopeType.GLOBAL) {
            return role;
            }
            
            if (this.isBroaderScope(roleScope, effectiveScopeType)) {
                effectiveScopeType = roleScope;
            }
        }
        
        return roles[0];
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