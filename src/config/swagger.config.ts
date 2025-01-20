import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

// Initialize ConfigService
const configService = new ConfigService();

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Dowinn Management System API')
  .setDescription('API Documentation')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header',
    },
    'access-token',
  )
  .addApiKey(
    {
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
      description: 'API key authentication',
    },
    'api-key',
  )
  .addServer(configService.get<string>('APP_URL') || 'http://localhost:3000') // Use ConfigService to get server URL
  .addTag('Auth', 'Endpoints related to authentication') // Add tags for better organization
  .addTag('Users', 'Endpoints related to user management')
  .build();

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    displayRequestDuration: true,
  },
  customSiteTitle: 'API Documentation',
};