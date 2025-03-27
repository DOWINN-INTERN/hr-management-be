import { FindOptionsRelations } from "typeorm";

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
            if (relation.trim()) {
            relationsObj[relation.trim()] = true;
            }
        });
        return relationsObj;
    }

    // Helper method to check if a string is a valid email
    static isEmail(email: string): boolean {
        if (!email) return false;
        
        // Regular expression for email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        return emailRegex.test(email);
    }
}