"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const swagger_config_1 = require("./config/swagger.config");
const open_1 = __importDefault(require("open"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const appUrl = configService.get('APP_URL');
    if (!appUrl) {
        throw new Error('APP_URL is not defined in the configuration');
    }
    const port = configService.get('PORT');
    if (!port) {
        throw new Error('PORT is not defined in the configuration');
    }
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe());
    // Global exception filter
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    // Global logging interceptor
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    // Enable CORS with more secure settings
    app.enableCors({
        origin: [appUrl], // specify allowed origins
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    // Use Helmet for security with best practices
    app.use((0, helmet_1.default)());
    app.use(helmet_1.default.referrerPolicy({ policy: 'no-referrer' }));
    // Rate limiting
    app.use((0, express_rate_limit_1.default)({
        windowMs: configService.get('RATE_LIMIT_WINDOW_MS') || 15 * 60 * 1000, // 15 minutes
        max: configService.get('RATE_LIMIT_MAX') || 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        headers: true,
    }));
    // Compression middleware
    app.use((0, compression_1.default)());
    // HTTP request logger
    app.use((0, morgan_1.default)('combined'));
    // Swagger Setup
    const document = swagger_1.SwaggerModule.createDocument(app, swagger_config_1.swaggerConfig);
    swagger_1.SwaggerModule.setup('api', app, document, swagger_config_1.swaggerCustomOptions);
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
    // Automatically open the browser to the Swagger API page
    await (0, open_1.default)(`${appUrl}/api`);
}
bootstrap();
