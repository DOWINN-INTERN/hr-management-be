"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilityHelper = void 0;
class UtilityHelper {
    static isEmpty(value) {
        return value === null || value === undefined || value === '';
    }
    static isEmailValid(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    static hashPassword(password) {
        // Implement password hashing logic here (e.g., using bcrypt)
        return password; // Placeholder, replace with actual hashing
    }
    static comparePasswords(plainPassword, hashedPassword) {
        // Implement password comparison logic here (e.g., using bcrypt)
        return plainPassword === hashedPassword; // Placeholder, replace with actual comparison
    }
}
exports.UtilityHelper = UtilityHelper;
