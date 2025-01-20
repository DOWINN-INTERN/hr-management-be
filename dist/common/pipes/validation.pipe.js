"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationPipe = void 0;
class ValidationPipe {
    transform(value, metadata) {
        // Implement validation logic here
        return value;
    }
    validate(value, metadata) {
        // Implement specific validation logic
    }
}
exports.ValidationPipe = ValidationPipe;
