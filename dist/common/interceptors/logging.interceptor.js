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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const crypto = __importStar(require("crypto"));
/**
 * LoggingInterceptor is a NestJS interceptor that logs HTTP requests and responses.
 * It also sanitizes sensitive data and adds a correlation ID to each request and response.
 */
let LoggingInterceptor = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger('HTTP');
        this.SENSITIVE_FIELDS = ['password', 'token', 'authorization', 'creditCard'];
        this.ALLOWED_HEADERS = ['user-agent', 'content-type', 'accept', 'origin'];
    }
    /**
     * Intercepts HTTP requests and responses to log relevant information.
     * @param context - The execution context of the request.
     * @param next - The next handler in the request pipeline.
     * @returns An observable of the response.
     */
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const correlationId = request.headers['x-correlation-id'] || crypto.randomUUID();
        const startTime = Date.now();
        // Set correlation ID in response headers
        response.setHeader('x-correlation-id', correlationId);
        // Log request
        this.logger.log({
            type: 'REQUEST',
            correlationId,
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.originalUrl,
            query: this.sanitizeData(request.query),
            body: this.sanitizeData(request.body),
            headers: this.filterHeaders(request.headers),
            ip: request.ip,
            userAgent: request.get('user-agent'),
        });
        return next.handle().pipe((0, operators_1.tap)((responseBody) => {
            this.logResponse(correlationId, startTime, response.statusCode, responseBody);
        }), (0, operators_1.catchError)((error) => {
            this.logError(correlationId, startTime, error);
            throw error;
        }));
    }
    /**
     * Sanitizes sensitive data in the request body or query parameters.
     * @param data - The data to sanitize.
     * @returns The sanitized data.
     */
    sanitizeData(data) {
        if (!data)
            return data;
        const sanitized = Object.assign({}, data);
        const sanitizeObject = (obj) => {
            for (const key in obj) {
                if (this.SENSITIVE_FIELDS.includes(key.toLowerCase())) {
                    obj[key] = '[REDACTED]';
                }
                else if (typeof obj[key] === 'object') {
                    sanitizeObject(obj[key]);
                }
            }
        };
        sanitizeObject(sanitized);
        return sanitized;
    }
    /**
     * Filters headers to include only allowed headers.
     * @param headers - The headers to filter.
     * @returns The filtered headers.
     */
    filterHeaders(headers) {
        return Object.keys(headers)
            .filter(key => this.ALLOWED_HEADERS.includes(key.toLowerCase()))
            .reduce((obj, key) => {
            obj[key] = headers[key];
            return obj;
        }, {});
    }
    /**
     * Logs the response details.
     * @param correlationId - The correlation ID of the request.
     * @param startTime - The start time of the request.
     * @param statusCode - The HTTP status code of the response.
     * @param body - The response body.
     */
    logResponse(correlationId, startTime, statusCode, body) {
        this.logger.log({
            type: 'RESPONSE',
            correlationId,
            timestamp: new Date().toISOString(),
            duration: `${Date.now() - startTime}ms`,
            statusCode,
            responseSize: JSON.stringify(body).length,
            success: statusCode < 400,
        });
    }
    /**
     * Logs the error details.
     * @param correlationId - The correlation ID of the request.
     * @param startTime - The start time of the request.
     * @param error - The error object.
     */
    logError(correlationId, startTime, error) {
        this.logger.error({
            type: 'ERROR',
            correlationId,
            timestamp: new Date().toISOString(),
            duration: `${Date.now() - startTime}ms`,
            statusCode: error.status || 500,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
