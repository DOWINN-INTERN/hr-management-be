"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
/**
 * HttpExceptionFilter is a global filter that handles all exceptions thrown in the application.
 * It logs the error details, sanitizes sensitive information, and sends a user-friendly response to the client.
 */
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
        this.errorCount = new Map();
        this.SENSITIVE_PATTERNS = [
            /password/i,
            /token/i,
            /credit.?card/i,
            /secret/i,
            /ssn/i,
            /social.?security.?number/i,
            /api.?key/i,
            /private.?key/i,
            /pin/i,
            /passcode/i
        ];
    }
    /**
     * Catches and handles exceptions thrown in the application.
     * @param exception - The exception that was thrown.
     * @param host - The arguments host containing request and response objects.
     */
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const traceId = crypto.randomUUID();
        // Determine error details
        const status = this.getHttpStatus(exception);
        const error = this.normalizeError(exception);
        const timestamp = new Date().toISOString();
        // Track error frequency
        const clientIp = request.ip || 'unknown';
        this.trackErrorFrequency(clientIp, status);
        // Log error with context
        this.logError({
            traceId,
            timestamp,
            path: request.url,
            method: request.method,
            status,
            error: error.message,
            ip: clientIp,
            headers: this.sanitizeHeaders(request.headers),
            stack: this.sanitizeStackTrace(error.stack),
        });
        // Prepare client response
        const clientResponse = Object.assign({ statusCode: status, timestamp,
            traceId, path: request.url, message: this.getClientMessage(error.message, status) }, (process.env.NODE_ENV === 'development' && {
            detail: error.message,
            stack: error.stack,
        }));
        response.status(status).json(clientResponse);
    }
    /**
     * Determines the HTTP status code from the exception.
     * @param exception - The exception to evaluate.
     * @returns The HTTP status code.
     */
    getHttpStatus(exception) {
        if (exception instanceof common_1.HttpException) {
            return exception.getStatus();
        }
        return common_1.HttpStatus.INTERNAL_SERVER_ERROR;
    }
    /**
     * Normalizes the exception to an Error object.
     * @param exception - The exception to normalize.
     * @returns The normalized Error object.
     */
    normalizeError(exception) {
        if (exception instanceof Error) {
            return exception;
        }
        return new Error(String(exception));
    }
    /**
     * Sanitizes sensitive headers from the request.
     * @param headers - The headers to sanitize.
     * @returns The sanitized headers.
     */
    sanitizeHeaders(headers) {
        const sanitized = Object.assign({}, headers);
        const sensitiveHeaders = ['authorization', 'cookie', 'x-auth-token'];
        sensitiveHeaders.forEach(header => {
            if (header in sanitized) {
                sanitized[header] = '[REDACTED]';
            }
        });
        return sanitized;
    }
    /**
     * Sanitizes the stack trace to remove unnecessary lines.
     * @param stack - The stack trace to sanitize.
     * @returns The sanitized stack trace.
     */
    sanitizeStackTrace(stack) {
        if (!stack || process.env.NODE_ENV === 'production') {
            return undefined;
        }
        return stack
            .split('\n')
            .filter(line => !line.includes('node_modules'))
            .join('\n');
    }
    /**
     * Generates a user-friendly message for the client.
     * @param message - The original error message.
     * @param status - The HTTP status code.
     * @returns The user-friendly message.
     */
    getClientMessage(message, status) {
        if (status >= 500) {
            return 'An internal server error occurred';
        }
        return this.sanitizeSensitiveData(message);
    }
    /**
     * Sanitizes sensitive data in the error message.
     * @param message - The message to sanitize.
     * @returns The sanitized message.
     */
    sanitizeSensitiveData(message) {
        let sanitized = message;
        this.SENSITIVE_PATTERNS.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '[REDACTED]');
        });
        return sanitized;
    }
    /**
     * Tracks the frequency of errors from a specific IP address.
     * @param ip - The IP address of the client.
     * @param status - The HTTP status code of the error.
     */
    trackErrorFrequency(ip, status) {
        const key = `${ip}:${status}`;
        const count = (this.errorCount.get(key) || 0) + 1;
        this.errorCount.set(key, count);
        if (count > 10) {
            this.logger.warn({
                type: 'POTENTIAL_ATTACK',
                ip,
                errorCount: count,
                status,
            });
        }
    }
    /**
     * Logs the error details.
     * @param errorContext - The context of the error to log.
     */
    logError(errorContext) {
        if (errorContext.status >= 500) {
            this.logger.error(errorContext);
        }
        else {
            this.logger.warn(errorContext);
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
