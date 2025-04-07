import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';
import { networkInterfaces } from 'os';

// Initialize ConfigService
const configService = new ConfigService();

// Get local IP address
export const getLocalIpAddress = (): string => {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      // Skip over non-IPv4 and internal (loopback) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost'; // Fallback
};

const localIp = getLocalIpAddress();
const port = configService.get<string>('PORT') || '3000';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Dowinn HR Management System API')
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
  .addServer(configService.getOrThrow<string>('APP_URL'), "Local Development Server")
  .addServer(`http://${localIp}:${port}`, "LAN Development Server") // Use ConfigService to get server URL
  .build();

export const swaggerCustomOptions: SwaggerCustomOptions = {
  explorer: true,
  customSiteTitle: 'HR Management System',
  customCssUrl: '/swagger/theme-flattop.css',
  customCss: '',
  customJs: '',
  customfavIcon: '',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    displayRequestDuration: true,
    supportedSubmitMethods: ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'],
    // Disable CSP
    defaultModelsExpandDepth: -1,
    defaultModelExpandDepth: 1,
    csp: false,  // This disables Content Security Policy
    tagGroups: [
      {
        name: 'Account Management',
        tags: ['Auth', 'Users', 'Profile', 'Sessions'],
      },
      {
        name: 'Employee Management',
        tags: ['Employees', 'Roles', 'Permissions'],
      }
    ]
  }
};
