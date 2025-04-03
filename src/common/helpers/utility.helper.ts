import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

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