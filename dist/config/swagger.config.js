"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerCustomOptions = exports.swaggerConfig = void 0;
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
// Initialize ConfigService
const configService = new config_1.ConfigService();
exports.swaggerConfig = new swagger_1.DocumentBuilder()
    .setTitle('Dowinn Management System API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'Authorization',
    description: 'Enter JWT token',
    in: 'header',
}, 'access-token')
    .addApiKey({
    type: 'apiKey',
    name: 'x-api-key',
    in: 'header',
    description: 'API key authentication',
}, 'api-key')
    .addServer(configService.get('APP_URL') || 'http://localhost:3000') // Use ConfigService to get server URL
    .addTag('Auth', 'Endpoints related to authentication') // Add tags for better organization
    .addTag('Users', 'Endpoints related to user management')
    .build();
exports.swaggerCustomOptions = {
    swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        displayRequestDuration: true,
    },
    customSiteTitle: 'API Documentation',
};
