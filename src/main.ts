import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig, swaggerCustomOptions } from './config/swagger.config';
import open from 'open';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appUrl = configService.get<string>('APP_URL');
  if (!appUrl) {
    throw new Error('APP_URL is not defined in the configuration');
  }
  const port = configService.get('PORT');
  if (!port) {
    throw new Error('PORT is not defined in the configuration');
  }

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());
  
  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // Enable CORS with more secure settings
  app.enableCors({
    origin: [appUrl], // specify allowed origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Use Helmet for security with best practices
  app.use(helmet());
  app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));

  // Rate limiting
  app.use(rateLimit({
    windowMs: configService.get<number>('RATE_LIMIT_WINDOW_MS') || 15 * 60 * 1000, // 15 minutes
    max: configService.get<number>('RATE_LIMIT_MAX') || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    headers: true,
  }));

  // Compression middleware
  app.use(compression());

  // HTTP request logger
  app.use(morgan('combined'));

  // Swagger Setup
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, swaggerCustomOptions);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);

  // Automatically open the browser to the Swagger API page
  await open(`${appUrl}/api`);
}
bootstrap();