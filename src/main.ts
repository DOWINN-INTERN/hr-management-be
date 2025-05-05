import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter'; // Correct import
import { ExpressAdapter } from '@bull-board/express'; // Correct import
import { getQueueToken } from '@nestjs/bull';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { getLogLevels } from './common/utils/day.util';
import { swaggerConfig, swaggerCustomOptions } from './config/swagger.config';
import { SystemLogger } from './modules/logs/system-logs/services/system-logger.service';

// process.env.TZ = 'UTC';

async function bootstrap() {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Create the app with our custom logger
  const app = await NestFactory.create(AppModule, {
    logger: getLogLevels(isDevelopment),
    bufferLogs: true, // Buffer logs until logger is set up
  });
  
  // Get the SystemLogger from our module
  const logger = await app.resolve(SystemLogger);
  app.useLogger(logger);
  
  const configService = app.get(ConfigService);

  // Dynamically get all queues from the queues.config.ts
  const { queues } = await import('./config/queues.config');
  
  // Set up Bull Board
  const serverAdapter = new ExpressAdapter();
  const bullAdapters = queues.map(queue => 
    new BullAdapter(app.get(getQueueToken(queue.name)))
  );
  
  createBullBoard({
    queues: bullAdapters,
    serverAdapter,
  });

  // Define the base path for Bull Board UI
  serverAdapter.setBasePath('/api/admin/queues');
  
  const port = configService.getOrThrow<number>('PORT');
  const appUrl = configService.getOrThrow<string>('APP_URL');
  const corsOrigins = configService.getOrThrow<string>('CORS_ORIGINS');
  
  // Rate Limit Settings
  const rateLimitWindowMs = configService.getOrThrow<number>('RATE_LIMIT_WINDOW_MS');
  const rateLimitMax = configService.getOrThrow<number>('RATE_LIMIT_MAX');
  
  // Set global prefix for all routes in the application
  app.setGlobalPrefix('/api');

  // Add Bull Board UI routes - place this AFTER helmet and BEFORE other routes
  app.use('/api/admin/queues', serverAdapter.getRouter());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that do not have any decorators
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    transformOptions: {
      enableImplicitConversion: true, // Allow implicit type conversion
    },
  }));

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Global logging interceptor (using our new logging interceptor)
  // app.useGlobalInterceptors(new LoggingInterceptor());

  // Global transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // Enable CORS with more secure settings
  app.enableCors({
    origin: true, // specify allowed origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // specify allowed HTTP methods
    credentials: true, // allow sending cookies from the frontend to the backend (for session cookies)
  });

  // Use Helmet for security with best practices
  app.use(helmet()); // Sets appropriate HTTP headers for security
  app.use(helmet.referrerPolicy({ policy: 'no-referrer' })); // when following a link, do not send the Referer header to other sites (privacy)

  // Rate limiting
  app.use(rateLimit({
    windowMs: rateLimitWindowMs, // 15 * 60 * 1000, // 15 minutes
    max: rateLimitMax , // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    headers: true,
  }));

  app.use((req: any, res: { removeHeader: (arg0: string) => void; }, next: () => void) => {
    res.removeHeader('Cross-Origin-Opener-Policy');
    res.removeHeader('Origin-Agent-Cluster');
    res.removeHeader('Content-Security-Policy');
    next();
  });

  // Compression middleware
  app.use(compression()); // Compress all responses to reduce the size of the response body and increase the speed of a web application

  // HTTP request logger
  // app.use(morgan('combined')); // Log HTTP requests with the Apache combined format (combined is the most common format) to the console

  // Swagger Setup
  const document = SwaggerModule.createDocument(app, swaggerConfig); // Create a Swagger document
  SwaggerModule.setup('api', app, document, swaggerCustomOptions); // Set up the Swagger module

  // Scalar Setup
  app.use(
    '/reference',
    apiReference({
      content: document,
    }),
  )

  await app.listen(port, '0.0.0.0'); // Listen on all network interfaces (LAN)
  logger.log(`Application is running on: ${appUrl}/api`, 'Main');
  logger.log(`API Reference available at: ${appUrl}/reference`, 'Main');
  logger.log(`Queue monitoring available at: ${appUrl}/api/admin/queues`, 'Main');
}
bootstrap();