/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const nestjs_api_reference_1 = __webpack_require__(5);
const compression_1 = __importDefault(__webpack_require__(6));
const express_rate_limit_1 = __importDefault(__webpack_require__(7));
const helmet_1 = __importDefault(__webpack_require__(8));
const morgan_1 = __importDefault(__webpack_require__(9));
const app_module_1 = __webpack_require__(10);
const http_exception_filter_1 = __webpack_require__(247);
const logging_interceptor_1 = __webpack_require__(248);
const transform_interceptor_1 = __webpack_require__(249);
const swagger_config_1 = __webpack_require__(250);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.getOrThrow('PORT');
    const appUrl = configService.getOrThrow('APP_URL');
    const corsOrigins = configService.getOrThrow('CORS_ORIGINS');
    // Rate Limit Settings
    const rateLimitWindowMs = configService.getOrThrow('RATE_LIMIT_WINDOW_MS');
    const rateLimitMax = configService.getOrThrow('RATE_LIMIT_MAX');
    // Set global prefix for all routes in the application
    app.setGlobalPrefix('/api');
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true, // Strip properties that do not have any decorators
        forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
        transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
        transformOptions: {
            enableImplicitConversion: true, // Allow implicit type conversion
        },
    }));
    // Global exception filter
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    // Global logging interceptor
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    // Global transform interceptor
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    // Enable CORS with more secure settings
    app.enableCors({
        origin: true, // specify allowed origins
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // specify allowed HTTP methods
        credentials: true, // allow sending cookies from the frontend to the backend (for session cookies)
    });
    // Use Helmet for security with best practices
    app.use((0, helmet_1.default)()); // Sets appropriate HTTP headers for security
    app.use(helmet_1.default.referrerPolicy({ policy: 'no-referrer' })); // when following a link, do not send the Referer header to other sites (privacy)
    // Rate limiting
    app.use((0, express_rate_limit_1.default)({
        windowMs: rateLimitWindowMs, // 15 * 60 * 1000, // 15 minutes
        max: rateLimitMax, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        headers: true,
    }));
    app.use((req, res, next) => {
        res.removeHeader('Cross-Origin-Opener-Policy');
        res.removeHeader('Origin-Agent-Cluster');
        res.removeHeader('Content-Security-Policy');
        next();
    });
    // Compression middleware
    app.use((0, compression_1.default)()); // Compress all responses to reduce the size of the response body and increase the speed of a web application
    // HTTP request logger
    app.use((0, morgan_1.default)('combined')); // Log HTTP requests with the Apache combined format (combined is the most common format) to the console
    // Swagger Setup
    const document = swagger_1.SwaggerModule.createDocument(app, swagger_config_1.swaggerConfig); // Create a Swagger document
    swagger_1.SwaggerModule.setup('api', app, document, swagger_config_1.swaggerCustomOptions); // Set up the Swagger module
    // Scalar Setup - Make sure to install @scalar/nestjs-api-reference package
    app.use('/reference', (0, nestjs_api_reference_1.apiReference)({
        content: document,
    }));
    await app.listen(port, '0.0.0.0'); // Listen on all network interfaces (LAN)
    console.log(`Application is running on: ${appUrl}/api`);
}
bootstrap();


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@scalar/nestjs-api-reference");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("compression");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("express-rate-limit");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("morgan");

/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(1);
const common_module_1 = __webpack_require__(11);
const config_module_1 = __webpack_require__(84);
const database_module_1 = __webpack_require__(87);
const account_management_module_1 = __webpack_require__(88);
const addresses_module_1 = __webpack_require__(129);
const attendance_management_module_1 = __webpack_require__(131);
const biometrics_module_1 = __webpack_require__(146);
const documents_module_1 = __webpack_require__(162);
const employee_management_module_1 = __webpack_require__(89);
const files_module_1 = __webpack_require__(170);
const logs_module_1 = __webpack_require__(186);
const notifications_module_1 = __webpack_require__(188);
const organization_management_module_1 = __webpack_require__(194);
const payroll_management_module_1 = __webpack_require__(206);
const schedule_management_module_1 = __webpack_require__(220);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            database_module_1.DatabaseModule,
            common_module_1.CommonModule,
            logs_module_1.LogsModule,
            files_module_1.FilesModule,
            notifications_module_1.NotificationsModule,
            documents_module_1.DocumentsModule,
            employee_management_module_1.EmployeeManagementModule,
            account_management_module_1.AccountManagementModule,
            organization_management_module_1.OrganizationManagementModule,
            attendance_management_module_1.AttendanceManagementModule,
            schedule_management_module_1.ScheduleManagementModule,
            addresses_module_1.AddressesModule,
            documents_module_1.DocumentsModule,
            biometrics_module_1.BiometricsModule,
            payroll_management_module_1.PayrollManagementModule
        ],
        controllers: [],
    })
], AppModule);


/***/ }),
/* 11 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommonModule = void 0;
const common_1 = __webpack_require__(1);
const users_module_1 = __webpack_require__(12);
const common_service_1 = __webpack_require__(83);
const transaction_service_1 = __webpack_require__(69);
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule],
        providers: [
            common_service_1.CommonService, transaction_service_1.TransactionService
        ],
        exports: [common_service_1.CommonService, transaction_service_1.TransactionService],
    })
], CommonModule);


/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersModule = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(13);
const user_entity_1 = __webpack_require__(14);
const users_controller_1 = __webpack_require__(51);
const users_service_1 = __webpack_require__(63);
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]), config_1.ConfigModule],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);


/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 14 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const document_entity_1 = __webpack_require__(15);
const employee_entity_1 = __webpack_require__(27);
const activity_logs_entity_1 = __webpack_require__(45);
const notification_entity_1 = __webpack_require__(47);
const typeorm_1 = __webpack_require__(17);
const base_entity_1 = __webpack_require__(16);
const profile_entity_1 = __webpack_require__(39);
const session_entity_1 = __webpack_require__(50);
let User = class User extends base_entity_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.lockedOut = false;
        // @OneToMany(() => SocialLogin, (socialLogin) => socialLogin.user)
        // socialLogins?: SocialLogin[];
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "userName", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => profile_entity_1.Profile, (profile) => profile.user, { cascade: true }),
    __metadata("design:type", typeof (_a = typeof profile_entity_1.Profile !== "undefined" && profile_entity_1.Profile) === "function" ? _a : Object)
], User.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], User.prototype, "lastLogin", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "emailVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "phoneNumberVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "accessFailedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "lockoutEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], User.prototype, "lockedOut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], User.prototype, "lockOutStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], User.prototype, "lockOutEnd", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => session_entity_1.Session, (session) => session.user),
    __metadata("design:type", Array)
], User.prototype, "sessions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => activity_logs_entity_1.ActivityLog, (activityLog) => activityLog.actor),
    __metadata("design:type", Array)
], User.prototype, "activityLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => document_entity_1.Document, (document) => document.user),
    __metadata("design:type", Array)
], User.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => employee_entity_1.Employee, (employee) => employee.user),
    __metadata("design:type", typeof (_e = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _e : Object)
], User.prototype, "employee", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);


/***/ }),
/* 15 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Document = void 0;
const base_entity_1 = __webpack_require__(16);
const user_entity_1 = __webpack_require__(14);
const schedule_change_request_entity_1 = __webpack_require__(18);
const typeorm_1 = __webpack_require__(17);
const document_type_entity_1 = __webpack_require__(44);
let Document = class Document extends base_entity_1.BaseEntity {
};
exports.Document = Document;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Document.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Document.prototype, "fileKey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Document.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Document.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.documents, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], Document.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => document_type_entity_1.DocumentType, (doctype) => doctype.documents),
    (0, typeorm_1.JoinColumn)({ name: 'documentTypeId' }),
    __metadata("design:type", typeof (_b = typeof document_type_entity_1.DocumentType !== "undefined" && document_type_entity_1.DocumentType) === "function" ? _b : Object)
], Document.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => schedule_change_request_entity_1.ScheduleChangeRequest, (scheduleChangeRequest) => scheduleChangeRequest.documents),
    (0, typeorm_1.JoinColumn)({ name: 'scheduleChangeRequestId' }),
    __metadata("design:type", typeof (_c = typeof schedule_change_request_entity_1.ScheduleChangeRequest !== "undefined" && schedule_change_request_entity_1.ScheduleChangeRequest) === "function" ? _c : Object)
], Document.prototype, "scheduleChangeRequest", void 0);
exports.Document = Document = __decorate([
    (0, typeorm_1.Entity)('documents')
], Document);


/***/ }),
/* 16 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseEntity = void 0;
const typeorm_1 = __webpack_require__(17);
class BaseEntity extends typeorm_1.BaseEntity {
    constructor(item) {
        super();
        Object.assign(this, item);
    }
}
exports.BaseEntity = BaseEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BaseEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], BaseEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], BaseEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BaseEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BaseEntity.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], BaseEntity.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BaseEntity.prototype, "deletedBy", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], BaseEntity.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)("idx_organization"),
    __metadata("design:type", String)
], BaseEntity.prototype, "organizationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)("idx_branch"),
    __metadata("design:type", String)
], BaseEntity.prototype, "branchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)("idx_department"),
    __metadata("design:type", String)
], BaseEntity.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)("idx_user"),
    __metadata("design:type", String)
], BaseEntity.prototype, "userId", void 0);


/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 18 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleChangeRequest = void 0;
const schedule_change_request_status_enum_1 = __webpack_require__(19);
const schedule_change_request_type_enum_1 = __webpack_require__(20);
const base_entity_1 = __webpack_require__(16);
const document_entity_1 = __webpack_require__(15);
const typeorm_1 = __webpack_require__(17);
const schedule_entity_1 = __webpack_require__(21);
const schedule_change_response_entity_1 = __webpack_require__(43);
let ScheduleChangeRequest = class ScheduleChangeRequest extends base_entity_1.BaseEntity {
};
exports.ScheduleChangeRequest = ScheduleChangeRequest;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ScheduleChangeRequest.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: schedule_change_request_status_enum_1.ScheduleChangeRequestStatus, default: schedule_change_request_status_enum_1.ScheduleChangeRequestStatus.PENDING }),
    __metadata("design:type", typeof (_a = typeof schedule_change_request_status_enum_1.ScheduleChangeRequestStatus !== "undefined" && schedule_change_request_status_enum_1.ScheduleChangeRequestStatus) === "function" ? _a : Object)
], ScheduleChangeRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: schedule_change_request_type_enum_1.ScheduleChangeRequestType }),
    __metadata("design:type", typeof (_b = typeof schedule_change_request_type_enum_1.ScheduleChangeRequestType !== "undefined" && schedule_change_request_type_enum_1.ScheduleChangeRequestType) === "function" ? _b : Object)
], ScheduleChangeRequest.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => schedule_entity_1.Schedule, (schedule) => schedule.scheduleChangeRequests),
    __metadata("design:type", Array)
], ScheduleChangeRequest.prototype, "schedule", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => document_entity_1.Document, (document) => document.scheduleChangeRequest),
    __metadata("design:type", Array)
], ScheduleChangeRequest.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => schedule_change_response_entity_1.ScheduleChangeResponse, (scheduleChangeResponse) => scheduleChangeResponse.scheduleChangeRequest),
    (0, typeorm_1.JoinColumn)({ name: 'scheduleChangeResponseId' }),
    __metadata("design:type", typeof (_c = typeof schedule_change_response_entity_1.ScheduleChangeResponse !== "undefined" && schedule_change_response_entity_1.ScheduleChangeResponse) === "function" ? _c : Object)
], ScheduleChangeRequest.prototype, "scheduleChangeResponse", void 0);
exports.ScheduleChangeRequest = ScheduleChangeRequest = __decorate([
    (0, typeorm_1.Entity)('schedule-change-requests')
], ScheduleChangeRequest);


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleChangeRequestStatus = void 0;
var ScheduleChangeRequestStatus;
(function (ScheduleChangeRequestStatus) {
    ScheduleChangeRequestStatus["PENDING"] = "PENDING";
    ScheduleChangeRequestStatus["APPROVED"] = "APPROVED";
    ScheduleChangeRequestStatus["REJECTED"] = "REJECTED";
})(ScheduleChangeRequestStatus || (exports.ScheduleChangeRequestStatus = ScheduleChangeRequestStatus = {}));


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleChangeRequestType = void 0;
var ScheduleChangeRequestType;
(function (ScheduleChangeRequestType) {
    // Request for general time off from scheduled work
    ScheduleChangeRequestType["TIME_OFF"] = "TIME_OFF";
    // Request to modify the timing or duration of an existing shift
    ScheduleChangeRequestType["SHIFT_CHANGE"] = "SHIFT_CHANGE";
    // Request to work beyond regular scheduled hours
    ScheduleChangeRequestType["OVERTIME"] = "OVERTIME";
    // Request for time off due to illness or medical reasons
    ScheduleChangeRequestType["SICK_LEAVE"] = "SICK_LEAVE";
    // Request for time off for personal reasons
    ScheduleChangeRequestType["PERSONAL_LEAVE"] = "PERSONAL_LEAVE";
    // Request for time off due to bereavement or loss
    ScheduleChangeRequestType["BEREAVEMENT"] = "BEREAVEMENT";
    // Request for time off for maternity or paternity leave
    ScheduleChangeRequestType["MATERNITY_PATERNITY_LEAVE"] = "MATERNITY_PATERNITY_LEAVE";
    // Request for time off for jury duty or legal obligations
    ScheduleChangeRequestType["JURY_DUTY"] = "JURY_DUTY";
    // Request for time off for religious observances
    ScheduleChangeRequestType["RELIGIOUS_OBSERVANCE"] = "RELIGIOUS_OBSERVANCE";
    // Request for time off for family-related matters
    ScheduleChangeRequestType["FAMILY_LEAVE"] = "FAMILY_LEAVE";
    // Request for time off for educational purposes
    ScheduleChangeRequestType["EDUCATIONAL_LEAVE"] = "EDUCATIONAL_LEAVE";
    // Request for time off for relocation or moving
    ScheduleChangeRequestType["RELOCATION"] = "RELOCATION";
    // Request for time off for parental leave
    ScheduleChangeRequestType["PARENTAL_LEAVE"] = "PARENTAL_LEAVE";
    // Request for time off for bereavement or loss of a family member
    ScheduleChangeRequestType["FAMILY_BEREAVEMENT"] = "FAMILY_BEREAVEMENT";
    // Request for time off for personal emergencies
    ScheduleChangeRequestType["PERSONAL_EMERGENCY"] = "PERSONAL_EMERGENCY";
    // Request for business travel or work-related trips
    ScheduleChangeRequestType["BUSINESS_TRAVEL"] = "BUSINESS_TRAVEL";
    // Request for scheduled time off for vacation purposes
    ScheduleChangeRequestType["VACATION"] = "VACATION";
    // Request for time allocation for training or development activities
    ScheduleChangeRequestType["TRAINING"] = "TRAINING";
    // Any other type of schedule change request not covered by specific categories
    ScheduleChangeRequestType["OTHER"] = "OTHER";
})(ScheduleChangeRequestType || (exports.ScheduleChangeRequestType = ScheduleChangeRequestType = {}));


/***/ }),
/* 21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Schedule = void 0;
const schedule_status_1 = __webpack_require__(22);
const base_entity_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(17);
const holiday_entity_1 = __webpack_require__(23);
const schedule_change_request_entity_1 = __webpack_require__(18);
const shift_entity_1 = __webpack_require__(25);
let Schedule = class Schedule extends base_entity_1.BaseEntity {
};
exports.Schedule = Schedule;
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Schedule.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Schedule.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: schedule_status_1.ScheduleStatus, default: schedule_status_1.ScheduleStatus.DEFAULT }),
    __metadata("design:type", typeof (_b = typeof schedule_status_1.ScheduleStatus !== "undefined" && schedule_status_1.ScheduleStatus) === "function" ? _b : Object)
], Schedule.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shift_entity_1.Shift, (shift) => shift.schedules),
    (0, typeorm_1.JoinColumn)({ name: 'shiftId' }),
    __metadata("design:type", typeof (_c = typeof shift_entity_1.Shift !== "undefined" && shift_entity_1.Shift) === "function" ? _c : Object)
], Schedule.prototype, "shift", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => holiday_entity_1.Holiday, (holiday) => holiday.schedule),
    (0, typeorm_1.JoinColumn)({ name: 'holidayId' }),
    __metadata("design:type", typeof (_d = typeof holiday_entity_1.Holiday !== "undefined" && holiday_entity_1.Holiday) === "function" ? _d : Object)
], Schedule.prototype, "holiday", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => schedule_change_request_entity_1.ScheduleChangeRequest, (scheduleChangeRequest) => scheduleChangeRequest.schedule),
    __metadata("design:type", Array)
], Schedule.prototype, "scheduleChangeRequests", void 0);
exports.Schedule = Schedule = __decorate([
    (0, typeorm_1.Entity)('schedules')
], Schedule);


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleStatus = void 0;
var ScheduleStatus;
(function (ScheduleStatus) {
    ScheduleStatus["DEFAULT"] = "DEFAULT";
    ScheduleStatus["HOLIDAY"] = "HOLIDAY";
    ScheduleStatus["REST_DAY"] = "REST_DAY";
    ScheduleStatus["MODIFIED"] = "MODIFIED";
    ScheduleStatus["LEAVE"] = "LEAVE";
})(ScheduleStatus || (exports.ScheduleStatus = ScheduleStatus = {}));


/***/ }),
/* 23 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Holiday = void 0;
const holiday_type_enum_1 = __webpack_require__(24);
const base_entity_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(17);
const schedule_entity_1 = __webpack_require__(21);
let Holiday = class Holiday extends base_entity_1.BaseEntity {
};
exports.Holiday = Holiday;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Holiday.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Holiday.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: holiday_type_enum_1.HolidayType }),
    __metadata("design:type", typeof (_a = typeof holiday_type_enum_1.HolidayType !== "undefined" && holiday_type_enum_1.HolidayType) === "function" ? _a : Object)
], Holiday.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => schedule_entity_1.Schedule, (schedule) => schedule.holiday),
    (0, typeorm_1.JoinColumn)({ name: 'scheduleId' }),
    __metadata("design:type", typeof (_b = typeof schedule_entity_1.Schedule !== "undefined" && schedule_entity_1.Schedule) === "function" ? _b : Object)
], Holiday.prototype, "schedule", void 0);
exports.Holiday = Holiday = __decorate([
    (0, typeorm_1.Entity)('holidays')
], Holiday);


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HolidayType = void 0;
var HolidayType;
(function (HolidayType) {
    HolidayType["REGULAR"] = "REGULAR";
    HolidayType["SPECIAL_NON_WORKING"] = "SPECIAL_NON_WORKING";
    HolidayType["SPECIAL_WORKING"] = "SPECIAL_WORKING";
    HolidayType["LOCAL"] = "LOCAL";
})(HolidayType || (exports.HolidayType = HolidayType = {}));


/***/ }),
/* 25 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Shift = void 0;
const base_entity_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(17);
const schedule_entity_1 = __webpack_require__(21);
const group_entity_1 = __webpack_require__(26);
let Shift = class Shift extends base_entity_1.BaseEntity {
};
exports.Shift = Shift;
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], Shift.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], Shift.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Shift.prototype, "breakTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Shift.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-array',
    }),
    __metadata("design:type", Array)
], Shift.prototype, "days", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_entity_1.Group, (group) => group.shift),
    __metadata("design:type", Array)
], Shift.prototype, "groups", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => schedule_entity_1.Schedule, (schedule) => schedule.shift),
    __metadata("design:type", Array)
], Shift.prototype, "schedules", void 0);
exports.Shift = Shift = __decorate([
    (0, typeorm_1.Entity)('shifts')
], Shift);


/***/ }),
/* 26 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Group = void 0;
const base_entity_1 = __webpack_require__(16);
const employee_entity_1 = __webpack_require__(27);
const typeorm_1 = __webpack_require__(17);
const shift_entity_1 = __webpack_require__(25);
let Group = class Group extends base_entity_1.BaseEntity {
};
exports.Group = Group;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Group.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Group.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => employee_entity_1.Employee, (employee) => employee.group),
    __metadata("design:type", Array)
], Group.prototype, "employees", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shift_entity_1.Shift, (shift) => shift.groups),
    (0, typeorm_1.JoinColumn)({ name: 'shiftId' }),
    __metadata("design:type", typeof (_a = typeof shift_entity_1.Shift !== "undefined" && shift_entity_1.Shift) === "function" ? _a : Object)
], Group.prototype, "shift", void 0);
exports.Group = Group = __decorate([
    (0, typeorm_1.Entity)('groups')
], Group);


/***/ }),
/* 27 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Employee = void 0;
const employment_condition_enum_1 = __webpack_require__(28);
const employment_status_enum_1 = __webpack_require__(29);
const employment_type_enum_1 = __webpack_require__(30);
const base_entity_1 = __webpack_require__(16);
const user_entity_1 = __webpack_require__(14);
const role_entity_1 = __webpack_require__(31);
const payroll_item_entity_1 = __webpack_require__(40);
const group_entity_1 = __webpack_require__(26);
const typeorm_1 = __webpack_require__(17);
let Employee = class Employee extends base_entity_1.BaseEntity {
    get dailyRate() {
        return Number(this.monthlyRate) / 20;
    }
};
exports.Employee = Employee;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Employee.prototype, "employeeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: employment_status_enum_1.EmploymentStatus,
        default: employment_status_enum_1.EmploymentStatus.PENDING
    }),
    __metadata("design:type", typeof (_a = typeof employment_status_enum_1.EmploymentStatus !== "undefined" && employment_status_enum_1.EmploymentStatus) === "function" ? _a : Object)
], Employee.prototype, "employmentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: employment_condition_enum_1.EmploymentCondition,
        default: employment_condition_enum_1.EmploymentCondition.PROBATIONARY
    }),
    __metadata("design:type", typeof (_b = typeof employment_condition_enum_1.EmploymentCondition !== "undefined" && employment_condition_enum_1.EmploymentCondition) === "function" ? _b : Object)
], Employee.prototype, "employmentCondition", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Employee.prototype, "biometricsRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Employee.prototype, "cardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: employment_type_enum_1.EmploymentType,
        default: employment_type_enum_1.EmploymentType.FULL_TIME
    }),
    __metadata("design:type", typeof (_c = typeof employment_type_enum_1.EmploymentType !== "undefined" && employment_type_enum_1.EmploymentType) === "function" ? _c : Object)
], Employee.prototype, "employmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], Employee.prototype, "commencementDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true, default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "leaveCredits", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.employee),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", typeof (_e = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _e : Object)
], Employee.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => role_entity_1.Role, (role) => role.employees, { nullable: true, cascade: true }),
    (0, typeorm_1.JoinTable)({
        name: 'employee_roles',
        joinColumn: { name: 'employee_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Employee.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payroll_item_entity_1.PayrollItem, (payrollItem) => payrollItem.employee),
    __metadata("design:type", Array)
], Employee.prototype, "payrollItems", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => group_entity_1.Group, (group) => group.employees, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'groupId' }),
    __metadata("design:type", typeof (_f = typeof group_entity_1.Group !== "undefined" && group_entity_1.Group) === "function" ? _f : Object)
], Employee.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Employee.prototype, "monthlyRate", void 0);
exports.Employee = Employee = __decorate([
    (0, typeorm_1.Entity)('employees')
], Employee);


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmploymentCondition = void 0;
var EmploymentCondition;
(function (EmploymentCondition) {
    EmploymentCondition["PROBATIONARY"] = "probationary";
    EmploymentCondition["REGULAR"] = "regular";
})(EmploymentCondition || (exports.EmploymentCondition = EmploymentCondition = {}));


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmploymentStatus = void 0;
var EmploymentStatus;
(function (EmploymentStatus) {
    EmploymentStatus["ACTIVE"] = "active";
    EmploymentStatus["INACTIVE"] = "inactive";
    EmploymentStatus["PENDING"] = "pending";
    EmploymentStatus["SUSPENDED"] = "suspended";
    EmploymentStatus["ON_LEAVE"] = "on_leave";
    EmploymentStatus["RESIGNED"] = "resigned";
    EmploymentStatus["TERMINATED"] = "terminated";
    EmploymentStatus["RETIRED"] = "retired";
    EmploymentStatus["DECEASED"] = "deceased";
})(EmploymentStatus || (exports.EmploymentStatus = EmploymentStatus = {}));


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmploymentType = void 0;
var EmploymentType;
(function (EmploymentType) {
    EmploymentType["FULL_TIME"] = "full_time";
    EmploymentType["PART_TIME"] = "part_time";
    EmploymentType["CONTRACTUAL"] = "contractual";
    EmploymentType["TEMPORARY"] = "temporary";
    EmploymentType["FREELANCE"] = "freelance";
    EmploymentType["INTERNSHIP"] = "internship";
    EmploymentType["TRAINEE"] = "trainee";
    EmploymentType["CONSULTANT"] = "consultant";
    EmploymentType["VOLUNTEER"] = "volunteer";
    EmploymentType["OTHER"] = "other";
})(EmploymentType || (exports.EmploymentType = EmploymentType = {}));


/***/ }),
/* 31 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Role = void 0;
const role_scope_type_enum_1 = __webpack_require__(32);
const base_entity_1 = __webpack_require__(16);
const permission_entity_1 = __webpack_require__(33);
const department_entity_1 = __webpack_require__(35);
const branch_entity_1 = __webpack_require__(38);
const organization_entity_1 = __webpack_require__(37);
const typeorm_1 = __webpack_require__(17);
const employee_entity_1 = __webpack_require__(27);
let Role = class Role extends base_entity_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.scope = role_scope_type_enum_1.RoleScopeType.OWNED;
    }
};
exports.Role = Role;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Role.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: role_scope_type_enum_1.RoleScopeType,
        default: role_scope_type_enum_1.RoleScopeType.OWNED,
    }),
    __metadata("design:type", typeof (_a = typeof role_scope_type_enum_1.RoleScopeType !== "undefined" && role_scope_type_enum_1.RoleScopeType) === "function" ? _a : Object)
], Role.prototype, "scope", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => permission_entity_1.Permission, (permission) => permission.roles, { nullable: true, cascade: true }),
    (0, typeorm_1.JoinTable)({
        name: 'role_permissions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Role.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => employee_entity_1.Employee, (employee) => employee.roles),
    __metadata("design:type", Array)
], Role.prototype, "employees", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => organization_entity_1.Organization, (organization) => organization.roles),
    __metadata("design:type", Array)
], Role.prototype, "organizations", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => branch_entity_1.Branch, (branch) => branch.roles),
    __metadata("design:type", Array)
], Role.prototype, "branches", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => department_entity_1.Department, (department) => department.roles),
    __metadata("design:type", Array)
], Role.prototype, "departments", void 0);
exports.Role = Role = __decorate([
    (0, typeorm_1.Entity)('roles')
], Role);


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RoleScopeType = void 0;
var RoleScopeType;
(function (RoleScopeType) {
    RoleScopeType["GLOBAL"] = "global";
    RoleScopeType["ORGANIZATION"] = "organization";
    RoleScopeType["BRANCH"] = "branch";
    RoleScopeType["DEPARTMENT"] = "department";
    RoleScopeType["OWNED"] = "owned";
})(RoleScopeType || (exports.RoleScopeType = RoleScopeType = {}));


/***/ }),
/* 33 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Permission = void 0;
const typeorm_1 = __webpack_require__(17);
const action_enum_1 = __webpack_require__(34);
const base_entity_1 = __webpack_require__(16);
const role_entity_1 = __webpack_require__(31);
let Permission = class Permission extends base_entity_1.BaseEntity {
};
exports.Permission = Permission;
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Permission.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Permission.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: action_enum_1.Action,
    }),
    __metadata("design:type", typeof (_a = typeof action_enum_1.Action !== "undefined" && action_enum_1.Action) === "function" ? _a : Object)
], Permission.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Permission.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => role_entity_1.Role, Role => Role.permissions),
    __metadata("design:type", Array)
], Permission.prototype, "roles", void 0);
exports.Permission = Permission = __decorate([
    (0, typeorm_1.Entity)('permissions')
], Permission);


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Action = void 0;
var Action;
(function (Action) {
    Action["MANAGE"] = "manage";
    Action["CREATE"] = "create";
    Action["READ"] = "read";
    Action["UPDATE"] = "update";
    Action["DELETE"] = "delete";
})(Action || (exports.Action = Action = {}));


/***/ }),
/* 35 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Department = void 0;
const base_entity_1 = __webpack_require__(16);
const address_entity_1 = __webpack_require__(36);
const role_entity_1 = __webpack_require__(31);
const typeorm_1 = __webpack_require__(17);
const branch_entity_1 = __webpack_require__(38);
let Department = class Department extends base_entity_1.BaseEntity {
};
exports.Department = Department;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Department.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Department.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Department.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Department.prototype, "alias", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Department.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Department.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => address_entity_1.Address, (address) => address.department, {
        cascade: true
    }),
    __metadata("design:type", typeof (_a = typeof address_entity_1.Address !== "undefined" && address_entity_1.Address) === "function" ? _a : Object)
], Department.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, (branch) => branch.departments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'branchId' }),
    __metadata("design:type", typeof (_b = typeof branch_entity_1.Branch !== "undefined" && branch_entity_1.Branch) === "function" ? _b : Object)
], Department.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => role_entity_1.Role, (role) => role.departments, { nullable: true, cascade: true }),
    (0, typeorm_1.JoinTable)({
        name: 'department_roles',
        joinColumn: { name: 'department_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Department.prototype, "roles", void 0);
exports.Department = Department = __decorate([
    (0, typeorm_1.Entity)('departments')
], Department);


/***/ }),
/* 36 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Address = void 0;
const base_entity_1 = __webpack_require__(16);
const department_entity_1 = __webpack_require__(35);
const organization_entity_1 = __webpack_require__(37);
const typeorm_1 = __webpack_require__(17);
const profile_entity_1 = __webpack_require__(39);
const branch_entity_1 = __webpack_require__(38);
let Address = class Address extends base_entity_1.BaseEntity {
};
exports.Address = Address;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address.prototype, "streetNameBuildingHouseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address.prototype, "barangay", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address.prototype, "cityOrMunicipality", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address.prototype, "province", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Address.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => profile_entity_1.Profile, (profile) => profile.address, {
        onDelete: 'CASCADE', nullable: true
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", typeof (_a = typeof profile_entity_1.Profile !== "undefined" && profile_entity_1.Profile) === "function" ? _a : Object)
], Address.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => organization_entity_1.Organization, (organization) => organization.address, {
        onDelete: 'CASCADE', nullable: true
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", typeof (_b = typeof organization_entity_1.Organization !== "undefined" && organization_entity_1.Organization) === "function" ? _b : Object)
], Address.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => branch_entity_1.Branch, (branch) => branch.address, {
        onDelete: 'CASCADE', nullable: true
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", typeof (_c = typeof branch_entity_1.Branch !== "undefined" && branch_entity_1.Branch) === "function" ? _c : Object)
], Address.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => department_entity_1.Department, (department) => department.address, {
        onDelete: 'CASCADE', nullable: true
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", typeof (_d = typeof department_entity_1.Department !== "undefined" && department_entity_1.Department) === "function" ? _d : Object)
], Address.prototype, "department", void 0);
exports.Address = Address = __decorate([
    (0, typeorm_1.Entity)('addresses')
], Address);


/***/ }),
/* 37 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Organization = void 0;
const address_entity_1 = __webpack_require__(36);
const role_entity_1 = __webpack_require__(31);
const typeorm_1 = __webpack_require__(17);
const base_entity_1 = __webpack_require__(16);
const branch_entity_1 = __webpack_require__(38);
let Organization = class Organization extends base_entity_1.BaseEntity {
};
exports.Organization = Organization;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Organization.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Organization.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Organization.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Organization.prototype, "alias", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Organization.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Organization.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => address_entity_1.Address, (address) => address.organization, {
        cascade: true
    }),
    __metadata("design:type", typeof (_a = typeof address_entity_1.Address !== "undefined" && address_entity_1.Address) === "function" ? _a : Object)
], Organization.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => branch_entity_1.Branch, (branch) => branch.organization, { cascade: true }),
    __metadata("design:type", Array)
], Organization.prototype, "branches", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => role_entity_1.Role, (role) => role.organizations, { nullable: true, cascade: true }),
    (0, typeorm_1.JoinTable)({
        name: 'organization_roles',
        joinColumn: { name: 'organization_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Organization.prototype, "roles", void 0);
exports.Organization = Organization = __decorate([
    (0, typeorm_1.Entity)('organizations')
], Organization);


/***/ }),
/* 38 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Branch = void 0;
const base_entity_1 = __webpack_require__(16);
const address_entity_1 = __webpack_require__(36);
const role_entity_1 = __webpack_require__(31);
const typeorm_1 = __webpack_require__(17);
const organization_entity_1 = __webpack_require__(37);
const department_entity_1 = __webpack_require__(35);
let Branch = class Branch extends base_entity_1.BaseEntity {
};
exports.Branch = Branch;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Branch.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Branch.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Branch.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Branch.prototype, "alias", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Branch.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Branch.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => address_entity_1.Address, (address) => address.branch, {
        cascade: true
    }),
    __metadata("design:type", typeof (_a = typeof address_entity_1.Address !== "undefined" && address_entity_1.Address) === "function" ? _a : Object)
], Branch.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization, (organization) => organization.branches, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'organizationId' }),
    __metadata("design:type", typeof (_b = typeof organization_entity_1.Organization !== "undefined" && organization_entity_1.Organization) === "function" ? _b : Object)
], Branch.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => department_entity_1.Department, (department) => department.branch, { cascade: true }),
    __metadata("design:type", Array)
], Branch.prototype, "departments", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => role_entity_1.Role, (role) => role.branches, { nullable: true, cascade: true }),
    (0, typeorm_1.JoinTable)({
        name: 'branch_roles',
        joinColumn: { name: 'branch_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Branch.prototype, "roles", void 0);
exports.Branch = Branch = __decorate([
    (0, typeorm_1.Entity)('branches')
], Branch);


/***/ }),
/* 39 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Profile = void 0;
const base_entity_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(17);
const address_entity_1 = __webpack_require__(36);
const user_entity_1 = __webpack_require__(14);
let Profile = class Profile extends base_entity_1.BaseEntity {
};
exports.Profile = Profile;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Profile.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "middleName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Profile.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "suffix", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "sex", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "profilePicture", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Profile.prototype, "birthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "civilStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "citizenship", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "nationality", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "religion", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.profile),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", typeof (_b = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _b : Object)
], Profile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Profile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => address_entity_1.Address, (address) => address.profile, {
        cascade: true
    }),
    __metadata("design:type", typeof (_c = typeof address_entity_1.Address !== "undefined" && address_entity_1.Address) === "function" ? _c : Object)
], Profile.prototype, "address", void 0);
exports.Profile = Profile = __decorate([
    (0, typeorm_1.Entity)('profiles')
], Profile);


/***/ }),
/* 40 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PayrollItem = void 0;
const base_entity_1 = __webpack_require__(16);
const employee_entity_1 = __webpack_require__(27);
const typeorm_1 = __webpack_require__(17);
const payroll_item_type_entity_1 = __webpack_require__(41);
let PayrollItem = class PayrollItem extends base_entity_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.isActive = true;
    }
};
exports.PayrollItem = PayrollItem;
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, (employee) => employee.payrollItems),
    (0, typeorm_1.JoinColumn)({ name: 'employeeId' }),
    __metadata("design:type", typeof (_a = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _a : Object)
], PayrollItem.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payroll_item_type_entity_1.PayrollItemType, (payrollItemType) => payrollItemType.payrollItems),
    (0, typeorm_1.JoinColumn)({ name: 'payrollItemTypeId' }),
    __metadata("design:type", typeof (_b = typeof payroll_item_type_entity_1.PayrollItemType !== "undefined" && payroll_item_type_entity_1.PayrollItemType) === "function" ? _b : Object)
], PayrollItem.prototype, "payrollItemType", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2
    }),
    __metadata("design:type", Number)
], PayrollItem.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], PayrollItem.prototype, "parameters", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PayrollItem.prototype, "occurrence", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], PayrollItem.prototype, "isActive", void 0);
exports.PayrollItem = PayrollItem = __decorate([
    (0, typeorm_1.Entity)('payroll-items')
], PayrollItem);


/***/ }),
/* 41 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PayrollItemType = void 0;
const payroll_item_category_enum_1 = __webpack_require__(42);
const base_entity_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(17);
const payroll_item_entity_1 = __webpack_require__(40);
let PayrollItemType = class PayrollItemType extends base_entity_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.isActive = true;
    }
};
exports.PayrollItemType = PayrollItemType;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PayrollItemType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayrollItemType.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: payroll_item_category_enum_1.PayrollItemCategory,
    }),
    __metadata("design:type", typeof (_a = typeof payroll_item_category_enum_1.PayrollItemCategory !== "undefined" && payroll_item_category_enum_1.PayrollItemCategory) === "function" ? _a : Object)
], PayrollItemType.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PayrollItemType.prototype, "defaultOccurrence", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PayrollItemType.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PayrollItemType.prototype, "computationFormula", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        nullable: true
    }),
    __metadata("design:type", Object)
], PayrollItemType.prototype, "defaultAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], PayrollItemType.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payroll_item_entity_1.PayrollItem, (payrollItem) => payrollItem.payrollItemType),
    __metadata("design:type", Array)
], PayrollItemType.prototype, "payrollItems", void 0);
exports.PayrollItemType = PayrollItemType = __decorate([
    (0, typeorm_1.Entity)('payroll-item-types')
], PayrollItemType);


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PayrollItemCategory = void 0;
var PayrollItemCategory;
(function (PayrollItemCategory) {
    PayrollItemCategory["COMPENSATION"] = "Compensation";
    PayrollItemCategory["BENEFIT"] = "Benefit";
    PayrollItemCategory["DEDUCTION"] = "Deduction";
})(PayrollItemCategory || (exports.PayrollItemCategory = PayrollItemCategory = {}));


/***/ }),
/* 43 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleChangeResponse = void 0;
const base_entity_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(17);
const schedule_change_request_entity_1 = __webpack_require__(18);
let ScheduleChangeResponse = class ScheduleChangeResponse extends base_entity_1.BaseEntity {
};
exports.ScheduleChangeResponse = ScheduleChangeResponse;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], ScheduleChangeResponse.prototype, "approved", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ScheduleChangeResponse.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => schedule_change_request_entity_1.ScheduleChangeRequest, (scheduleChangeRequest) => scheduleChangeRequest.scheduleChangeResponse),
    (0, typeorm_1.JoinColumn)({ name: 'scheduleChangeRequestId' }),
    __metadata("design:type", typeof (_a = typeof schedule_change_request_entity_1.ScheduleChangeRequest !== "undefined" && schedule_change_request_entity_1.ScheduleChangeRequest) === "function" ? _a : Object)
], ScheduleChangeResponse.prototype, "scheduleChangeRequest", void 0);
exports.ScheduleChangeResponse = ScheduleChangeResponse = __decorate([
    (0, typeorm_1.Entity)('schedule-change-responses')
], ScheduleChangeResponse);


/***/ }),
/* 44 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentType = void 0;
const base_entity_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(17);
const document_entity_1 = __webpack_require__(15);
let DocumentType = class DocumentType extends base_entity_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.active = false;
        this.requiredForApplicants = true;
        this.requiredForEmployees = true;
    }
};
exports.DocumentType = DocumentType;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DocumentType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DocumentType.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], DocumentType.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], DocumentType.prototype, "requiredForApplicants", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], DocumentType.prototype, "requiredForEmployees", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => DocumentType, (parent) => parent.children, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'parentDocumentTypeId' }),
    __metadata("design:type", DocumentType)
], DocumentType.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DocumentType, (child) => child.parent, { nullable: true }),
    __metadata("design:type", Array)
], DocumentType.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => document_entity_1.Document, (document) => document.documentType),
    __metadata("design:type", Array)
], DocumentType.prototype, "documents", void 0);
exports.DocumentType = DocumentType = __decorate([
    (0, typeorm_1.Entity)('document_types')
], DocumentType);


/***/ }),
/* 45 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ActivityLog = void 0;
const action_enum_1 = __webpack_require__(34);
const log_type_enum_1 = __webpack_require__(46);
const base_entity_1 = __webpack_require__(16);
const user_entity_1 = __webpack_require__(14);
const typeorm_1 = __webpack_require__(17);
let ActivityLog = class ActivityLog extends base_entity_1.BaseEntity {
};
exports.ActivityLog = ActivityLog;
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: action_enum_1.Action, nullable: false, default: action_enum_1.Action.READ }),
    __metadata("design:type", typeof (_a = typeof action_enum_1.Action !== "undefined" && action_enum_1.Action) === "function" ? _a : Object)
], ActivityLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], ActivityLog.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: log_type_enum_1.LogType, default: log_type_enum_1.LogType.INFO, nullable: false }),
    __metadata("design:type", typeof (_b = typeof log_type_enum_1.LogType !== "undefined" && log_type_enum_1.LogType) === "function" ? _b : Object)
], ActivityLog.prototype, "logType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.activityLogs),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", typeof (_c = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _c : Object)
], ActivityLog.prototype, "actor", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ActivityLog.prototype, "details", void 0);
exports.ActivityLog = ActivityLog = __decorate([
    (0, typeorm_1.Entity)('activity_logs')
], ActivityLog);


/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogType = void 0;
var LogType;
(function (LogType) {
    LogType["INFO"] = "info";
    LogType["WARNING"] = "warning";
    LogType["ERROR"] = "error";
    LogType["CRITICAL"] = "critical";
    LogType["DEBUG"] = "debug";
    LogType["VERBOSE"] = "verbose";
})(LogType || (exports.LogType = LogType = {}));


/***/ }),
/* 47 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Notification = void 0;
const notification_target_type_enum_1 = __webpack_require__(48);
const notification_type_enum_1 = __webpack_require__(49);
const base_entity_1 = __webpack_require__(16);
const user_entity_1 = __webpack_require__(14);
const typeorm_1 = __webpack_require__(17);
let Notification = class Notification extends base_entity_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.type = notification_type_enum_1.NotificationType.INFO;
        this.read = false;
    }
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notification.prototype, "iconOrImage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: notification_type_enum_1.NotificationType,
        default: notification_type_enum_1.NotificationType.INFO
    }),
    __metadata("design:type", typeof (_a = typeof notification_type_enum_1.NotificationType !== "undefined" && notification_type_enum_1.NotificationType) === "function" ? _a : Object)
], Notification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "link", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "read", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: notification_target_type_enum_1.NotificationTargetType,
        default: notification_target_type_enum_1.NotificationTargetType.USER
    }),
    __metadata("design:type", typeof (_c = typeof notification_target_type_enum_1.NotificationTargetType !== "undefined" && notification_target_type_enum_1.NotificationTargetType) === "function" ? _c : Object)
], Notification.prototype, "targetType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notification.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "targetId", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", typeof (_d = typeof Record !== "undefined" && Record) === "function" ? _d : Object)
], Notification.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.notifications),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", typeof (_e = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _e : Object)
], Notification.prototype, "user", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('notifications')
], Notification);


/***/ }),
/* 48 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationTargetType = void 0;
var NotificationTargetType;
(function (NotificationTargetType) {
    NotificationTargetType["USER"] = "user";
    NotificationTargetType["GROUP"] = "group";
    NotificationTargetType["DEPARTMENT"] = "department";
    NotificationTargetType["BRANCH"] = "branch";
    NotificationTargetType["ORGANIZATION"] = "organization";
})(NotificationTargetType || (exports.NotificationTargetType = NotificationTargetType = {}));


/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["INFO"] = "info";
    NotificationType["SUCCESS"] = "success";
    NotificationType["WARNING"] = "warning";
    NotificationType["ERROR"] = "error";
})(NotificationType || (exports.NotificationType = NotificationType = {}));


/***/ }),
/* 50 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Session = void 0;
const typeorm_1 = __webpack_require__(17);
const base_entity_1 = __webpack_require__(16);
const user_entity_1 = __webpack_require__(14);
let Session = class Session extends base_entity_1.BaseEntity {
};
exports.Session = Session;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Session.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Session.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Session.prototype, "lastActiveAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.sessions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", typeof (_c = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _c : Object)
], Session.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Session.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Session.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Session.prototype, "deviceId", void 0);
exports.Session = Session = __decorate([
    (0, typeorm_1.Entity)('sessions')
], Session);


/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const user_dto_1 = __webpack_require__(79);
const users_service_1 = __webpack_require__(63);
class UsersController extends (0, create_controller_factory_1.createController)('Users', // Entity name for Swagger documentation
users_service_1.UsersService, // The service handling Users-related operations
user_dto_1.GetUserDto, // DTO for retrieving Users
user_dto_1.UserDto, // DTO for creating Users
user_dto_1.UpdateUserDto // DTO for updating Users
) {
    async create(entityDto, createdById) {
        return await super.create(entityDto, createdById);
    }
}
exports.UsersController = UsersController;


/***/ }),
/* 52 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createController = createController;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const pluralize_1 = __webpack_require__(53);
const base_controller_1 = __webpack_require__(54);
const current_user_decorator_1 = __webpack_require__(75);
const override_decorator_1 = __webpack_require__(77);
const generalresponse_dto_1 = __webpack_require__(67);
const base_service_1 = __webpack_require__(64);
function createController(entityName, ServiceClass, getDtoClass, createDtoClass, updateDtoClass) {
    var _a, _b, _c, _d;
    let DynamicController = class DynamicController extends base_controller_1.BaseController {
        constructor(baseService) {
            super(baseService, getDtoClass, entityName);
        }
        async create(entityDto, createdById) {
            return await super.create(entityDto, createdById);
        }
        async update(id, entityDto, updatedById) {
            return await super.update(id, entityDto, updatedById);
        }
        async delete(id) {
            return await super.delete(id);
        }
    };
    __decorate([
        (0, override_decorator_1.Override)(),
        (0, swagger_1.ApiOperation)({
            summary: `Create a new ${(0, pluralize_1.singular)(entityName)}`,
            description: `Creates a new ${(0, pluralize_1.singular)(entityName)} record in the database with the provided data.`
        }),
        (0, swagger_1.ApiBody)({
            type: createDtoClass,
            description: `${(0, pluralize_1.singular)(entityName)} creation data`,
            required: true
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.CREATED,
            description: `The ${(0, pluralize_1.singular)(entityName)} has been successfully created.`,
            type: getDtoClass
        }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input data.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNPROCESSABLE_ENTITY, description: 'Unprocessable entity.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: `${(0, pluralize_1.singular)(entityName)} already exists.`, type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Related entity not found.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.', type: generalresponse_dto_1.GeneralResponseDto }),
        __param(0, (0, common_1.Body)()),
        __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, String]),
        __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
    ], DynamicController.prototype, "create", null);
    __decorate([
        (0, override_decorator_1.Override)(),
        (0, swagger_1.ApiOperation)({
            summary: `Update an existing ${(0, pluralize_1.singular)(entityName)}`,
            description: `Updates an existing ${(0, pluralize_1.singular)(entityName)} record in the database with the provided data.`
        }),
        (0, swagger_1.ApiParam)({
            name: 'id',
            description: `The unique identifier of the ${(0, pluralize_1.singular)(entityName)} to update`,
            required: true
        }),
        (0, swagger_1.ApiBody)({
            type: updateDtoClass,
            description: `${(0, pluralize_1.singular)(entityName)} update data`,
            required: true
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.OK,
            description: `The ${(0, pluralize_1.singular)(entityName)} has been successfully updated.`,
            type: getDtoClass
        }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input data.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNPROCESSABLE_ENTITY, description: 'Unprocessable entity.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: `${(0, pluralize_1.singular)(entityName)} not found.`, type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Data conflict during update.', type: generalresponse_dto_1.GeneralResponseDto }),
        __param(0, (0, common_1.Param)('id')),
        __param(1, (0, common_1.Body)()),
        __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object, String]),
        __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
    ], DynamicController.prototype, "update", null);
    __decorate([
        (0, override_decorator_1.Override)(),
        (0, swagger_1.ApiOperation)({
            summary: `Delete a ${(0, pluralize_1.singular)(entityName)}`,
            description: `Removes a ${(0, pluralize_1.singular)(entityName)} record from the database by its unique identifier.`
        }),
        (0, swagger_1.ApiParam)({
            name: 'id',
            description: `The unique identifier of the ${(0, pluralize_1.singular)(entityName)} to delete`,
            required: true
        }),
        (0, swagger_1.ApiResponse)({
            status: common_1.HttpStatus.NO_CONTENT,
            description: `The ${(0, pluralize_1.singular)(entityName)} has been successfully deleted.`,
            type: generalresponse_dto_1.GeneralResponseDto
        }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid ID format.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: `${(0, pluralize_1.singular)(entityName)} not found.`, type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.', type: generalresponse_dto_1.GeneralResponseDto }),
        (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Cannot delete due to existing references.', type: generalresponse_dto_1.GeneralResponseDto }),
        __param(0, (0, common_1.Param)('id')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String]),
        __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
    ], DynamicController.prototype, "delete", null);
    DynamicController = __decorate([
        (0, swagger_1.ApiTags)(entityName),
        (0, common_1.Controller)(),
        __param(0, (0, common_1.Inject)(ServiceClass)),
        __metadata("design:paramtypes", [typeof (_a = typeof base_service_1.BaseService !== "undefined" && base_service_1.BaseService) === "function" ? _a : Object])
    ], DynamicController);
    return DynamicController;
}


/***/ }),
/* 53 */
/***/ ((module) => {

module.exports = require("pluralize");

/***/ }),
/* 54 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseController = void 0;
const paginated_response_dto_1 = __webpack_require__(55);
const pagination_dto_1 = __webpack_require__(56);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const authorize_decorator_1 = __webpack_require__(59);
const current_user_decorator_1 = __webpack_require__(75);
const action_enum_1 = __webpack_require__(34);
const create_permissions_factory_1 = __webpack_require__(76);
const utility_helper_1 = __webpack_require__(68);
class BaseController {
    constructor(baseService, getDtoClass, entityName, entityNameOrPermissions) {
        this.baseService = baseService;
        this.getDtoClass = getDtoClass;
        this.entityName = entityName;
        this.permissions = { Create: [], Read: [], Update: [], Delete: [] };
        // Initialize static map if not exists
        if (!BaseController.permissionsMap) {
            BaseController.permissionsMap = {};
        }
        // If string is passed, it's the entity name - generate permissions
        if (typeof entityNameOrPermissions === 'string') {
            entityName = entityNameOrPermissions;
            const generatedPermissions = (0, create_permissions_factory_1.createPermissions)(entityNameOrPermissions);
            // Populate permissions with generated ones
            this.permissions = {
                Create: [generatedPermissions.Create],
                Read: [generatedPermissions.Read],
                Update: [generatedPermissions.Update],
                Delete: [generatedPermissions.Delete],
                Manage: [generatedPermissions.Manage],
            };
            // Store in static map
            BaseController.permissionsMap[this.constructor.name] = this.permissions;
        }
        else if (entityNameOrPermissions) {
            this.permissions = entityNameOrPermissions;
            BaseController.permissionsMap[this.constructor.name] = this.permissions;
        }
    }
    async create(entityDto, createdById) {
        const entity = await this.baseService.create(entityDto, createdById);
        return (0, class_transformer_1.plainToInstance)(this.getDtoClass, entity);
    }
    async update(id, entityDto, updatedById) {
        const updatedEntity = await this.baseService.update(id, entityDto, updatedById);
        return (0, class_transformer_1.plainToInstance)(this.getDtoClass, updatedEntity);
    }
    async findAllAdvanced(paginationDto) {
        const entityResult = await this.baseService.findAllComplex(paginationDto);
        // Transform using class-transformer
        const dtoResult = {
            data: (0, class_transformer_1.plainToInstance)(this.getDtoClass, entityResult.data, {
                enableCircularCheck: true,
                exposeUnsetFields: false,
            }),
            totalCount: entityResult.totalCount,
            meta: entityResult.meta
        };
        return dtoResult;
    }
    async findOne(fieldsString, relations, select) {
        // Create options object for the service
        const options = {};
        // Parse search criteria from query string (format: field1:value1,field2:value2)
        const criteria = {};
        if (fieldsString) {
            const fieldPairs = fieldsString.split(',');
            for (const pair of fieldPairs) {
                const [key, value] = pair.trim().split(':');
                if (key && value !== undefined) {
                    // Convert value types appropriately
                    if (value === 'true') {
                        criteria[key] = true;
                    }
                    else if (value === 'false') {
                        criteria[key] = false;
                    }
                    else if (value === 'null') {
                        criteria[key] = null;
                    }
                    else if (!isNaN(Number(value))) {
                        criteria[key] = Number(value);
                    }
                    else {
                        criteria[key] = value;
                    }
                }
            }
        }
        // Parse relations if provided
        if (relations) {
            options.relations = utility_helper_1.UtilityHelper.parseRelations(relations);
        }
        // Parse select fields if provided
        if (select) {
            options.select = utility_helper_1.UtilityHelper.parseSelect(select);
        }
        try {
            // Use the service with proper typing and options
            const entity = await this.baseService.findOneByOrFail(criteria, options);
            return (0, class_transformer_1.plainToInstance)(this.getDtoClass, entity);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new common_1.InternalServerErrorException(`Error retrieving ${this.entityName} with criteria ${JSON.stringify(criteria)}: ${errorMessage}`);
        }
    }
    async findById(id, relations, select) {
        return this.findOne(`id:${id}`, relations, select);
    }
    // @Get()
    // @ApiOperation({ summary: 'Get all entities' })
    // @ApiResponse({ status: 200, description: 'Return all entities with pagination.' })
    // @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of items to skip' })
    // @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of items to take' })
    // @ApiQuery({ name: 'filter', required: false, type: String, description: 'Filter criteria in JSON format' })
    // @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort criteria in JSON format' })
    // async findAll(@Query() paginationDto: PaginationDto<T>): Promise<PaginatedResponseDto<T>> {
    //     return await this.baseService.findAll(paginationDto);
    // }
    async delete(id) {
        return await this.baseService.delete(id);
    }
    async deleteMany(ids, hardDelete = false) {
        await this.baseService.deleteMany(ids, hardDelete);
    }
}
exports.BaseController = BaseController;
// Static permissions map that all instances share
BaseController.permissionsMap = {};
__decorate([
    (0, common_1.Post)(),
    (0, authorize_decorator_1.Authorize)({ endpointType: action_enum_1.Action.CREATE }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", typeof (_a = typeof Promise !== "undefined" && Promise) === "function" ? _a : Object)
], BaseController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, authorize_decorator_1.Authorize)({ endpointType: action_enum_1.Action.UPDATE }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], BaseController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(),
    (0, authorize_decorator_1.Authorize)({ endpointType: action_enum_1.Action.READ }),
    (0, swagger_1.ApiOperation)({
        summary: 'Get filtered entities with advanced filtering',
        description: `
        # Advanced Filtering Guide
        
        This endpoint supports complex filtering using JSON objects in the filter parameter.
        
        ## Basic Filters
        Simple equality: \`?filter={"status":"active"}\`
        
        ## Advanced Operators
        - Equal: \`?filter={"name":{"eq":"John"}}\`
        - Not equal: \`?filter={"status":{"ne":"deleted"}}\`
        - Greater than: \`?filter={"age":{"gt":18}}\`
        - Greater than or equal: \`?filter={"age":{"gte":21}}\`
        - Less than: \`?filter={"age":{"lt":65}}\`
        - Less than or equal: \`?filter={"price":{"lte":100}}\`
        - Like (contains): \`?filter={"name":{"like":"oh"}}\`
        - Case-insensitive like: \`?filter={"name":{"ilike":"john"}}\`
        - Between: \`?filter={"price":{"between":[10,50]}}\`
        - In array: \`?filter={"status":{"in":["active","pending"]}}\`
        - Not in array: \`?filter={"status":{"nin":["deleted","archived"]}}\`
        - Is null: \`?filter={"deletedAt":{"isNull":true}}\`
        
        ## Logical Operators
        
        ### AND (Default)
        Multiple conditions combined with AND logic (all must match):
        \`?filter={"status":"active","age":{"gte":21}}\`
        
        ### OR
        Any condition can match (using the special OR property):
        \`?filter={"OR":[{"status":"active"},{"featured":true}]}\`
        
        ## Relational Filtering
        
        ### Basic relation filtering:
        \`?filter={"user.email":"example@email.com"}\`
        
        ### Advanced relation filtering with operators:
        \`?filter={"user.profile.firstName":{"ilike":"jo"}}\`
        
        ### Complex nested relation filtering:
        \`?filter={"user.profile.address.city":{"eq":"New York"}}\`
        
        ### Combining relation filters with logical operators:
        \`?filter={"OR":[{"user.profile.firstName":{"ilike":"jo"}},{"user.email":{"like":"gmail"}}]}\`
        
        ## Field Selection
        Select specific fields: \`?select=["id","name","email"]\`
        Select fields from relations: \`?select=["id","name","user.id","user.email","category.name"]\`
        
        ## Sorting
        Sort by field: \`?sort={"createdAt":"DESC"}\`
        Multiple fields: \`?sort={"status":"ASC","createdAt":"DESC"}\`
        Sort by relation field: \`?sort={"user.name":"ASC"}\`
        
        ## Pagination
        Page size: \`?take=10\`
        Skip records: \`?skip=10\` (for page 2 with size 10)
        
        ## Relations
        Include related entities: \`?relations=["user","category"]\`
        Include nested relations: \`?relations=["user","user.profile","user.profile.address"]\`
        Alternative format: \`?relations={"user":true,"category":{"subcategories":true}}\`
        `,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'filter',
        required: false,
        type: String,
        examples: {
            basic: {
                summary: 'Basic Equality Filter',
                value: '{"status":"active"}',
            },
            textSearch: {
                summary: 'Case-insensitive Text Search',
                value: '{"name":{"ilike":"john"}}',
            },
            numeric: {
                summary: 'Numeric Range Filter',
                value: '{"age":{"gte":18,"lt":65}}',
            },
            dates: {
                summary: 'Date Range Filter',
                value: '{"createdAt":{"between":["2023-01-01","2023-12-31"]}}',
            },
            relation: {
                summary: 'Relation Filter',
                value: '{"user.profile.firstName":{"ilike":"jo"}}',
            },
            logicalOr: {
                summary: 'Logical OR',
                value: '{"OR":[{"status":"active"},{"featured":true}]}',
            },
            complex: {
                summary: 'Complex Combined Filter',
                value: '{"status":{"in":["active","pending"]},"age":{"gte":21},"user.profile.firstName":{"ilike":"jo"}}',
            },
        },
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sort',
        required: false,
        type: String,
        examples: {
            single: {
                summary: 'Sort by one field',
                value: '{"createdAt":"DESC"}',
            },
            multiple: {
                summary: 'Sort by multiple fields',
                value: '{"status":"ASC","createdAt":"DESC"}',
            },
            relation: {
                summary: 'Sort by relation field',
                value: '{"user.firstName":"ASC"}',
            },
        },
    }),
    (0, swagger_1.ApiQuery)({
        name: 'relations',
        required: false,
        type: String,
        examples: {
            simple: {
                summary: 'Simple relations',
                value: '["user","roles"]',
            },
            nested: {
                summary: 'Nested relations',
                value: '["user","user.profile","user.profile.address"]',
            },
        },
    }),
    (0, swagger_1.ApiQuery)({
        name: 'select',
        required: false,
        type: String,
        examples: {
            basic: {
                summary: 'Basic field selection',
                value: '["id","name","email"]',
            },
            withRelations: {
                summary: 'Fields with relations',
                value: '["id","employeeNumber","user.id","user.email","user.profile.firstName"]',
            },
        },
    }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Successfully retrieved entities',
        type: (paginated_response_dto_1.PaginatedResponseDto),
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof pagination_dto_1.PaginationDto !== "undefined" && pagination_dto_1.PaginationDto) === "function" ? _c : Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], BaseController.prototype, "findAllAdvanced", null);
__decorate([
    (0, common_1.Get)('find'),
    (0, authorize_decorator_1.Authorize)({ endpointType: action_enum_1.Action.READ }),
    (0, swagger_1.ApiOperation)({
        summary: 'Find an entity by any field',
        description: 'Search for an entity using field-value pairs. Multiple criteria can be combined.'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'fields',
        required: true,
        type: String,
        description: 'Search fields in format field:value (comma-separated)',
        example: 'id:123,name:example'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'relations',
        required: false,
        type: String,
        description: 'Relations to include in the response (comma-separated)',
        example: 'user,category,tags'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'select',
        required: false,
        type: String,
        description: 'Fields to select in the response (comma-separated). Only these fields will be returned.',
        example: 'id,name,createdAt'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Entity found successfully',
        schema: {
            type: 'object',
            example: {
                id: 123,
                name: 'Example Entity',
                createdAt: '2023-01-01T00:00:00Z'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Entity not found with the specified criteria' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden. User does not have permission to access this resource' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized. Authentication is required' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' }),
    __param(0, (0, common_1.Query)('fields')),
    __param(1, (0, common_1.Query)('relations')),
    __param(2, (0, common_1.Query)('select')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], BaseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('find/:id'),
    (0, authorize_decorator_1.Authorize)({ endpointType: action_enum_1.Action.READ }),
    (0, swagger_1.ApiOperation)({ summary: 'Get an entity by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Entity ID' }),
    (0, swagger_1.ApiQuery)({ name: 'relations', required: false, type: String, description: 'Relations to include (comma-separated)' }),
    (0, swagger_1.ApiQuery)({ name: 'select', required: false, type: String, description: 'Fields to select (comma-separated)' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return the entity' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Entity not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('relations')),
    __param(2, (0, common_1.Query)('select')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], BaseController.prototype, "findById", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    (0, authorize_decorator_1.Authorize)({ endpointType: action_enum_1.Action.DELETE }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], BaseController.prototype, "delete", null);
__decorate([
    (0, common_1.Delete)(),
    (0, authorize_decorator_1.Authorize)({ endpointType: action_enum_1.Action.DELETE }),
    (0, swagger_1.ApiOperation)({ summary: 'Delete multiple entities' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'uuid',
                    },
                },
                hardDelete: {
                    type: 'boolean',
                    default: false,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT, description: 'The entities have been successfully deleted.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input data.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Entity not found.' }),
    __param(0, (0, common_1.Body)('ids')),
    __param(1, (0, common_1.Body)('hardDelete')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Boolean]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], BaseController.prototype, "deleteMany", null);


/***/ }),
/* 55 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginatedResponseDto = void 0;
const swagger_1 = __webpack_require__(4);
const pagination_dto_1 = __webpack_require__(56);
class PaginatedResponseDto {
    constructor() {
        this.data = [];
        this.totalCount = 0;
        this.meta = new pagination_dto_1.PaginationDto();
    }
}
exports.PaginatedResponseDto = PaginatedResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ isArray: true, description: 'Array of items' }),
    __metadata("design:type", Array)
], PaginatedResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of items', example: 100 }),
    __metadata("design:type", Number)
], PaginatedResponseDto.prototype, "totalCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pagination metadata' }),
    __metadata("design:type", typeof (_a = typeof pagination_dto_1.PaginationDto !== "undefined" && pagination_dto_1.PaginationDto) === "function" ? _a : Object)
], PaginatedResponseDto.prototype, "meta", void 0);


/***/ }),
/* 56 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginationDto = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
const typeorm_1 = __webpack_require__(17);
/**
 * Data Transfer Object for pagination, filtering, sorting, and relation loading in API requests.
 *
 * This class provides a standardized way to handle common database query parameters
 * such as pagination (skip/take), filtering with advanced operators, sorting,
 * relation loading, and field selection. It's designed to work with TypeORM's
 * FindManyOptions interface.
 *
 * @example
 * // Basic usage in a controller
 * @Get()
 * async findAll(@Query() paginationDto: PaginationDto<User>) {
 *   return this.userService.findAll(paginationDto.toFindManyOptions());
 * }
 *
 * @example
 * Query example
 * GET /users?skip=0&take=10&filter={"name":{"like":"John"}}&sort={"createdAt":"DESC"}
 *
 * @template T The entity type this pagination will be applied to
 */
class PaginationDto {
    constructor() {
        this.skip = 0;
        this.take = 10;
    }
    toFindManyOptions(baseWhere = {}) {
        const filterObj = this.parseStringInput(this.filter);
        const sortObj = this.parseStringInput(this.sort);
        // Process where conditions with advanced operators
        let filterWhere = this.applyFilterOperators(filterObj);
        // Simplify the deleted logic
        if (!filterWhere.hasOwnProperty('isDeleted')) {
            filterWhere = Object.assign(Object.assign({}, filterWhere), { isDeleted: false });
        }
        // Process relations
        let relations = undefined;
        if (this.relations) {
            if (typeof this.relations === 'string') {
                try {
                    relations = JSON.parse(this.relations);
                }
                catch (e) {
                    relations = undefined;
                }
            }
            else {
                relations = this.relations;
            }
        }
        // Process select
        let select = undefined;
        if (this.select) {
            if (typeof this.select === 'string') {
                try {
                    const selectArray = JSON.parse(this.select);
                    if (Array.isArray(selectArray)) {
                        select = selectArray.reduce((acc, field) => {
                            acc[field] = true;
                            return acc;
                        }, {});
                    }
                }
                catch (e) {
                    select = undefined;
                }
            }
            else if (Array.isArray(this.select)) {
                select = this.select.reduce((acc, field) => {
                    acc[field] = true;
                    return acc;
                }, {});
            }
        }
        const options = {
            skip: this.skip,
            take: this.take,
            where: Object.assign(Object.assign({}, baseWhere), filterWhere),
            order: sortObj || undefined,
            relations,
            select,
        };
        return options;
    }
    // Parse string inputs to proper objects
    parseStringInput(input) {
        if (typeof input === 'string') {
            try {
                return JSON.parse(input);
            }
            catch (error) {
                return {};
            }
        }
        return input || {};
    }
    // Apply advanced filter operators
    applyFilterOperators(filterObj) {
        const result = {};
        Object.entries(filterObj).forEach(([key, value]) => {
            // Skip null/undefined values
            if (value === null || value === undefined)
                return;
            // Handle special logical operators
            if (key === 'or' && Array.isArray(value)) {
                // For OR, TypeORM accepts an array of conditions
                return value.map(condition => this.applyFilterOperators(condition));
            }
            if (key === 'and' && Array.isArray(value)) {
                // Process each condition in the AND array and merge them
                const andConditions = value.reduce((acc, condition) => {
                    return Object.assign(Object.assign({}, acc), this.applyFilterOperators(condition));
                }, {});
                // Merge with the current result
                Object.assign(result, andConditions);
                return;
            }
            // Handle nested objects (potential operators)
            if (typeof value === 'object' && !Array.isArray(value)) {
                const operators = value;
                // Equal
                if (operators.eq !== undefined) {
                    result[key] = operators.eq;
                }
                // Not Equal
                if (operators.ne !== undefined) {
                    result[key] = (0, typeorm_1.Not)(operators.ne);
                }
                // Greater Than
                if (operators.gt !== undefined) {
                    result[key] = (0, typeorm_1.MoreThan)(operators.gt);
                }
                // Greater Than or Equal
                if (operators.gte !== undefined) {
                    result[key] = (0, typeorm_1.MoreThanOrEqual)(operators.gte);
                }
                // Less Than
                if (operators.lt !== undefined) {
                    result[key] = (0, typeorm_1.LessThan)(operators.lt);
                }
                // Less Than or Equal
                if (operators.lte !== undefined) {
                    result[key] = (0, typeorm_1.LessThanOrEqual)(operators.lte);
                }
                // Between
                if (operators.between && Array.isArray(operators.between) && operators.between.length === 2) {
                    result[key] = (0, typeorm_1.Between)(operators.between[0], operators.between[1]);
                }
                // Like (case sensitive)
                if (operators.like !== undefined) {
                    result[key] = (0, typeorm_1.Like)(`%${operators.like}%`);
                }
                // ILike (case insensitive)
                if (operators.ilike !== undefined) {
                    result[key] = (0, typeorm_1.ILike)(`%${operators.ilike}%`);
                }
                // In
                if (operators.in && Array.isArray(operators.in)) {
                    result[key] = (0, typeorm_1.In)(operators.in);
                }
                // Not In
                if (operators.nin && Array.isArray(operators.nin)) {
                    result[key] = (0, typeorm_1.Not)((0, typeorm_1.In)(operators.nin));
                }
                // Is Null
                if (operators.isNull !== undefined) {
                    result[key] = (operators.isNull ? null : (0, typeorm_1.Not)(null));
                }
            }
            else {
                // Simple equality match
                result[key] = value;
            }
        });
        return result;
    }
}
exports.PaginationDto = PaginationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items to skip',
        required: false,
        minimum: 0,
        default: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], PaginationDto.prototype, "skip", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items to take',
        required: false,
        minimum: 1,
        default: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], PaginationDto.prototype, "take", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter criteria in JSON string format or object',
        required: false,
        example: '{"name":{"like":"%John%"},"age":{"gte":18}}',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return typeof value === 'string' ? JSON.parse(value) : value;
        }
        catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            throw new common_1.BadRequestException(`Invalid JSON in filter: ${errorMessage}`);
        }
    }),
    __metadata("design:type", Object)
], PaginationDto.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort criteria in JSON string format or object',
        required: false,
        example: '{"createdAt":"DESC"}',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PaginationDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Relations to include in the query',
        required: false,
        example: '["user","category"]',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PaginationDto.prototype, "relations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fields to select',
        required: false,
        example: '["id","name","email"]',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PaginationDto.prototype, "select", void 0);


/***/ }),
/* 57 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 58 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 59 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PERMISSION_ENDPOINT_TYPE = exports.PERMISSIONS_FUNCTION_KEY = void 0;
exports.Authorize = Authorize;
const jwt_auth_guard_1 = __webpack_require__(60);
const permissions_guard_1 = __webpack_require__(62);
const roles_guard_1 = __webpack_require__(73);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const permissions_decorator_1 = __webpack_require__(71);
const roles_decorator_1 = __webpack_require__(74);
exports.PERMISSIONS_FUNCTION_KEY = 'permissions_function';
exports.PERMISSION_ENDPOINT_TYPE = 'permission_endpoint_type';
function Authorize(options) {
    if (options === null || options === void 0 ? void 0 : options.endpointType) {
        return (0, common_1.applyDecorators)((0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard), (0, roles_decorator_1.Roles)(options === null || options === void 0 ? void 0 : options.roles), (0, common_1.SetMetadata)(exports.PERMISSION_ENDPOINT_TYPE, options.endpointType), (0, swagger_1.ApiBearerAuth)('access-token'));
    }
    // For regular array-based permissions
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard), (0, roles_decorator_1.Roles)(options === null || options === void 0 ? void 0 : options.roles), (0, permissions_decorator_1.Permissions)(options === null || options === void 0 ? void 0 : options.permissions), (0, swagger_1.ApiBearerAuth)('access-token'));
}


/***/ }),
/* 60 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
// jwt-auth.guard.ts
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(61);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 61 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 62 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PermissionsGuard_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionsGuard = void 0;
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const base_controller_1 = __webpack_require__(54);
const authorize_decorator_1 = __webpack_require__(59);
const permissions_decorator_1 = __webpack_require__(71);
const action_enum_1 = __webpack_require__(34);
const role_enum_1 = __webpack_require__(72);
let PermissionsGuard = PermissionsGuard_1 = class PermissionsGuard {
    constructor(reflector, usersService) {
        this.reflector = reflector;
        this.usersService = usersService;
        this.logger = new common_1.Logger(PermissionsGuard_1.name);
    }
    async canActivate(context) {
        var _a, _b, _c, _d;
        try {
            // First check for endpoint type
            const endpointType = this.reflector.getAllAndOverride(authorize_decorator_1.PERMISSION_ENDPOINT_TYPE, [context.getHandler(), context.getClass()]);
            let requiredPermissions = [];
            if (endpointType) {
                const controllerClass = context.getClass();
                const controllerName = controllerClass.name;
                // Access the static permissions map
                if (base_controller_1.BaseController.permissionsMap && base_controller_1.BaseController.permissionsMap[controllerName]) {
                    const permissions = base_controller_1.BaseController.permissionsMap[controllerName];
                    // Map endpoint type to permission type
                    switch (endpointType) {
                        case action_enum_1.Action.CREATE:
                            requiredPermissions = [
                                ...(permissions.Create || [])
                            ];
                            break;
                        case action_enum_1.Action.READ:
                            requiredPermissions = [...(permissions.Read || [])];
                            break;
                        case action_enum_1.Action.UPDATE:
                            requiredPermissions = [
                                ...(permissions.Update || [])
                            ];
                            break;
                        case action_enum_1.Action.DELETE:
                            requiredPermissions = [
                                ...(permissions.Delete || [])
                            ];
                            break;
                    }
                }
            }
            else {
                // Fall back to standard permissions check
                requiredPermissions = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]) || [];
            }
            // log permissiosn object
            this.logger.debug(`Permissions object: ${JSON.stringify(base_controller_1.BaseController.permissionsMap)}`);
            // If no permissions are required, allow access
            if (!requiredPermissions || requiredPermissions.length === 0) {
                return true;
            }
            // Get the user payload from the request
            const request = context.switchToHttp().getRequest();
            const userClaims = request.user;
            // get user with their role and role permissions
            let user;
            try {
                user = await this.usersService.findOneByOrFail({ id: userClaims.sub }, { relations: { employee: { roles: { permissions: true } } } });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`Error fetching user permissions: ${errorMessage}`);
                throw new common_1.ForbiddenException('Error processing permissions');
            }
            // check if user is an employee if user is not an employee only allow access to their own resource
            if (!user.employee) {
                this.logger.warn(`User is not an employee: ${JSON.stringify(user)}`);
                // Check if the user is trying to access their own resource
                const userId = request.params.userId || request.query.userId || request.body.userId;
                if (userId && userId !== userClaims.sub) {
                    this.logger.warn(`User is trying to access another user's resource: ${userId}`);
                    throw new common_1.ForbiddenException('You do not have the permissions to manage this resource.');
                }
                return true;
            }
            // If user has the super admin role, allow access
            const hasSuperAdminRole = (_b = (_a = user.employee) === null || _a === void 0 ? void 0 : _a.roles) === null || _b === void 0 ? void 0 : _b.some(role => role.name === role_enum_1.Role.SUPERADMIN);
            if (hasSuperAdminRole) {
                return true;
            }
            // Check if the user has every required permissions for some role
            const userPermissions = [
                ...new Set(((_d = (_c = user.employee) === null || _c === void 0 ? void 0 : _c.roles) === null || _d === void 0 ? void 0 : _d.flatMap(role => role.permissions).filter(Boolean)) || [])
            ];
            this.logger.debug(`Required permissions: ${JSON.stringify(requiredPermissions)}`);
            const hasRequiredPermissions = requiredPermissions.every(requiredPermission => {
                return userPermissions === null || userPermissions === void 0 ? void 0 : userPermissions.some(userPermission => {
                    // Direct permission match
                    const exactMatch = userPermission &&
                        userPermission.action === requiredPermission.action &&
                        userPermission.subject === requiredPermission.subject;
                    // Check if user has MANAGE permission for the same subject
                    // MANAGE is equivalent to having all other permissions
                    const hasManagePermission = userPermission &&
                        userPermission.action === action_enum_1.Action.MANAGE &&
                        userPermission.subject === requiredPermission.subject;
                    return exactMatch || hasManagePermission;
                });
            });
            if (!hasRequiredPermissions) {
                this.logger.warn(`User does not have required permissions: ${JSON.stringify(requiredPermissions)}`);
                throw new common_1.ForbiddenException('You do not have the permissions to manage this resource.');
            }
            return hasRequiredPermissions;
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Unexpected error in permissions guard: ${errorMessage}`);
            throw new common_1.ForbiddenException('Permission check failed');
        }
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = PermissionsGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], PermissionsGuard);


/***/ }),
/* 63 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersService = void 0;
const base_service_1 = __webpack_require__(64);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const bcrypt = __importStar(__webpack_require__(70));
const typeorm_2 = __webpack_require__(17);
const user_entity_1 = __webpack_require__(14);
let UsersService = class UsersService extends base_service_1.BaseService {
    constructor(userRepository) {
        super(userRepository, null);
        this.userRepository = userRepository;
    }
    async signUpUser(model) {
        const hashedPassword = await bcrypt.hash(model.password, 10);
        const user = this.create(Object.assign(Object.assign({}, model), { password: hashedPassword, userName: model.userName.toLowerCase().trim(), email: model.email.toLowerCase().trim() }));
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], UsersService);


/***/ }),
/* 64 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BaseService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseService = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(17);
const data_source_1 = __importDefault(__webpack_require__(65));
const generalresponse_dto_1 = __webpack_require__(67);
const pagination_dto_1 = __webpack_require__(56);
const utility_helper_1 = __webpack_require__(68);
const transaction_service_1 = __webpack_require__(69);
let BaseService = BaseService_1 = class BaseService {
    constructor(repository, usersService) {
        this.repository = repository;
        this.usersService = usersService;
        this.logger = new common_1.Logger(BaseService_1.name);
        this.transactionService = new transaction_service_1.TransactionService(data_source_1.default);
        this.entityName = this.repository.target instanceof Function ? this.repository.target.name : 'Entity';
        this.entityType = this.repository.target instanceof Function ? this.repository.target : Object;
        // State for query building
        this.queryState = {
            includes: new Map(),
            whereConditions: [],
            parameters: {},
            orderByClauses: [],
            skipValue: 0,
            takeValue: 0,
            isTracking: true,
            queryBuilder: null,
            parentPath: '',
            paramCounter: 0
        };
    }
    getRepository() {
        return this.repository;
    }
    async findAllComplex(paginationDto) {
        try {
            const findOptions = paginationDto.toFindManyOptions();
            const alias = this.entityName.toLowerCase();
            // Debug the incoming filter
            console.log('Raw filter from client:', JSON.stringify(paginationDto.filter));
            console.log('Converted findOptions where:', JSON.stringify(findOptions.where));
            this.logger.debug(`Processing query with filters: ${JSON.stringify(findOptions.where)}`);
            // For complex filtering that requires JOIN operations or nested relations
            if (Object.keys(findOptions.where || {}).length > 0 ||
                (findOptions.relations && Object.keys(findOptions.relations).length > 0)) {
                // Use QueryBuilder for more complex queries
                const queryBuilder = this.repository.createQueryBuilder(alias);
                // Add soft delete condition - using proper parameter binding
                queryBuilder.where(`${alias}.deletedAt IS NULL`);
                // Track joined relations to avoid duplicates
                const joinedRelations = new Set();
                // Apply where conditions from findOptions
                if (findOptions.where) {
                    // Initialize arrays/objects for OR conditions
                    const orClauses = [];
                    const orParams = {};
                    // Check if OR condition exists first to avoid TypeScript errors
                    if (findOptions.where['OR'] && Array.isArray(findOptions.where['OR'])) {
                        try {
                            // Process each condition in the OR array
                            findOptions.where['OR'].forEach((condition, index) => {
                                // Create condition clauses for this OR branch
                                const conditionClauses = [];
                                const conditionParams = {};
                                // Process each field in this condition
                                Object.entries(condition).forEach(([key, value]) => {
                                    // Handle nested properties (relations.field)
                                    if (key.includes('.')) {
                                        const parts = key.split('.');
                                        const field = parts.pop();
                                        // Join each relation path to the main query builder
                                        let currentAlias = alias;
                                        let fullPath = '';
                                        // Process each part of the path for joins
                                        for (let i = 0; i < parts.length; i++) {
                                            const relationName = parts[i];
                                            const prevPath = fullPath;
                                            // Build the cumulative path
                                            fullPath = prevPath ? `${prevPath}.${relationName}` : relationName;
                                            const joinAlias = `${fullPath.replace(/\./g, '_')}_or_${index}_filter_${this.queryState.paramCounter++}`;
                                            const joinPath = `${currentAlias}.${relationName}`;
                                            // Only join if not already joined
                                            if (!joinedRelations.has(joinAlias)) {
                                                queryBuilder.leftJoin(joinPath, joinAlias);
                                                joinedRelations.add(joinAlias);
                                                this.logger.debug(`Joined relation for OR filter: ${joinPath} as ${joinAlias}`);
                                            }
                                            // Update the current alias for next iteration
                                            currentAlias = joinAlias;
                                        }
                                        // Apply the condition to the innermost relation
                                        if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
                                            // Handle operators like ilike, gt, lt, etc.
                                            const paramBaseName = `${currentAlias}_${field}_or_${index}`;
                                            if ('ilike' in value) {
                                                const paramName = `${paramBaseName}_ilike_${this.queryState.paramCounter++}`;
                                                conditionClauses.push(`LOWER(${currentAlias}.${field}) LIKE LOWER(:${paramName})`);
                                                conditionParams[paramName] = `%${value.ilike}%`;
                                            }
                                            else if ('like' in value) {
                                                const paramName = `${paramBaseName}_like_${this.queryState.paramCounter++}`;
                                                conditionClauses.push(`${currentAlias}.${field} LIKE :${paramName}`);
                                                conditionParams[paramName] = `%${value.like}%`;
                                            }
                                            else {
                                                // Fall back to custom operator handling
                                                Object.entries(value).forEach(([op, opValue]) => {
                                                    const paramName = `${paramBaseName}_${op}_${this.queryState.paramCounter++}`;
                                                    switch (op) {
                                                        case 'eq':
                                                            conditionClauses.push(`${currentAlias}.${field} = :${paramName}`);
                                                            conditionParams[paramName] = opValue;
                                                            break;
                                                        case 'ne':
                                                            conditionClauses.push(`${currentAlias}.${field} != :${paramName}`);
                                                            conditionParams[paramName] = opValue;
                                                            break;
                                                        case 'gt':
                                                            conditionClauses.push(`${currentAlias}.${field} > :${paramName}`);
                                                            conditionParams[paramName] = opValue;
                                                            break;
                                                        case 'gte':
                                                            conditionClauses.push(`${currentAlias}.${field} >= :${paramName}`);
                                                            conditionParams[paramName] = opValue;
                                                            break;
                                                        case 'lt':
                                                            conditionClauses.push(`${currentAlias}.${field} < :${paramName}`);
                                                            conditionParams[paramName] = opValue;
                                                            break;
                                                        case 'lte':
                                                            conditionClauses.push(`${currentAlias}.${field} <= :${paramName}`);
                                                            conditionParams[paramName] = opValue;
                                                            break;
                                                        case 'in':
                                                            if (Array.isArray(opValue)) {
                                                                conditionClauses.push(`${currentAlias}.${field} IN (:...${paramName})`);
                                                                conditionParams[paramName] = opValue;
                                                            }
                                                            break;
                                                        case 'between':
                                                            if (Array.isArray(opValue) && opValue.length === 2) {
                                                                const minParam = `${paramName}_min`;
                                                                const maxParam = `${paramName}_max`;
                                                                conditionClauses.push(`${currentAlias}.${field} BETWEEN :${minParam} AND :${maxParam}`);
                                                                conditionParams[minParam] = opValue[0];
                                                                conditionParams[maxParam] = opValue[1];
                                                            }
                                                            break;
                                                        case 'isNull':
                                                            if (opValue === true) {
                                                                conditionClauses.push(`${currentAlias}.${field} IS NULL`);
                                                            }
                                                            else {
                                                                conditionClauses.push(`${currentAlias}.${field} IS NOT NULL`);
                                                            }
                                                            break;
                                                    }
                                                });
                                            }
                                        }
                                        else {
                                            // Simple equality for non-object values
                                            const paramName = `${currentAlias}_${field}_or_${index}_${this.queryState.paramCounter++}`;
                                            conditionClauses.push(`${currentAlias}.${field} = :${paramName}`);
                                            conditionParams[paramName] = value;
                                        }
                                    }
                                    else {
                                        // Handle direct properties (non-relational)
                                        if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
                                            // Handle operators like ilike, gt, lt, etc.
                                            const paramBaseName = `${alias}_${key}_or_${index}`;
                                            if ('ilike' in value) {
                                                const paramName = `${paramBaseName}_ilike_${this.queryState.paramCounter++}`;
                                                conditionClauses.push(`LOWER(${alias}.${key}) LIKE LOWER(:${paramName})`);
                                                conditionParams[paramName] = `%${value.ilike}%`;
                                            }
                                            else if ('like' in value) {
                                                const paramName = `${paramBaseName}_like_${this.queryState.paramCounter++}`;
                                                conditionClauses.push(`${alias}.${key} LIKE :${paramName}`);
                                                conditionParams[paramName] = `%${value.like}%`;
                                            }
                                            else {
                                                // Fall back to other operators
                                                Object.entries(value).forEach(([op, opValue]) => {
                                                    const paramName = `${paramBaseName}_${op}_${this.queryState.paramCounter++}`;
                                                    switch (op) {
                                                        case 'eq':
                                                            conditionClauses.push(`${alias}.${key} = :${paramName}`);
                                                            conditionParams[paramName] = opValue;
                                                            break;
                                                        case 'ne':
                                                            conditionClauses.push(`${alias}.${key} != :${paramName}`);
                                                            conditionParams[paramName] = opValue;
                                                            break;
                                                        case 'gt':
                                                            conditionClauses.push(`${alias}.${key} > :${paramName}`);
                                                            conditionParams[paramName] = opValue;
                                                            break;
                                                        case 'gte':
                                                            conditionClauses.push(`${alias}.${key} >= :${paramName}`);
                                                            conditionParams[paramName] = opValue;
                                                            break;
                                                        case 'lt':
                                                            conditionClauses.push(`${alias}.${key} < :${paramName}`);
                                                            conditionParams[paramName] = opValue;
                                                            break;
                                                        case 'lte':
                                                            conditionClauses.push(`${alias}.${key} <= :${paramName}`);
                                                            conditionParams[paramName] = opValue;
                                                            break;
                                                        case 'in':
                                                            if (Array.isArray(opValue)) {
                                                                conditionClauses.push(`${alias}.${key} IN (:...${paramName})`);
                                                                conditionParams[paramName] = opValue;
                                                            }
                                                            break;
                                                        case 'between':
                                                            if (Array.isArray(opValue) && opValue.length === 2) {
                                                                const minParam = `${paramName}_min`;
                                                                const maxParam = `${paramName}_max`;
                                                                conditionClauses.push(`${alias}.${key} BETWEEN :${minParam} AND :${maxParam}`);
                                                                conditionParams[minParam] = opValue[0];
                                                                conditionParams[maxParam] = opValue[1];
                                                            }
                                                            break;
                                                        case 'isNull':
                                                            if (opValue === true) {
                                                                conditionClauses.push(`${alias}.${key} IS NULL`);
                                                            }
                                                            else {
                                                                conditionClauses.push(`${alias}.${key} IS NOT NULL`);
                                                            }
                                                            break;
                                                    }
                                                });
                                            }
                                        }
                                        else {
                                            // Simple equality for non-object values
                                            const paramName = `${alias}_${key}_or_${index}_${this.queryState.paramCounter++}`;
                                            conditionClauses.push(`${alias}.${key} = :${paramName}`);
                                            conditionParams[paramName] = value;
                                        }
                                    }
                                });
                                // Add this branch to the OR clauses if any conditions were added
                                if (conditionClauses.length > 0) {
                                    orClauses.push(`(${conditionClauses.join(' AND ')})`);
                                    Object.assign(orParams, conditionParams);
                                }
                            });
                            // Apply all OR conditions to the main query
                            if (orClauses.length > 0) {
                                queryBuilder.andWhere(`(${orClauses.join(' OR ')})`, orParams);
                                this.logger.debug(`Applied OR conditions: ${orClauses.join(' OR ')}`);
                            }
                            // Remove OR from where to prevent double processing
                            delete findOptions.where['OR'];
                        }
                        catch (error) {
                            if (error instanceof Error) {
                                this.logger.error(`Error processing OR conditions: ${error.message}`, error.stack);
                            }
                            else {
                                this.logger.error(`Error processing OR conditions: ${String(error)}`);
                            }
                        }
                    }
                    Object.entries(findOptions.where).forEach(([key, value]) => {
                        // Skip isDeleted as we'll handle it separately
                        if (key === 'isDeleted')
                            return;
                        // Handle nested properties (relations.field)
                        if (key.includes('.')) {
                            const pathParts = key.split('.');
                            // Check if path is valid before proceeding
                            if (pathParts.length === 0) {
                                this.logger.warn(`Invalid path format: ${key}`);
                                return; // Skip this iteration of the forEach
                            }
                            const fieldName = pathParts.pop(); // Use non-null assertion since we checked length
                            let currentAlias = alias;
                            let fullPath = '';
                            // Process each part of the path for joins
                            for (let i = 0; i < pathParts.length; i++) {
                                const relationName = pathParts[i];
                                const prevPath = fullPath;
                                // Build the cumulative path
                                fullPath = prevPath ? `${prevPath}.${relationName}` : relationName;
                                const joinAlias = `${fullPath.replace(/\./g, '_')}_filter_${this.queryState.paramCounter++}`;
                                const joinPath = `${currentAlias}.${relationName}`;
                                // Only join if not already joined
                                if (!joinedRelations.has(joinAlias)) {
                                    // FIX: Actually perform the join operation!
                                    queryBuilder.innerJoin(joinPath, joinAlias);
                                    joinedRelations.add(joinAlias);
                                    this.logger.debug(`Joined relation for filter: ${joinPath} as ${joinAlias}`);
                                }
                                // Update the current alias for next iteration
                                currentAlias = joinAlias;
                            }
                            // Apply condition to final field
                            if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
                                this.applyOperatorToQueryBuilder(queryBuilder, currentAlias, fieldName, value);
                                this.logger.debug(`Applied operator filter to ${currentAlias}.${fieldName}: ${JSON.stringify(value)}`);
                            }
                            else {
                                // Generate a truly unique parameter name
                                const paramName = `${currentAlias}_${fieldName}_${this.queryState.paramCounter++}`;
                                queryBuilder.andWhere(`${currentAlias}.${fieldName} = :${paramName}`, {
                                    [paramName]: value
                                });
                                this.logger.debug(`Applied equality filter to ${currentAlias}.${fieldName} = ${value}`);
                            }
                        }
                        else {
                            // Handle regular fields on main entity
                            if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
                                this.applyOperatorToQueryBuilder(queryBuilder, alias, key, value);
                                this.logger.debug(`Applied operator filter to ${alias}.${key}: ${JSON.stringify(value)}`);
                            }
                            else {
                                // Generate a truly unique parameter name
                                const paramName = `${alias}_${key}_${this.queryState.paramCounter++}`;
                                queryBuilder.andWhere(`${alias}.${key} = :${paramName}`, {
                                    [paramName]: value
                                });
                                this.logger.debug(`Applied equality filter to ${alias}.${key} = ${value}`);
                            }
                        }
                    });
                }
                // Apply ordering
                if (findOptions.order) {
                    Object.entries(findOptions.order).forEach(([key, direction]) => {
                        // Handle nested ordering
                        if (key.includes('.')) {
                            const pathParts = key.split('.');
                            if (pathParts.length !== 2) {
                                this.logger.warn(`Complex nested ordering with more than one level is not supported: ${key}`);
                                return;
                            }
                            const [relation, field] = pathParts;
                            const relationAlias = `${relation}_order`;
                            // Join the relation if not already joined
                            if (!joinedRelations.has(relationAlias)) {
                                queryBuilder.leftJoin(`${alias}.${relation}`, relationAlias);
                                joinedRelations.add(relationAlias);
                                this.logger.debug(`Joined relation for ordering: ${relation} as ${relationAlias}`);
                            }
                            queryBuilder.addOrderBy(`${relationAlias}.${field}`, direction);
                            this.logger.debug(`Added order by ${relationAlias}.${field} ${direction}`);
                        }
                        else {
                            queryBuilder.addOrderBy(`${alias}.${key}`, direction);
                            this.logger.debug(`Added order by ${alias}.${key} ${direction}`);
                        }
                    });
                }
                // Handle field selection with relations
                if (findOptions.select && Array.isArray(findOptions.select) && findOptions.select.length > 0) {
                    // Clear any previous automatic selections
                    queryBuilder.select([]);
                    // Always include primary key for relational integrity
                    queryBuilder.addSelect(`${alias}.id`);
                    // Add requested fields for the main entity
                    findOptions.select.forEach(field => {
                        if (typeof field === 'string' && !field.includes('.')) {
                            queryBuilder.addSelect(`${alias}.${field}`);
                        }
                    });
                    this.logger.debug(`Applied field selection: ${JSON.stringify(findOptions.select)}`);
                }
                // Handle relations and field selection
                if (findOptions.relations) {
                    // Apply relations with any nested field selection
                    this.applyRelationsWithFieldSelection(queryBuilder, alias, findOptions.relations, findOptions.select, joinedRelations);
                    this.logger.debug(`Applied relations: ${JSON.stringify(findOptions.relations)}`);
                    // ADDED: Apply field selection to the main entity when relations are present
                    if (findOptions.select) {
                        // Clear any previous selection to avoid selecting all fields
                        queryBuilder.select([]);
                        // Make sure we always select the ID field for relational integrity
                        queryBuilder.addSelect(`${alias}.id`);
                        // Handle array format
                        if (Array.isArray(findOptions.select)) {
                            findOptions.select.forEach(fieldName => {
                                if (typeof fieldName === 'string' && !fieldName.includes('.')) {
                                    queryBuilder.addSelect(`${alias}.${fieldName}`);
                                }
                            });
                        }
                        // Handle object format
                        else {
                            Object.entries(findOptions.select).forEach(([field, included]) => {
                                if (included && !field.includes('.')) {
                                    queryBuilder.addSelect(`${alias}.${field}`);
                                }
                            });
                        }
                        this.logger.debug(`Applied field selection to main entity: ${JSON.stringify(findOptions.select)}`);
                    }
                }
                // If no relations but we have select fields
                else if (findOptions.select) {
                    // Add ID to selection if not already included
                    if (!Object.keys(findOptions.select).includes('id')) {
                        queryBuilder.addSelect(`${alias}.id`);
                    }
                    // Add selected fields
                    Object.entries(findOptions.select).forEach(([field, included]) => {
                        if (included) {
                            queryBuilder.addSelect(`${alias}.${field}`);
                        }
                    });
                    this.logger.debug(`Applied field selection: ${JSON.stringify(findOptions.select)}`);
                }
                // Apply pagination
                queryBuilder.skip(findOptions.skip).take(findOptions.take);
                try {
                    // Execute the query with count
                    const [data, totalCount] = await queryBuilder.getManyAndCount();
                    // // Log the SQL for debugging purposes in development
                    // if (process.env.NODE_ENV !== 'production') {
                    //   console.log('Generated SQL:', queryBuilder.getSql());
                    //   console.log('Query parameters:', queryBuilder.getParameters());
                    // }
                    this.logger.debug(`Found ${totalCount} items using QueryBuilder with relations and field selection`);
                    // Create a new pagination DTO to maintain all methods
                    const updatedPaginationDto = new pagination_dto_1.PaginationDto();
                    Object.assign(updatedPaginationDto, paginationDto, {
                        skip: findOptions.skip,
                        take: findOptions.take
                    });
                    return {
                        data,
                        totalCount,
                        meta: updatedPaginationDto,
                    };
                }
                catch (queryError) {
                    // Log and rethrow specific query errors with more context
                    if (queryError instanceof Error) {
                        this.logger.error(`Query execution error: ${queryError.message}`, queryError.stack);
                        this.logger.error(`Failed SQL: ${queryBuilder.getSql()}`);
                        this.logger.error(`Query parameters: ${JSON.stringify(queryBuilder.getParameters())}`);
                        throw new common_1.InternalServerErrorException(`Database query failed: ${queryError.message}`);
                    }
                    else {
                        this.logger.error(`Query execution error: ${String(queryError)}`);
                        this.logger.error(`Failed SQL: ${queryBuilder.getSql()}`);
                        this.logger.error(`Query parameters: ${JSON.stringify(queryBuilder.getParameters())}`);
                        throw new common_1.InternalServerErrorException(`Database query failed: ${String(queryError)}`);
                    }
                }
            }
            else {
                // For simple queries, use repository's findAndCount
                this.logger.debug('Using simple findAndCount for basic query');
                const [data, totalCount] = await this.repository.findAndCount(findOptions);
                // Create a new pagination DTO to maintain all methods
                const updatedPaginationDto = new pagination_dto_1.PaginationDto();
                Object.assign(updatedPaginationDto, paginationDto, {
                    skip: findOptions.skip,
                    take: findOptions.take,
                });
                return {
                    data,
                    totalCount,
                    meta: updatedPaginationDto,
                };
            }
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error in findAllComplex method: ${error.message}`, error.stack);
                throw new common_1.InternalServerErrorException(`Failed to retrieve ${this.entityName} records: ${error.message}`);
            }
            else {
                this.logger.error(`Error in findAllComplex method: ${String(error)}`);
                throw new common_1.InternalServerErrorException(`Failed to retrieve ${this.entityName} records: ${String(error)}`);
            }
        }
    }
    // Helper method to apply operators to QueryBuilder
    applyOperatorToQueryBuilder(queryBuilder, alias, field, valueObj) {
        // Create unique parameter name base
        const paramBaseName = `${alias}_${field}_${this.queryState.paramCounter++}`;
        // Debug the incoming value object
        console.log(`Applying operator to ${alias}.${field}:`, JSON.stringify(valueObj, null, 2));
        // Handle TypeORM's internal operator objects (ILike, etc.)
        if (valueObj && valueObj._type && valueObj._value !== undefined) {
            console.log(`Detected TypeORM operator: ${valueObj._type}`);
            const paramName = `${paramBaseName}_typeorm`;
            switch (valueObj._type) {
                case 'ilike':
                    // For ilike, TypeORM may have already added wildcards, so check the value
                    const ilikeValue = valueObj._value.includes('%') ? valueObj._value : `%${valueObj._value}%`;
                    queryBuilder.andWhere(`LOWER(${alias}.${field}) LIKE LOWER(:${paramName})`, {
                        [paramName]: ilikeValue
                    });
                    console.log(`Applied TypeORM ILIKE: ${alias}.${field} LIKE '${ilikeValue}'`);
                    break;
                case 'like':
                    const likeValue = valueObj._value.includes('%') ? valueObj._value : `%${valueObj._value}%`;
                    queryBuilder.andWhere(`${alias}.${field} LIKE :${paramName}`, {
                        [paramName]: likeValue
                    });
                    console.log(`Applied TypeORM LIKE: ${alias}.${field} LIKE '${likeValue}'`);
                    break;
                case 'equal':
                case 'eq':
                    queryBuilder.andWhere(`${alias}.${field} = :${paramName}`, {
                        [paramName]: valueObj._value
                    });
                    console.log(`Applied TypeORM equals: ${alias}.${field} = '${valueObj._value}'`);
                    break;
                case 'not':
                    queryBuilder.andWhere(`${alias}.${field} != :${paramName}`, {
                        [paramName]: valueObj._value
                    });
                    console.log(`Applied TypeORM not equals: ${alias}.${field} != '${valueObj._value}'`);
                    break;
                case 'gt':
                    queryBuilder.andWhere(`${alias}.${field} > :${paramName}`, {
                        [paramName]: valueObj._value
                    });
                    console.log(`Applied TypeORM greater than: ${alias}.${field} > ${valueObj._value}`);
                    break;
                case 'gte':
                    queryBuilder.andWhere(`${alias}.${field} >= :${paramName}`, {
                        [paramName]: valueObj._value
                    });
                    console.log(`Applied TypeORM greater than or equal: ${alias}.${field} >= ${valueObj._value}`);
                    break;
                case 'lt':
                    queryBuilder.andWhere(`${alias}.${field} < :${paramName}`, {
                        [paramName]: valueObj._value
                    });
                    console.log(`Applied TypeORM less than: ${alias}.${field} < ${valueObj._value}`);
                    break;
                case 'lte':
                    queryBuilder.andWhere(`${alias}.${field} <= :${paramName}`, {
                        [paramName]: valueObj._value
                    });
                    console.log(`Applied TypeORM less than or equal: ${alias}.${field} <= ${valueObj._value}`);
                    break;
                case 'in':
                    if (Array.isArray(valueObj._value)) {
                        queryBuilder.andWhere(`${alias}.${field} IN (:...${paramName})`, {
                            [paramName]: valueObj._value
                        });
                        console.log(`Applied TypeORM IN: ${alias}.${field} IN (${valueObj._value.join(', ')})`);
                    }
                    break;
                case 'any':
                    if (Array.isArray(valueObj._value)) {
                        queryBuilder.andWhere(`${alias}.${field} = ANY(:${paramName})`, {
                            [paramName]: valueObj._value
                        });
                        console.log(`Applied TypeORM ANY: ${alias}.${field} = ANY(${valueObj._value.join(', ')})`);
                    }
                    break;
                case 'between':
                    if (Array.isArray(valueObj._value) && valueObj._value.length === 2) {
                        queryBuilder.andWhere(`${alias}.${field} BETWEEN :${paramName}Min AND :${paramName}Max`, {
                            [`${paramName}Min`]: valueObj._value[0],
                            [`${paramName}Max`]: valueObj._value[1]
                        });
                        console.log(`Applied TypeORM BETWEEN: ${alias}.${field} BETWEEN ${valueObj._value[0]} AND ${valueObj._value[1]}`);
                    }
                    break;
                case 'isNull':
                    queryBuilder.andWhere(`${alias}.${field} IS NULL`);
                    console.log(`Applied TypeORM IS NULL: ${alias}.${field} IS NULL`);
                    break;
                case 'isNotNull':
                    queryBuilder.andWhere(`${alias}.${field} IS NOT NULL`);
                    console.log(`Applied TypeORM IS NOT NULL: ${alias}.${field} IS NOT NULL`);
                    break;
                default:
                    console.warn(`Unsupported TypeORM operator type: ${valueObj._type}`);
                    this.logger.warn(`Unsupported TypeORM operator type: ${valueObj._type}`);
            }
            return;
        }
        // Handle custom operator format
        try {
            if ('eq' in valueObj) {
                const paramName = `${paramBaseName}_eq`;
                queryBuilder.andWhere(`${alias}.${field} = :${paramName}`, { [paramName]: valueObj.eq });
                console.log(`Applied custom equals: ${alias}.${field} = '${valueObj.eq}'`);
            }
            else if ('ne' in valueObj) {
                const paramName = `${paramBaseName}_ne`;
                queryBuilder.andWhere(`${alias}.${field} != :${paramName}`, { [paramName]: valueObj.ne });
                console.log(`Applied custom not equals: ${alias}.${field} != '${valueObj.ne}'`);
            }
            else if ('gt' in valueObj) {
                const paramName = `${paramBaseName}_gt`;
                queryBuilder.andWhere(`${alias}.${field} > :${paramName}`, { [paramName]: valueObj.gt });
                console.log(`Applied custom greater than: ${alias}.${field} > ${valueObj.gt}`);
            }
            else if ('gte' in valueObj) {
                const paramName = `${paramBaseName}_gte`;
                queryBuilder.andWhere(`${alias}.${field} >= :${paramName}`, { [paramName]: valueObj.gte });
                console.log(`Applied custom greater than or equal: ${alias}.${field} >= ${valueObj.gte}`);
            }
            else if ('lt' in valueObj) {
                const paramName = `${paramBaseName}_lt`;
                queryBuilder.andWhere(`${alias}.${field} < :${paramName}`, { [paramName]: valueObj.lt });
                console.log(`Applied custom less than: ${alias}.${field} < ${valueObj.lt}`);
            }
            else if ('lte' in valueObj) {
                const paramName = `${paramBaseName}_lte`;
                queryBuilder.andWhere(`${alias}.${field} <= :${paramName}`, { [paramName]: valueObj.lte });
                console.log(`Applied custom less than or equal: ${alias}.${field} <= ${valueObj.lte}`);
            }
            else if ('like' in valueObj) {
                const paramName = `${paramBaseName}_like`;
                queryBuilder.andWhere(`${alias}.${field} LIKE :${paramName}`, {
                    [paramName]: `%${valueObj.like}%`
                });
                console.log(`Applied custom LIKE: ${alias}.${field} LIKE '%${valueObj.like}%'`);
            }
            else if ('ilike' in valueObj) {
                const paramName = `${paramBaseName}_ilike`;
                queryBuilder.andWhere(`LOWER(${alias}.${field}) LIKE LOWER(:${paramName})`, {
                    [paramName]: `%${valueObj.ilike}%`
                });
                console.log(`Applied custom ILIKE: ${alias}.${field} ILIKE '%${valueObj.ilike}%'`);
            }
            else if ('in' in valueObj && Array.isArray(valueObj.in)) {
                const paramName = `${paramBaseName}_in`;
                queryBuilder.andWhere(`${alias}.${field} IN (:...${paramName})`, { [paramName]: valueObj.in });
                console.log(`Applied custom IN: ${alias}.${field} IN (${valueObj.in.join(', ')})`);
            }
            else if ('between' in valueObj && Array.isArray(valueObj.between) && valueObj.between.length === 2) {
                const paramMinName = `${paramBaseName}_between_min`;
                const paramMaxName = `${paramBaseName}_between_max`;
                queryBuilder.andWhere(`${alias}.${field} BETWEEN :${paramMinName} AND :${paramMaxName}`, {
                    [paramMinName]: valueObj.between[0],
                    [paramMaxName]: valueObj.between[1]
                });
                console.log(`Applied custom BETWEEN: ${alias}.${field} BETWEEN ${valueObj.between[0]} AND ${valueObj.between[1]}`);
            }
            else if ('isNull' in valueObj) {
                if (valueObj.isNull) {
                    queryBuilder.andWhere(`${alias}.${field} IS NULL`);
                    console.log(`Applied custom IS NULL: ${alias}.${field} IS NULL`);
                }
                else {
                    queryBuilder.andWhere(`${alias}.${field} IS NOT NULL`);
                    console.log(`Applied custom IS NOT NULL: ${alias}.${field} IS NOT NULL`);
                }
            }
            else {
                console.warn(`Unknown operator in filter object: ${JSON.stringify(valueObj)}`);
                this.logger.warn(`Unknown operator in filter object: ${JSON.stringify(valueObj)}`);
            }
        }
        catch (error) {
            console.error(`Error applying operator for ${alias}.${field}:`, error);
            if (error instanceof Error) {
                this.logger.error(`Error applying operator for ${alias}.${field}: ${error.message}`, error.stack);
            }
            else {
                this.logger.error(`Error applying operator for ${alias}.${field}: ${String(error)}`);
            }
        }
        // After applying any operator, log query parameters for debugging
        console.log('Current query parameters:', queryBuilder.getParameters());
    }
    // Helper method to recursively apply relations with field selection
    applyRelationsWithFieldSelection(queryBuilder, parentAlias, relations, select, joinedRelations = new Set()) {
        // Handle string array format for relations
        if (Array.isArray(relations)) {
            // Sort relations to ensure parent relations are joined before their children
            const sortedRelations = [...relations].sort((a, b) => {
                // Put non-nested relations first, then sort by nesting depth
                const aNestCount = (a.match(/\./g) || []).length;
                const bNestCount = (b.match(/\./g) || []).length;
                return aNestCount - bNestCount;
            });
            // Process each relation path
            sortedRelations.forEach(relationPath => {
                // Handle nested paths (e.g., "user.profile")
                if (relationPath.includes('.')) {
                    const relationParts = relationPath.split('.');
                    let currentAlias = parentAlias;
                    let currentPath = '';
                    // Process each part of the path
                    relationParts.forEach((part, index) => {
                        const isLastPart = index === relationParts.length - 1;
                        const prevPath = currentPath;
                        // Build the cumulative path
                        currentPath = prevPath ? `${prevPath}.${part}` : part;
                        const fullRelationPath = `${currentAlias}.${part}`;
                        const newAlias = `${currentPath.replace(/\./g, '_')}_rel`;
                        // Skip if this relation segment is already joined
                        if (joinedRelations.has(newAlias)) {
                            currentAlias = newAlias;
                            return;
                        }
                        joinedRelations.add(newAlias);
                        // Join with or without selecting all fields
                        if (isLastPart) {
                            queryBuilder.leftJoinAndSelect(fullRelationPath, newAlias);
                        }
                        else {
                            // For intermediate relations, just join without selecting fields
                            queryBuilder.leftJoin(fullRelationPath, newAlias);
                        }
                        // Update current alias for the next iteration
                        currentAlias = newAlias;
                    });
                }
                else {
                    // Handle simple non-nested relations
                    const relationAlias = `${relationPath}_rel`;
                    // Skip if already joined
                    if (joinedRelations.has(relationAlias)) {
                        return;
                    }
                    joinedRelations.add(relationAlias);
                    queryBuilder.leftJoinAndSelect(`${parentAlias}.${relationPath}`, relationAlias);
                }
            });
            return;
        }
        // Rest of the method for object-format relations stays the same
        Object.entries(relations).forEach(([relationName, relationValue]) => {
            if (!relationValue)
                return;
            const relationAlias = `${relationName}_rel`;
            // Skip if already joined
            if (joinedRelations.has(relationAlias)) {
                return;
            }
            joinedRelations.add(relationAlias);
            // Handle nested relations
            if (typeof relationValue === 'object') {
                // Join the parent relation
                queryBuilder.leftJoinAndSelect(`${parentAlias}.${relationName}`, relationAlias);
                // Apply nested relations recursively
                this.applyRelationsWithFieldSelection(queryBuilder, relationAlias, relationValue, select, joinedRelations);
            }
            else {
                // Apply field selection for this relation if specified
                const relationSelect = this.extractNestedSelect(relationName, select);
                if (relationSelect && Object.keys(relationSelect).length > 0) {
                    // Join without selecting all fields
                    queryBuilder.leftJoin(`${parentAlias}.${relationName}`, relationAlias);
                    // Add ID field to ensure proper relation loading
                    queryBuilder.addSelect(`${relationAlias}.id`);
                    // Add each selected field
                    Object.entries(relationSelect).forEach(([field, included]) => {
                        if (included) {
                            queryBuilder.addSelect(`${relationAlias}.${field}`);
                        }
                    });
                }
                else {
                    // No specific field selection, select all fields
                    queryBuilder.leftJoinAndSelect(`${parentAlias}.${relationName}`, relationAlias);
                }
            }
        });
    }
    // Extract nested select fields for a specific relation
    extractNestedSelect(relationName, select) {
        if (!select)
            return undefined;
        const nestedSelect = {};
        let hasNestedFields = false;
        // Handle array format for select
        if (Array.isArray(select)) {
            // For array format, check if any items start with the relation name
            select.forEach(fieldPath => {
                if (typeof fieldPath === 'string' && fieldPath.startsWith(`${relationName}.`)) {
                    const nestedField = fieldPath.substring(relationName.length + 1);
                    nestedSelect[nestedField] = true;
                    hasNestedFields = true;
                }
            });
        }
        else {
            // Handle object format
            Object.entries(select).forEach(([field, included]) => {
                if (field.startsWith(`${relationName}.`)) {
                    const nestedField = field.substring(relationName.length + 1);
                    nestedSelect[nestedField] = included;
                    hasNestedFields = true;
                }
            });
        }
        return hasNestedFields ? nestedSelect : undefined;
    }
    /**
     * Finds a single entity matching the specified criteria.
     *
     * @param criteria - Fields to search by (partial entity)
     * @param options - Additional query options
     * @param options.relations - Relations to eager load with the entity
     * @param options.select - Fields to select from the entity
     * @param options.order - Sort order for the query results
     * @param options.withDeleted - Whether to include soft-deleted entities (default: false)
     * @param options.cache - Enable result caching (boolean, TTL in ms, or cache options object)
     * @param options.loadEagerRelations - Whether to load eager relations (default: true)
     * @param options.transaction - Whether the query should use an existing transaction
     *
     * @returns A Promise resolving to the matched entity or null if not found
     *
     * @example
     * // Find a user by email
     * const user = await userService.findOneBy({ email: 'example@domain.com' });
     *
     * // Find a user with related posts
     * const userWithPosts = await userService.findOneBy(
     *   { id: 123 },
     *   { relations: { posts: true } }
     * );
     */
    async findOneBy(criteria, options) {
        const findOptions = Object.assign({ where: Object.assign(Object.assign({}, (!(options === null || options === void 0 ? void 0 : options.withDeleted) && 'isDeleted' in criteria ? {} : { isDeleted: false })), criteria) }, options);
        return await this.repository.findOne(findOptions);
    }
    async findOneByOrFail(criteria, options) {
        const entity = await this.findOneBy(criteria, options);
        if (!entity) {
            throw new common_1.NotFoundException(`${this.entityName} with ${utility_helper_1.UtilityHelper.formatCriteria(criteria)} not found`);
        }
        return entity;
    }
    // DONE
    async create(createDto, createdBy) {
        const entity = this.repository.create(Object.assign(Object.assign({}, createDto), { createdBy }));
        try {
            return await this.repository.save(entity);
        }
        catch (error) {
            console.log('Full error object:', JSON.stringify(error, null, 2));
            throw error;
        }
    }
    // DONE
    async update(id, updateDto, updatedBy) {
        const entity = await this.findOneByOrFail({ id });
        const updatedEntity = await this.repository.save(Object.assign(Object.assign(Object.assign({}, entity), updateDto), { updatedBy }));
        return updatedEntity;
    }
    // DONE
    async softDelete(id, deletedBy) {
        if (deletedBy) {
            await this.repository.update(id, { deletedBy });
        }
        await this.repository.softDelete(id);
        return this.findOneByOrFail({ id });
    }
    async save(entity) {
        return await this.repository.save(entity);
    }
    // DONE
    async delete(id) {
        const result = await this.repository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`${this.entityName} with id ${id} not found`);
        }
        const response = new generalresponse_dto_1.GeneralResponseDto();
        response.statusCode = common_1.HttpStatus.NO_CONTENT;
        response.timestamp = new Date().toISOString();
        response.detail = 'Deletion Successful';
        response.message = `${this.entityName} with id ${id} was deleted successfully`;
        return response;
    }
    // DONE
    async deleteMany(ids, hardDelete = false) {
        if (ids.length === 0) {
            throw new common_1.BadRequestException('No ids provided for deletion.');
        }
        const existingEntities = await this.repository.findBy({
            id: (0, typeorm_1.In)(ids),
        });
        if (existingEntities.length !== ids.length) {
            const foundIds = existingEntities.map(entity => entity.id);
            const missingIds = ids.filter(id => !foundIds.includes(id));
            throw new common_1.NotFoundException(`${this.entityName}s with ids ${missingIds.join(', ')} not found.`);
        }
        await this.transactionService.executeInTransaction(async (queryRunner) => {
            try {
                if (!hardDelete) {
                    // Perform soft delete by updating isDeleted flag
                    await queryRunner.manager.update(this.entityType, { id: (0, typeorm_1.In)(ids) }, { isDeleted: true, deletedAt: new Date() });
                }
                else {
                    // Perform hard delete (physically remove records)
                    await queryRunner.manager.delete(this.entityType, ids);
                }
            }
            catch (error) {
                throw new common_1.InternalServerErrorException(`Failed to delete ${this.entityName}s.`);
            }
        });
    }
    createQueryBuilder(options) {
        const { alias = 'entity', filters = {}, relations = {}, orderBy = {}, select = [] } = options;
        const queryBuilder = this.repository.createQueryBuilder(alias);
        // Apply WHERE conditions
        Object.entries(filters).forEach(([key, value]) => {
            if (key.includes('.')) {
                // Handle nested filters (relations)
                const [relationPath, field] = key.split('.');
                queryBuilder.andWhere(`${relationPath}.${field} = :${key.replace('.', '_')}`, {
                    [key.replace('.', '_')]: value
                });
            }
            else if (Array.isArray(value)) {
                // Handle array values like roles
                if (key.endsWith('s') && typeof value[0] === 'object') {
                    // Many-to-many or one-to-many relation array (like "roles")
                    const relationName = key;
                    const relationAlias = `${relationName}_filtered`;
                    queryBuilder.innerJoinAndSelect(`${alias}.${relationName}`, relationAlias);
                    queryBuilder.andWhere(`${relationAlias}.id IN (:...${key}Ids)`, {
                        [`${key}Ids`]: value.map(item => item.id || item)
                    });
                }
                else {
                    // Simple array values
                    queryBuilder.andWhere(`${alias}.${key} IN (:...${key})`, { [key]: value });
                }
            }
            else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
                // Handle TypeORM operators
                Object.entries(value).forEach(([operator, operatorValue]) => {
                    switch (operator) {
                        case 'like':
                            queryBuilder.andWhere(`${alias}.${key} LIKE :${key}_like`, {
                                [`${key}_like`]: `%${operatorValue}%`
                            });
                            break;
                        case 'gt':
                            queryBuilder.andWhere(`${alias}.${key} > :${key}_gt`, { [`${key}_gt`]: operatorValue });
                            break;
                        case 'gte':
                            queryBuilder.andWhere(`${alias}.${key} >= :${key}_gte`, { [`${key}_gte`]: operatorValue });
                            break;
                        case 'lt':
                            queryBuilder.andWhere(`${alias}.${key} < :${key}_lt`, { [`${key}_lt`]: operatorValue });
                            break;
                        case 'lte':
                            queryBuilder.andWhere(`${alias}.${key} <= :${key}_lte`, { [`${key}_lte`]: operatorValue });
                            break;
                        default:
                            queryBuilder.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
                    }
                });
            }
            else {
                // Simple equality
                queryBuilder.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
            }
        });
        // Apply relations
        Object.entries(relations).forEach(([relationName, relationOptions]) => {
            if (relationOptions === true) {
                queryBuilder.leftJoinAndSelect(`${alias}.${relationName}`, relationName);
            }
            else if (typeof relationOptions === 'object') {
                const relationAlias = relationName;
                queryBuilder.leftJoinAndSelect(`${alias}.${relationName}`, relationAlias);
                // Apply filters to the relation if needed
                if (relationOptions.where) {
                    Object.entries(relationOptions.where).forEach(([field, value]) => {
                        queryBuilder.andWhere(`${relationAlias}.${field} = :${relationAlias}_${field}`, {
                            [`${relationAlias}_${field}`]: value
                        });
                    });
                }
            }
        });
        // Apply ordering
        Object.entries(orderBy).forEach(([key, direction]) => {
            queryBuilder.addOrderBy(`${alias}.${key}`, direction);
        });
        // Apply select fields if specified
        if (select.length > 0) {
            queryBuilder.select(select.map(field => `${alias}.${field}`));
        }
        return queryBuilder;
    }
    /**
     * Include a related entity (similar to EF Include)
     */
    include(navigationPropertyPath) {
        const propertyName = this.getPropertyName(navigationPropertyPath);
        const joinAlias = propertyName;
        const joinPath = `${this.repository.metadata.name.toLowerCase()}.${propertyName}`;
        this.queryState.includes.set(propertyName, joinPath);
        this.queryState.parentPath = propertyName;
        return this;
    }
    /**
     * Include a nested related entity (similar to EF ThenInclude)
     */
    thenInclude(navigationPropertyPath) {
        const propertyName = this.getPropertyName(navigationPropertyPath);
        const parentPath = this.queryState.parentPath;
        const joinPath = `${parentPath}.${propertyName}`;
        this.queryState.includes.set(joinPath, joinPath);
        this.queryState.parentPath = joinPath;
        return this;
    }
    /**
     * Filter entities based on a predicate
     */
    where(predicate) {
        const condition = this.parseExpression(predicate);
        this.queryState.whereConditions.push(condition.query);
        Object.assign(this.queryState.parameters, condition.parameters);
        return this;
    }
    /**
     * Order entities by a property ascending
     */
    orderBy(keySelector) {
        const propertyName = this.getPropertyName(keySelector);
        const alias = this.repository.metadata.name.toLowerCase();
        this.queryState.orderByClauses.push(`${alias}.${propertyName} ASC`);
        return this;
    }
    /**
     * Order entities by a property descending
     */
    orderByDescending(keySelector) {
        const propertyName = this.getPropertyName(keySelector);
        const alias = this.repository.metadata.name.toLowerCase();
        this.queryState.orderByClauses.push(`${alias}.${propertyName} DESC`);
        return this;
    }
    /**
     * Add a secondary ordering by a property ascending
     */
    thenBy(keySelector) {
        const propertyName = this.getPropertyName(keySelector);
        const alias = this.repository.metadata.name.toLowerCase();
        this.queryState.orderByClauses.push(`${alias}.${propertyName} ASC`);
        return this;
    }
    /**
     * Add a secondary ordering by a property descending
     */
    thenByDescending(keySelector) {
        const propertyName = this.getPropertyName(keySelector);
        const alias = this.repository.metadata.name.toLowerCase();
        this.queryState.orderByClauses.push(`${alias}.${propertyName} DESC`);
        return this;
    }
    /**
     * Skip a number of entities (for pagination)
     */
    skip(count) {
        this.queryState.skipValue = count;
        return this;
    }
    /**
     * Take a number of entities (for pagination)
     */
    take(count) {
        this.queryState.takeValue = count;
        return this;
    }
    /**
     * Execute the query with no tracking (better performance)
     */
    asNoTracking() {
        this.queryState.isTracking = false;
        return this;
    }
    /**
     * Execute the query and return all entities as a list
     */
    async toList() {
        try {
            const query = this.buildQuery();
            if (this.queryState.skipValue > 0) {
                query.skip(this.queryState.skipValue);
            }
            if (this.queryState.takeValue > 0) {
                query.take(this.queryState.takeValue);
            }
            const result = await query.getMany();
            this.resetQueryState();
            return result;
        }
        catch (error) {
            this.resetQueryState();
            throw error;
        }
    }
    /**
     * Execute the query and return a paginated response
     */
    async toPagedList(skip = 0, take = 10) {
        try {
            const query = this.buildQuery();
            // Use provided values or those set by skip()/take() methods
            const skipValue = this.queryState.skipValue > 0 ? this.queryState.skipValue : skip;
            const takeValue = this.queryState.takeValue > 0 ? this.queryState.takeValue : take;
            query.skip(skipValue).take(takeValue);
            const [data, totalCount] = await Promise.all([
                query.getMany(),
                query.getCount()
            ]);
            const paginationDto = new pagination_dto_1.PaginationDto();
            Object.assign(paginationDto, {
                skip: skipValue,
                take: takeValue
            });
            this.resetQueryState();
            return {
                data,
                totalCount,
                meta: paginationDto
            };
        }
        catch (error) {
            this.resetQueryState();
            throw error;
        }
    }
    /**
     * Execute the query and return the first entity or null
     */
    async firstOrDefault() {
        try {
            const query = this.buildQuery();
            query.take(1);
            const result = await query.getOne();
            this.resetQueryState();
            return result;
        }
        catch (error) {
            this.resetQueryState();
            throw error;
        }
    }
    /**
     * Execute the query and return the first entity or throw if not found
     */
    async first() {
        const result = await this.firstOrDefault();
        if (!result) {
            throw new common_1.NotFoundException(`${this.entityName} not found`);
        }
        return result;
    }
    /**
     * Execute the query and return a single entity or null
     * Throws if more than one entity is found
     */
    async singleOrDefault() {
        try {
            const query = this.buildQuery();
            const entities = await query.getMany();
            if (entities.length > 1) {
                throw new common_1.BadRequestException(`Expected a single ${this.entityName}, but found multiple`);
            }
            this.resetQueryState();
            return entities.length === 1 ? entities[0] : null;
        }
        catch (error) {
            this.resetQueryState();
            throw error;
        }
    }
    /**
     * Execute the query and return a single entity
     * Throws if no entity is found or more than one entity is found
     */
    async single() {
        const result = await this.singleOrDefault();
        if (!result) {
            throw new common_1.NotFoundException(`${this.entityName} not found`);
        }
        return result;
    }
    /**
     * Count the number of entities that match the query
     */
    async count() {
        try {
            const query = this.buildQuery();
            const count = await query.getCount();
            this.resetQueryState();
            return count;
        }
        catch (error) {
            this.resetQueryState();
            throw error;
        }
    }
    /**
     * Check if any entities match the query
     */
    async any() {
        const count = await this.count();
        return count > 0;
    }
    // Private helper methods
    /**
     * Build the TypeORM query from the state
     */
    buildQuery() {
        const alias = this.repository.metadata.name.toLowerCase();
        const query = this.repository.createQueryBuilder(alias);
        // Add includes (relations)
        this.queryState.includes.forEach((joinPath, key) => {
            const relationAlias = key.replace(/\./g, '_');
            query.leftJoinAndSelect(joinPath, relationAlias);
        });
        // Add where conditions
        this.queryState.whereConditions.forEach(condition => {
            query.andWhere(condition);
        });
        // Add parameters
        if (Object.keys(this.queryState.parameters).length > 0) {
            query.setParameters(this.queryState.parameters);
        }
        // Add order by
        this.queryState.orderByClauses.forEach(orderBy => {
            const [path, direction] = orderBy.split(' ');
            query.addOrderBy(path, direction);
        });
        // Filter out soft-deleted entities by default
        query.andWhere(`${alias}.isDeleted = :isDeleted`, { isDeleted: false });
        return query;
    }
    /**
     * Extract property name from an expression
     */
    getPropertyName(expression) {
        const funcStr = expression.toString();
        // Extract property name after the arrow function parameter
        const regex = /=>.*?\.([a-zA-Z0-9_]+)(?:\s|$|\)|\.|\[)/;
        const match = funcStr.match(regex);
        if (!match) {
            throw new Error(`Could not extract property name from expression: ${funcStr}`);
        }
        return match[1];
    }
    /**
     * Parse an expression into a SQL condition
     */
    parseExpression(expression) {
        const funcStr = expression.toString();
        const parameters = {};
        const alias = this.repository.metadata.name.toLowerCase();
        // Check for logical operators (AND, OR)
        if (funcStr.includes('&&') || funcStr.includes('||')) {
            return this.parseLogicalExpression(funcStr, alias);
        }
        // Handle basic comparison operations
        const comparisonRegex = /=>.*?\.([a-zA-Z0-9_]+)\s*(===|==|!==|!=|>=|<=|>|<)\s*([^;)]+)/;
        const comparisonMatch = funcStr.match(comparisonRegex);
        if (comparisonMatch) {
            const [_, property, operator, value] = comparisonMatch;
            const paramName = `param${++this.queryState.paramCounter}`;
            // Parse the value
            let parsedValue;
            if (value.trim() === 'true')
                parsedValue = true;
            else if (value.trim() === 'false')
                parsedValue = false;
            else if (value.trim() === 'null')
                parsedValue = null;
            else if (/^['"].*['"]$/.test(value.trim()))
                parsedValue = value.trim().slice(1, -1);
            else if (!isNaN(Number(value.trim())))
                parsedValue = Number(value.trim());
            else
                parsedValue = value.trim();
            parameters[paramName] = parsedValue;
            // Map JS operator to SQL operator
            const sqlOperator = this.mapOperator(operator);
            return {
                query: `${alias}.${property} ${sqlOperator} :${paramName}`,
                parameters
            };
        }
        // Handle method calls (includes, startsWith, endsWith)
        const methodRegex = /=>.*?\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\(([^)]*)\)/;
        const methodMatch = funcStr.match(methodRegex);
        if (methodMatch) {
            const [_, property, method, args] = methodMatch;
            const paramName = `param${++this.queryState.paramCounter}`;
            // Parse the arguments
            const parsedArgs = args.trim().split(',').map(arg => {
                const trimmedArg = arg.trim();
                if (trimmedArg.startsWith("'") || trimmedArg.startsWith('"')) {
                    return trimmedArg.slice(1, -1);
                }
                return trimmedArg;
            });
            // Handle common string methods
            switch (method) {
                case 'includes':
                    return {
                        query: `${alias}.${property} LIKE :${paramName}`,
                        parameters: { [paramName]: `%${parsedArgs[0]}%` }
                    };
                case 'startsWith':
                    return {
                        query: `${alias}.${property} LIKE :${paramName}`,
                        parameters: { [paramName]: `${parsedArgs[0]}%` }
                    };
                case 'endsWith':
                    return {
                        query: `${alias}.${property} LIKE :${paramName}`,
                        parameters: { [paramName]: `%${parsedArgs[0]}` }
                    };
                case 'indexOf':
                    return {
                        query: `${alias}.${property} LIKE :${paramName}`,
                        parameters: { [paramName]: `%${parsedArgs[0]}%` }
                    };
                case 'toLowerCase':
                    return {
                        query: `LOWER(${alias}.${property}) = LOWER(:${paramName})`,
                        parameters: { [paramName]: parsedArgs[0] || '' }
                    };
                case 'toUpperCase':
                    return {
                        query: `UPPER(${alias}.${property}) = UPPER(:${paramName})`,
                        parameters: { [paramName]: parsedArgs[0] || '' }
                    };
                case 'trim':
                    return {
                        query: `TRIM(${alias}.${property}) = :${paramName}`,
                        parameters: { [paramName]: parsedArgs[0] || '' }
                    };
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }
        }
        // Handle null/undefined checks
        const nullCheckRegex = /=>.*?\.([a-zA-Z0-9_]+)\s*===?\s*(null|undefined)/;
        const nullCheckMatch = funcStr.match(nullCheckRegex);
        if (nullCheckMatch) {
            const [_, property] = nullCheckMatch;
            return {
                query: `${alias}.${property} IS NULL`,
                parameters: {}
            };
        }
        const notNullCheckRegex = /=>.*?\.([a-zA-Z0-9_]+)\s*!==?\s*(null|undefined)/;
        const notNullCheckMatch = funcStr.match(notNullCheckRegex);
        if (notNullCheckMatch) {
            const [_, property] = notNullCheckMatch;
            return {
                query: `${alias}.${property} IS NOT NULL`,
                parameters: {}
            };
        }
        // Fallback for unrecognized expressions
        this.logger.warn(`Could not parse expression: ${funcStr}. Using default true condition.`);
        return {
            query: '1=1', // Always true
            parameters: {}
        };
    }
    /**
     * Parse logical expressions with AND (&&) or OR (||)
     */
    parseLogicalExpression(funcStr, alias) {
        let parameters = {};
        // Function to create a dummy Expression
        const createDummyExpression = (expressionStr) => {
            return new Function(`return ${expressionStr}`)();
        };
        // Split by OR first (lower precedence)
        if (funcStr.includes('||')) {
            const orParts = funcStr.split('||').map(part => {
                // Extract just the lambda function part for each condition
                const lambdaMatch = part.match(/(?:^\s*|[|&]{2}\s*)(\([^=]*=>\s*[^|&]*)/);
                if (lambdaMatch && lambdaMatch[1]) {
                    const fixedExpression = `${lambdaMatch[1]})`;
                    const result = this.parseExpression(createDummyExpression(fixedExpression));
                    parameters = Object.assign(Object.assign({}, parameters), result.parameters);
                    return `(${result.query})`;
                }
                return '1=1'; // Default to true for parts we can't parse
            });
            return {
                query: orParts.join(' OR '),
                parameters
            };
        }
        // Split by AND
        if (funcStr.includes('&&')) {
            const andParts = funcStr.split('&&').map(part => {
                // Extract just the lambda function part for each condition
                const lambdaMatch = part.match(/(?:^\s*|[|&]{2}\s*)(\([^=]*=>\s*[^|&]*)/);
                if (lambdaMatch && lambdaMatch[1]) {
                    const fixedExpression = `${lambdaMatch[1]})`;
                    const result = this.parseExpression(createDummyExpression(fixedExpression));
                    parameters = Object.assign(Object.assign({}, parameters), result.parameters);
                    return `(${result.query})`;
                }
                return '1=1'; // Default to true for parts we can't parse
            });
            return {
                query: andParts.join(' AND '),
                parameters
            };
        }
        // Should not reach here
        return {
            query: '1=1',
            parameters: {}
        };
    }
    /**
     * Map JavaScript operators to SQL operators
     */
    mapOperator(operator) {
        switch (operator) {
            case '===':
            case '==': return '=';
            case '!==':
            case '!=': return '!=';
            case '>': return '>';
            case '>=': return '>=';
            case '<': return '<';
            case '<=': return '<=';
            default: return '=';
        }
    }
    /**
     * Reset the query state after execution
     */
    resetQueryState() {
        this.queryState = {
            includes: new Map(),
            whereConditions: [],
            parameters: {},
            orderByClauses: [],
            skipValue: 0,
            takeValue: 0,
            isTracking: true,
            queryBuilder: null,
            parentPath: '',
            paramCounter: 0
        };
    }
};
exports.BaseService = BaseService;
exports.BaseService = BaseService = BaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.Repository !== "undefined" && typeorm_1.Repository) === "function" ? _a : Object, Object])
], BaseService);


/***/ }),
/* 65 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dataSourceOptions = void 0;
const profile_entity_1 = __webpack_require__(39);
const address_entity_1 = __webpack_require__(36);
const document_type_entity_1 = __webpack_require__(44);
const config_1 = __webpack_require__(2);
const dotenv_1 = __webpack_require__(66);
const typeorm_1 = __webpack_require__(17);
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
const isProduction = configService.get('NODE_ENV') === 'production';
exports.dataSourceOptions = {
    type: 'mysql',
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT') || '3306', 10),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: ['dist/**/*.entity{.ts,.js}', address_entity_1.Address, profile_entity_1.Profile, document_type_entity_1.DocumentType],
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    synchronize: !isProduction,
    logging: false,
    ssl: isProduction,
    extra: {
        ssl: isProduction ? { rejectUnauthorized: false } : null,
    },
};
exports["default"] = new typeorm_1.DataSource(exports.dataSourceOptions);


/***/ }),
/* 66 */
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),
/* 67 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GeneralResponseDto = void 0;
const swagger_1 = __webpack_require__(4);
class GeneralResponseDto {
}
exports.GeneralResponseDto = GeneralResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'HTTP status code of the response',
        example: 404,
        type: Number,
    }),
    __metadata("design:type", Number)
], GeneralResponseDto.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the response was generated',
        example: '2025-04-07T02:04:20.545Z',
        type: String,
    }),
    __metadata("design:type", String)
], GeneralResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for tracking the request',
        example: 'dfed434d-9516-4ae3-975e-175df199dd01',
        type: String,
    }),
    __metadata("design:type", String)
], GeneralResponseDto.prototype, "traceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Request path that triggered this response',
        example: '/api/modules',
        type: String,
    }),
    __metadata("design:type", String)
], GeneralResponseDto.prototype, "path", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of exception or error that occurred',
        example: 'NotFoundException',
        type: String,
    }),
    __metadata("design:type", String)
], GeneralResponseDto.prototype, "detail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Error message or messages describing the issue',
        example: 'Cannot GET /api/modules',
        oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } }
        ]
    }),
    __metadata("design:type", Object)
], GeneralResponseDto.prototype, "message", void 0);


/***/ }),
/* 68 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
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
    static formatCriteria(criteria) {
        return Object.entries(criteria)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    }
    // Helper method to parse relations string into TypeORM relations object
    static parseRelations(relations) {
        const relationsObj = {};
        relations.split(',').forEach(relation => {
            relation = relation.trim();
            if (!relation)
                return;
            if (relation.includes('.')) {
                // Handle nested relation (e.g., "comments.author")
                const parts = relation.split('.');
                let currentLevel = relationsObj;
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    if (i === parts.length - 1) {
                        // Last part in the chain
                        currentLevel[part] = true;
                    }
                    else {
                        // Create nested object if it doesn't exist
                        if (!currentLevel[part] || currentLevel[part] === true) {
                            currentLevel[part] = {};
                        }
                        // Move to next level in the object
                        currentLevel = currentLevel[part];
                    }
                }
            }
            else {
                // Handle simple relation
                relationsObj[relation] = true;
            }
        });
        return relationsObj;
    }
    // Helper method to parse select string into TypeORM select object
    static parseSelect(select) {
        const selectObj = {};
        select.split(',').forEach(field => {
            field = field.trim();
            if (!field)
                return;
            if (field.includes('.')) {
                // Handle nested selection (e.g., "profile.avatar")
                const parts = field.split('.');
                let currentLevel = selectObj;
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    if (i === parts.length - 1) {
                        // Last part in the chain
                        currentLevel[part] = true;
                    }
                    else {
                        // Create nested object if it doesn't exist
                        if (!currentLevel[part] || typeof currentLevel[part] === 'boolean') {
                            currentLevel[part] = {};
                        }
                        // Move to next level in the object
                        currentLevel = currentLevel[part];
                    }
                }
            }
            else {
                // Handle simple field
                selectObj[field] = true;
            }
        });
        return selectObj;
    }
    // Helper method to check if a string is a valid email
    static isEmail(email) {
        if (!email)
            return false;
        // Regular expression for email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
}
exports.UtilityHelper = UtilityHelper;


/***/ }),
/* 69 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionService = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(17);
let TransactionService = class TransactionService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async executeInTransaction(operation) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const result = await operation(queryRunner);
            await queryRunner.commitTransaction();
            return result;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object])
], TransactionService);


/***/ }),
/* 70 */
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),
/* 71 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Permissions = exports.PERMISSIONS_KEY = void 0;
const common_1 = __webpack_require__(1);
exports.PERMISSIONS_KEY = 'permissions';
/**
 * A decorator to set permissions metadata for a route handler.
 *
 * @param requirements - An array of permission objects that are required to access the route.
 * @returns A decorator function that sets the permissions metadata.
 *
 * @example
 * ```typescript
 * import { Permissions } from './permissions.decorator';
 * import { Controller, Get } from '@nestjs/common';
 *
 * @Controller('example')
 * export class ExampleController {
 *   @Get()
 *   @Permissions([{ name: 'read', level: 'admin' }])
 *   getExample() {
 *     return 'This route requires read permission with admin level';
 *   }
 * }
 * ```
 */
const Permissions = (requirements = []) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, requirements);
exports.Permissions = Permissions;


/***/ }),
/* 72 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Role = void 0;
var Role;
(function (Role) {
    Role["SUPERADMIN"] = "SuperAdmin";
    Role["ADMIN"] = "Admin";
    Role["EMPLOYEE"] = "Employee";
})(Role || (exports.Role = Role = {}));


/***/ }),
/* 73 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RolesGuard_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const roles_decorator_1 = __webpack_require__(74);
const role_enum_1 = __webpack_require__(72);
let RolesGuard = RolesGuard_1 = class RolesGuard {
    constructor(reflector, usersService) {
        this.reflector = reflector;
        this.usersService = usersService;
        this.logger = new common_1.Logger(RolesGuard_1.name);
    }
    async canActivate(context) {
        var _a, _b, _c, _d;
        try {
            const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [context.getHandler(), context.getClass()]);
            // If no roles are required, allow access
            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }
            // Get the user payload from the request
            const request = context.switchToHttp().getRequest();
            const userClaims = request.user;
            var user = await this.usersService.findOneBy({ id: userClaims.sub }, { relations: { employee: { roles: true } } });
            if (!user) {
                this.logger.warn(`User with ID ${userClaims.sub} not found`);
                throw new common_1.ForbiddenException('User not found');
            }
            // If user has the super admin role, allow access
            const hasSuperAdminRole = (_b = (_a = user.employee) === null || _a === void 0 ? void 0 : _a.roles) === null || _b === void 0 ? void 0 : _b.some(role => role.name === role_enum_1.Role.SUPERADMIN);
            if (hasSuperAdminRole) {
                return true;
            }
            // Check if the user has the required roles
            const hasRequiredRoles = (_d = (_c = user === null || user === void 0 ? void 0 : user.employee) === null || _c === void 0 ? void 0 : _c.roles) === null || _d === void 0 ? void 0 : _d.some(role => requiredRoles.includes(role.name));
            if (!hasRequiredRoles) {
                throw new common_1.ForbiddenException('You are not authorized to access this resource.');
            }
            return hasRequiredRoles;
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Unexpected error in Roles guard: ${errorMessage}`);
            throw new common_1.ForbiddenException('Role check failed');
        }
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = RolesGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], RolesGuard);


/***/ }),
/* 74 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(1);
exports.ROLES_KEY = 'roles';
/**
 * Decorator that assigns roles to a route or controller.
 * This metadata can be used with a guard to control access to specific endpoints.
 *
 * @param roles - An array of role names that are allowed to access the decorated endpoint.
 * Defaults to an empty array if not provided.
 * @returns A decorator function that sets the roles metadata on the target.
 *
 * @example
 * ```typescript
 * // Apply to a controller to restrict all routes
 * @Controller('users')
 * @Roles(['admin'])
 * export class UsersController {
 *   // ...
 * }
 *
 * // Apply to a specific route
 * @Get('profile')
 * @Roles(['admin', 'user'])
 * getProfile() {
 *   return 'This is a protected route';
 * }
 * ```
 */
const Roles = (roles = []) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


/***/ }),
/* 75 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CurrentUser = void 0;
const common_1 = __webpack_require__(1);
/**
 * Custom decorator to extract the current user from the request.
 *
 * @param data - The specific key of the user object to extract. If undefined, the entire user object is returned.
 * @param context - The execution context which provides access to the request object.
 *
 * @returns The user object or a specific property of the user object.
 *
 * @throws {UnauthorizedException} If the user is not authenticated.
 *
 * @example
 * // Usage in a controller to get the entire user object
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 *
 * @example
 * Usage in a controller to get a specific property of the user object
 * @Get('profile/email')
 * getEmail(@CurrentUser('email') email: string) {
 *   return email;
 * }
 */
exports.CurrentUser = (0, common_1.createParamDecorator)((data, context) => {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
        throw new common_1.UnauthorizedException('User claims is missing.');
    }
    if (!data) {
        return request.user;
    }
    return request === null || request === void 0 ? void 0 : request.user[data];
});


/***/ }),
/* 76 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createPermissions = void 0;
const action_enum_1 = __webpack_require__(34);
/**
 * Creates standard CRUD permission objects for a given subject
 * @param subject The entity/resource to create permissions for
 * @returns Object with standard CRUD permissions plus Manage
 */
const createPermissions = (subject) => {
    return {
        Read: { action: action_enum_1.Action.READ, subject },
        Create: { action: action_enum_1.Action.CREATE, subject },
        Update: { action: action_enum_1.Action.UPDATE, subject },
        Delete: { action: action_enum_1.Action.DELETE, subject },
        Manage: { action: action_enum_1.Action.MANAGE, subject },
    };
};
exports.createPermissions = createPermissions;


/***/ }),
/* 77 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Override = Override;
__webpack_require__(78);
/**
 * A decorator function that copies metadata from the overridden method
 * in the parent class to the overriding method in the child class.
 *
 * @returns A decorator function that can be applied to a method.
 *
 * @example
 * ```typescript
 * import { Override } from './override.decorator';
 *
 * class ParentClass {
 *   @SomeDecorator()
 *   someMethod() {
 *     // Parent method implementation
 *   }
 * }
 *
 * class ChildClass extends ParentClass {
 *   @Override()
 *   someMethod() {
 *     // Child method implementation
 *   }
 * }
 * ```
 *
 * @param target - The prototype of the class.
 * @param propertyKey - The name of the method being decorated.
 * @param descriptor - The property descriptor of the method.
 */
function Override() {
    return (target, propertyKey, descriptor) => {
        const parentTarget = Object.getPrototypeOf(target);
        const parentDescriptor = Object.getOwnPropertyDescriptor(parentTarget, propertyKey);
        if (parentDescriptor) {
            Reflect.getMetadataKeys(parentDescriptor.value).forEach((metadataKey) => {
                const metadataValue = Reflect.getMetadata(metadataKey, parentDescriptor.value);
                Reflect.defineMetadata(metadataKey, metadataValue, descriptor.value);
            });
        }
    };
}


/***/ }),
/* 78 */
/***/ ((module) => {

module.exports = require("reflect-metadata");

/***/ }),
/* 79 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetUserDto = exports.UpdateUserDto = exports.UserDto = void 0;
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
const profile_dto_1 = __webpack_require__(81);
class UserDto {
}
exports.UserDto = UserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The email address of the user',
        example: 'user@example.com'
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User password',
        example: 'StrongP@ssw0rd',
        minLength: 8
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    __metadata("design:type", String)
], UserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique username',
        example: 'john_doe'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Username must be at least 3 characters long' }),
    __metadata("design:type", String)
], UserDto.prototype, "userName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User\'s phone number',
        example: '+1234567890'
    }),
    (0, class_validator_1.IsPhoneNumber)(undefined, { message: 'Please provide a valid phone number' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the email has been verified',
        default: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UserDto.prototype, "emailVerified", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the phone number has been verified',
        default: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UserDto.prototype, "phoneNumberVerified", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of failed access attempts',
        default: 0
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UserDto.prototype, "accessFailedCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether lockout is enabled for this user',
        default: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UserDto.prototype, "lockoutEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the user is currently locked out',
        default: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UserDto.prototype, "lockedOut", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'The timestamp when lockout started',
        example: '2023-01-01T00:00:00Z'
    }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? new Date(value) : undefined),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], UserDto.prototype, "lockOutStart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'The timestamp when lockout ends',
        example: '2023-01-02T00:00:00Z'
    }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? new Date(value) : undefined),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], UserDto.prototype, "lockOutEnd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profile information', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => profile_dto_1.ProfileDto),
    __metadata("design:type", typeof (_c = typeof profile_dto_1.ProfileDto !== "undefined" && profile_dto_1.ProfileDto) === "function" ? _c : Object)
], UserDto.prototype, "profile", void 0);
class UpdateUserDto extends (0, swagger_1.PartialType)(UserDto) {
}
exports.UpdateUserDto = UpdateUserDto;
class GetUserDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateUserDto, 'user') {
}
exports.GetUserDto = GetUserDto;


/***/ }),
/* 80 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createGetDto = createGetDto;
const swagger_1 = __webpack_require__(4);
/**
 * Creates a Data Transfer Object (DTO) class for GET operations by extending the provided DTO
 * with standard entity metadata fields such as id, timestamps, and soft-delete information.
 *
 * This utility automatically copies all properties and decorators from the source DTO
 * and adds standardized tracking fields like creation date, update date, etc. The resulting
 * class is dynamically named with the pattern `Get${originalClassName}`.
 *
 * @template T - The type of the DTO class to extend
 * @param {new () => T} dto - The DTO class constructor to extend with metadata fields
 * @returns {any} A new DTO class that extends the original with standard entity metadata fields
 *
 * @remarks
 * The returned class includes the following additional fields:
 * - id: Unique identifier for the entity
 * - createdAt: Timestamp of entity creation
 * - updatedAt: Timestamp of last update (nullable)
 * - createdBy: ID of the user who created the entity (nullable)
 * - updatedBy: ID of the user who last updated the entity (nullable)
 * - isDeleted: Flag indicating if the entity is soft-deleted
 * - deletedBy: ID of the user who deleted the entity (nullable)
 * - deletedAt: Timestamp of entity deletion (nullable)
 *
 * @example
 * ```typescript
 * // Define a base DTO
 * class UserDto {
 *   @ApiProperty()
 *   name: string;
 *
 *   @ApiProperty()
 *   email: string;
 * }
 *
 * // Create a GetUserDto with all standard metadata fields
 * const GetUserDto = createGetDto(UserDto);
 * ```
 */
function createGetDto(dto, entity = "entity") {
    var _a, _b, _c;
    class GetDto extends dto {
        constructor(partial) {
            super();
            Object.assign(this, partial);
        }
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Unique identifier',
            example: '123e4567-e89b-12d3-a456-426614174000'
        }),
        __metadata("design:type", String)
    ], GetDto.prototype, "id", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: `Date when this ${entity} was created`,
            example: '2023-01-01T00:00:00Z',
            type: Date
        }),
        __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
    ], GetDto.prototype, "createdAt", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: `Date when this ${entity} was last updated`,
            example: '2023-01-02T00:00:00Z',
            type: Date,
            nullable: true
        }),
        __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
    ], GetDto.prototype, "updatedAt", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: `ID of the user who created this ${entity}}`,
            example: '123e4567-e89b-12d3-a456-426614174000',
            nullable: true
        }),
        __metadata("design:type", String)
    ], GetDto.prototype, "createdBy", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: `ID of the user who last updated this ${entity}`,
            example: '123e4567-e89b-12d3-a456-426614174000',
            nullable: true
        }),
        __metadata("design:type", String)
    ], GetDto.prototype, "updatedBy", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: `Whether this ${entity} is marked as deleted`,
            example: false,
            default: false
        }),
        __metadata("design:type", Boolean)
    ], GetDto.prototype, "isDeleted", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: `ID of the user who deleted this ${entity}`,
            example: '123e4567-e89b-12d3-a456-426614174000',
            nullable: true
        }),
        __metadata("design:type", String)
    ], GetDto.prototype, "deletedBy", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: `Date when this ${entity} was deleted`,
            example: '2023-01-03T00:00:00Z',
            type: Date,
            nullable: true
        }),
        __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
    ], GetDto.prototype, "deletedAt", void 0);
    // Copy properties and decorators from the source DTO
    const prototype = dto.prototype;
    Reflect.ownKeys(prototype).forEach(key => {
        if (key === 'constructor')
            return;
        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        if (descriptor) {
            Object.defineProperty(GetDto.prototype, key, descriptor);
        }
    });
    // Rename the class
    Object.defineProperty(GetDto, 'name', { value: `Get${dto.name}` });
    return GetDto;
}


/***/ }),
/* 81 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetProfileDto = exports.UpdateProfileDto = exports.ProfileDto = void 0;
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
const address_dto_1 = __webpack_require__(82);
class ProfileDto {
}
exports.ProfileDto = ProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID associated with the profile' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name of the profile', example: 'John' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Middle name of the profile', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "middleName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name of the profile' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Suffix (Jr., Sr., etc.)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "suffix", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender of the profile', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sex of the profile', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "sex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profile picture URL', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "profilePicture", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Birth date of the profile', required: false, type: Date, example: '1990-01-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], ProfileDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Civil status of the profile', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "civilStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Citizenship of the profile', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "citizenship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nationality of the profile', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "nationality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Religion of the profile', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "religion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Address information', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => address_dto_1.AddressDto),
    __metadata("design:type", typeof (_b = typeof address_dto_1.AddressDto !== "undefined" && address_dto_1.AddressDto) === "function" ? _b : Object)
], ProfileDto.prototype, "address", void 0);
class UpdateProfileDto extends (0, swagger_1.PartialType)(ProfileDto) {
}
exports.UpdateProfileDto = UpdateProfileDto;
class GetProfileDto extends (0, create_get_dto_factory_1.createGetDto)(ProfileDto) {
}
exports.GetProfileDto = GetProfileDto;


/***/ }),
/* 82 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetAddressDto = exports.UpdateAddressDto = exports.AddressDto = void 0;
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
class AddressDto {
}
exports.AddressDto = AddressDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Street name, building and house number',
        example: '123 Main St, Building A'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], AddressDto.prototype, "streetNameBuildingHouseNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Barangay name',
        example: 'Barangay 123'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], AddressDto.prototype, "barangay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'City or municipality name',
        example: 'Manila'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], AddressDto.prototype, "cityOrMunicipality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Province name',
        example: 'Metro Manila'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], AddressDto.prototype, "province", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Region name',
        example: 'NCR'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], AddressDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Postal code',
        example: 1000,
        type: Number
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AddressDto.prototype, "postalCode", void 0);
class UpdateAddressDto extends (0, swagger_1.PartialType)(AddressDto) {
}
exports.UpdateAddressDto = UpdateAddressDto;
class GetAddressDto extends (0, create_get_dto_factory_1.createGetDto)(AddressDto) {
}
exports.GetAddressDto = GetAddressDto;


/***/ }),
/* 83 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommonService = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
let CommonService = class CommonService {
    constructor(configService) {
        this.configService = configService;
    }
    isProduction() {
        return this.configService.getOrThrow('NODE_ENV') === 'production';
    }
    isDevelopment() {
        return this.configService.getOrThrow('NODE_ENV') === 'development';
    }
};
exports.CommonService = CommonService;
exports.CommonService = CommonService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], CommonService);


/***/ }),
/* 84 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfigModule = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const config_schema_1 = __webpack_require__(85);
let ConfigModule = class ConfigModule {
};
exports.ConfigModule = ConfigModule;
exports.ConfigModule = ConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [`.env.stage.${process.env.STAGE}`],
                validationSchema: config_schema_1.configValidationSchema,
            }),
        ],
        exports: [config_1.ConfigModule],
    })
], ConfigModule);


/***/ }),
/* 85 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.configValidationSchema = void 0;
const Joi = __importStar(__webpack_require__(86));
exports.configValidationSchema = Joi.object({
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string().default('development'),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(3306).required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    CACHE_TTL: Joi.number().default(60),
    RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
    RATE_LIMIT_MAX: Joi.number().default(100),
    APP_URL: Joi.string().default('http://localhost:3000'),
    GOOGLE_CLIENT_ID: Joi.string().required(),
    GOOGLE_CLIENT_SECRET: Joi.string().required(),
    GOOGLE_CALLBACK_URL: Joi.string().required(),
    EMAIL_HOST: Joi.string().required(),
    EMAIL_PORT: Joi.number().default(587),
    EMAIL_SECURE: Joi.boolean().default(false),
    EMAIL_USER: Joi.string().required(),
    EMAIL_PASS: Joi.string().required(),
    //ACCESS_TOKEN_SECRET: Joi.string().required(),
    ACCESS_TOKEN_EXPIRATION_MINUTES: Joi.number().default(15),
    // REFRESH_TOKEN_SECRET: Joi.string().required(),
    REFRESH_TOKEN_EXPIRATION_MINUTES: Joi.number().default(10080),
    ACCESS_TOKEN_MAX_AGE: Joi.number().default(900),
    REFRESH_TOKEN_MAX_AGE: Joi.number().default(10080),
    ACCESS_TOKEN_SECRET: Joi.string().required(),
});


/***/ }),
/* 86 */
/***/ ((module) => {

module.exports = require("joi");

/***/ }),
/* 87 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const config_1 = __webpack_require__(2);
const data_source_1 = __webpack_require__(65);
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => (Object.assign(Object.assign({}, data_source_1.dataSourceOptions), { autoLoadEntities: true })),
            }),
        ],
    })
], DatabaseModule);


/***/ }),
/* 88 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountManagementModule = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const employee_management_module_1 = __webpack_require__(89);
const roles_module_1 = __webpack_require__(97);
const auth_module_1 = __webpack_require__(107);
const profiles_module_1 = __webpack_require__(125);
const user_seeder_service_1 = __webpack_require__(128);
const sessions_module_1 = __webpack_require__(109);
const users_module_1 = __webpack_require__(12);
let AccountManagementModule = class AccountManagementModule {
};
exports.AccountManagementModule = AccountManagementModule;
exports.AccountManagementModule = AccountManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            roles_module_1.RolesModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            sessions_module_1.SessionsModule,
            profiles_module_1.ProfilesModule,
            employee_management_module_1.EmployeeManagementModule,
            core_1.RouterModule.register([
                {
                    path: 'account',
                    module: AccountManagementModule,
                    children: [
                        { path: 'auth', module: auth_module_1.AuthModule },
                        { path: 'users', module: users_module_1.UsersModule },
                        {
                            path: 'profiles',
                            module: profiles_module_1.ProfilesModule
                        },
                        { path: 'sessions', module: sessions_module_1.SessionsModule },
                    ],
                },
            ]),
        ],
        providers: [user_seeder_service_1.UserSeederService],
        exports: [
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            sessions_module_1.SessionsModule,
            profiles_module_1.ProfilesModule
        ]
    })
], AccountManagementModule);


/***/ }),
/* 89 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmployeeManagementModule = void 0;
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(13);
const users_module_1 = __webpack_require__(12);
const employees_controller_1 = __webpack_require__(90);
const employees_service_1 = __webpack_require__(94);
const employee_entity_1 = __webpack_require__(27);
const permissions_module_1 = __webpack_require__(96);
const roles_module_1 = __webpack_require__(97);
let EmployeeManagementModule = class EmployeeManagementModule {
};
exports.EmployeeManagementModule = EmployeeManagementModule;
exports.EmployeeManagementModule = EmployeeManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([employee_entity_1.Employee]),
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            core_1.RouterModule.register([
                {
                    path: 'employees',
                    module: EmployeeManagementModule,
                    children: [
                        {
                            path: 'roles',
                            module: roles_module_1.RolesModule,
                            children: [
                                {
                                    path: 'permissions',
                                    module: permissions_module_1.PermissionsModule,
                                }
                            ]
                        },
                    ],
                },
            ]),
        ],
        providers: [employees_service_1.EmployeesService],
        exports: [
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            employees_service_1.EmployeesService,
        ],
        controllers: [employees_controller_1.EmployeesController],
    })
], EmployeeManagementModule);


/***/ }),
/* 90 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmployeesController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const employee_dto_1 = __webpack_require__(91);
const employees_service_1 = __webpack_require__(94);
class EmployeesController extends (0, create_controller_factory_1.createController)('Employees', // Entity name for Swagger documentation
employees_service_1.EmployeesService, // The service handling Employee-related operations
employee_dto_1.GetEmployeeDto, // DTO for retrieving Employees
employee_dto_1.EmployeeDto, // DTO for creating Employees
employee_dto_1.UpdateEmployeeDto) {
}
exports.EmployeesController = EmployeesController;


/***/ }),
/* 91 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetEmployeeDto = exports.UpdateEmployeeDto = exports.EmployeeDto = void 0;
const base_dto_1 = __webpack_require__(92);
const reference_dto_1 = __webpack_require__(93);
const employment_condition_enum_1 = __webpack_require__(28);
const employment_status_enum_1 = __webpack_require__(29);
const employment_type_enum_1 = __webpack_require__(30);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
class EmployeeDto extends (0, swagger_1.PartialType)(base_dto_1.BaseDto) {
}
exports.EmployeeDto = EmployeeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID associated with the employee' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], EmployeeDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique employee number' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmployeeDto.prototype, "employeeNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Employment status of the employee',
        enum: employment_status_enum_1.EmploymentStatus,
        default: employment_status_enum_1.EmploymentStatus.PENDING,
    }),
    (0, class_validator_1.IsEnum)(employment_status_enum_1.EmploymentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof employment_status_enum_1.EmploymentStatus !== "undefined" && employment_status_enum_1.EmploymentStatus) === "function" ? _a : Object)
], EmployeeDto.prototype, "employmentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Employment condition of the employee',
        enum: employment_condition_enum_1.EmploymentCondition,
        default: employment_condition_enum_1.EmploymentCondition.PROBATIONARY,
    }),
    (0, class_validator_1.IsEnum)(employment_condition_enum_1.EmploymentCondition),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_b = typeof employment_condition_enum_1.EmploymentCondition !== "undefined" && employment_condition_enum_1.EmploymentCondition) === "function" ? _b : Object)
], EmployeeDto.prototype, "employmentCondition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Employment type of the employee',
        enum: employment_type_enum_1.EmploymentType,
        default: employment_type_enum_1.EmploymentType.FULL_TIME,
    }),
    (0, class_validator_1.IsEnum)(employment_type_enum_1.EmploymentType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_c = typeof employment_type_enum_1.EmploymentType !== "undefined" && employment_type_enum_1.EmploymentType) === "function" ? _c : Object)
], EmployeeDto.prototype, "employmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date when employee commenced work',
        required: false,
        type: Date,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], EmployeeDto.prototype, "commencementDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Available leave credits',
        required: false,
        default: 0,
        minimum: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], EmployeeDto.prototype, "leaveCredits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Monthly rate of the employee',
        required: false,
        default: 0,
        type: Number,
        minimum: 0
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], EmployeeDto.prototype, "monthlyRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Roles associated with this employee',
        type: [reference_dto_1.ReferenceDto]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => reference_dto_1.ReferenceDto),
    __metadata("design:type", Array)
], EmployeeDto.prototype, "roles", void 0);
class UpdateEmployeeDto extends (0, swagger_1.PartialType)(EmployeeDto) {
}
exports.UpdateEmployeeDto = UpdateEmployeeDto;
class GetEmployeeDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateEmployeeDto, "employee") {
}
exports.GetEmployeeDto = GetEmployeeDto;


/***/ }),
/* 92 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
class BaseDto {
}
exports.BaseDto = BaseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Organization ID - Identifies the organization that owns or scopes this resource. Used for multi-tenant access control and resource partitioning.',
        required: false,
        type: String,
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
        nullable: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BaseDto.prototype, "organizationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch ID - Specifies the organizational branch that owns or scopes this resource. Represents a subdivision within the parent organization.',
        required: false,
        type: String,
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174001',
        nullable: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BaseDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Department ID - Indicates the specific department that owns or scopes this resource. Used for departmental-level access control and resource organization.',
        required: false,
        type: String,
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174002',
        nullable: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BaseDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID - Identifies the specific user who owns or has primary responsibility for this resource. Used for user-level permissions and audit trails.',
        required: false,
        type: String,
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174003',
        nullable: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BaseDto.prototype, "userId", void 0);


/***/ }),
/* 93 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReferenceDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
class ReferenceDto {
}
exports.ReferenceDto = ReferenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], ReferenceDto.prototype, "id", void 0);


/***/ }),
/* 94 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmployeesService = void 0;
const role_enum_1 = __webpack_require__(72);
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const employee_entity_1 = __webpack_require__(27);
const roles_service_1 = __webpack_require__(95);
let EmployeesService = class EmployeesService extends base_service_1.BaseService {
    constructor(employeesRepository, usersService, rolesService) {
        super(employeesRepository, usersService);
        this.employeesRepository = employeesRepository;
        this.usersService = usersService;
        this.rolesService = rolesService;
    }
    async create(createDto, createdBy) {
        // find employee role by name
        const employeeRole = await this.rolesService.findOneByOrFail({
            name: role_enum_1.Role.EMPLOYEE,
        });
        // assign employee role to employee by adding to the roles array
        createDto.roles = createDto.roles || [];
        if (!createDto.roles.some(role => role.id === employeeRole.id)) {
            createDto.roles.push(employeeRole);
        }
        return await super.create(createDto, createdBy);
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object, typeof (_c = typeof roles_service_1.RolesService !== "undefined" && roles_service_1.RolesService) === "function" ? _c : Object])
], EmployeesService);


/***/ }),
/* 95 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesService = void 0;
const base_service_1 = __webpack_require__(64);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const users_service_1 = __webpack_require__(63);
const role_entity_1 = __webpack_require__(31);
let RolesService = class RolesService extends base_service_1.BaseService {
    constructor(rolesRepository, usersService) {
        super(rolesRepository, usersService);
        this.rolesRepository = rolesRepository;
        this.usersService = usersService;
    }
    async getAllRoles() {
        return this.rolesRepository.find({ relations: ['permissions'] });
    }
    async findRoleWithPermissions(roleId) {
        const role = await this.rolesRepository.findOne({
            where: { id: roleId },
            relations: ['permissions'],
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
        }
        return role;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], RolesService);


/***/ }),
/* 96 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionsModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const users_module_1 = __webpack_require__(12);
const roles_module_1 = __webpack_require__(97);
const permission_entity_1 = __webpack_require__(33);
const permissions_controller_1 = __webpack_require__(100);
const permissions_service_1 = __webpack_require__(102);
const permission_seeder_service_1 = __webpack_require__(103);
let PermissionsModule = class PermissionsModule {
};
exports.PermissionsModule = PermissionsModule;
exports.PermissionsModule = PermissionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([permission_entity_1.Permission]), users_module_1.UsersModule, roles_module_1.RolesModule],
        providers: [permissions_service_1.PermissionsService, permission_seeder_service_1.PermissionSeederService],
        exports: [permissions_service_1.PermissionsService, permission_seeder_service_1.PermissionSeederService],
        controllers: [permissions_controller_1.PermissionsController],
    })
], PermissionsModule);


/***/ }),
/* 97 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const users_module_1 = __webpack_require__(12);
const role_entity_1 = __webpack_require__(31);
const roles_controller_1 = __webpack_require__(98);
const roles_service_1 = __webpack_require__(95);
let RolesModule = class RolesModule {
};
exports.RolesModule = RolesModule;
exports.RolesModule = RolesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([role_entity_1.Role]), users_module_1.UsersModule],
        controllers: [roles_controller_1.RolesController],
        providers: [roles_service_1.RolesService],
        exports: [roles_service_1.RolesService],
    })
], RolesModule);


/***/ }),
/* 98 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const role_dto_1 = __webpack_require__(99);
const roles_service_1 = __webpack_require__(95);
class RolesController extends (0, create_controller_factory_1.createController)('Roles', // Entity name for Swagger documentation
roles_service_1.RolesService, // The service handling Role-related operations
role_dto_1.GetRoleDto, // DTO for retrieving Roles
role_dto_1.RoleDto, // DTO for creating/updating Roles
role_dto_1.UpdateRoleDto // DTO for updating Roles
) {
}
exports.RolesController = RolesController;


/***/ }),
/* 99 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetRoleDto = exports.UpdateRoleDto = exports.RoleDto = void 0;
const base_dto_1 = __webpack_require__(92);
const reference_dto_1 = __webpack_require__(93);
const role_scope_type_enum_1 = __webpack_require__(32);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
class RoleDto extends (0, swagger_1.PartialType)(base_dto_1.BaseDto) {
    constructor() {
        super(...arguments);
        this.scope = role_scope_type_enum_1.RoleScopeType.OWNED;
    }
}
exports.RoleDto = RoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The name of the role',
        example: 'admin',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], RoleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description of the role',
        example: 'Administrator with full access',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], RoleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'The scope of the role',
        enum: role_scope_type_enum_1.RoleScopeType,
        default: role_scope_type_enum_1.RoleScopeType.OWNED,
    }),
    (0, class_validator_1.IsEnum)(role_scope_type_enum_1.RoleScopeType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", typeof (_a = typeof role_scope_type_enum_1.RoleScopeType !== "undefined" && role_scope_type_enum_1.RoleScopeType) === "function" ? _a : Object)
], RoleDto.prototype, "scope", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of permissions assigned to this role',
        type: [reference_dto_1.ReferenceDto],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => reference_dto_1.ReferenceDto),
    __metadata("design:type", Array)
], RoleDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Employees associated with this role',
        type: [reference_dto_1.ReferenceDto]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => reference_dto_1.ReferenceDto),
    __metadata("design:type", Array)
], RoleDto.prototype, "employees", void 0);
class UpdateRoleDto extends (0, swagger_1.PartialType)(RoleDto) {
}
exports.UpdateRoleDto = UpdateRoleDto;
class GetRoleDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateRoleDto, 'role') {
}
exports.GetRoleDto = GetRoleDto;


/***/ }),
/* 100 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionsController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const permission_dto_1 = __webpack_require__(101);
const permissions_service_1 = __webpack_require__(102);
class PermissionsController extends (0, create_controller_factory_1.createController)('Permissions', // Entity name for Swagger documentation
permissions_service_1.PermissionsService, // The service handling Permission-related operations
permission_dto_1.GetPermissionDto) {
    async findOne(id, relations, select) {
        return await super.findOne(id, relations, select);
    }
    async delete(id) {
        return await super.delete(id);
    }
    async deleteMany(ids, hardDelete) {
        return await super.deleteMany(ids, hardDelete);
    }
    async create(entityDto, createdById) {
        return await super.create(entityDto, createdById);
    }
    async update(id, entityDto, updatedById) {
        return await super.update(id, entityDto, updatedById);
    }
}
exports.PermissionsController = PermissionsController;


/***/ }),
/* 101 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetPermissionDto = exports.UpdatePermissionDto = exports.PermissionDto = void 0;
const action_enum_1 = __webpack_require__(34);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
class PermissionDto {
}
exports.PermissionDto = PermissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Permission name', required: false }),
    __metadata("design:type", String)
], PermissionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Permission description', required: false }),
    __metadata("design:type", String)
], PermissionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The action this permission grants',
        enum: action_enum_1.Action,
        enumName: 'Action'
    }),
    __metadata("design:type", typeof (_a = typeof action_enum_1.Action !== "undefined" && action_enum_1.Action) === "function" ? _a : Object)
], PermissionDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The subject this permission applies to' }),
    __metadata("design:type", String)
], PermissionDto.prototype, "subject", void 0);
class UpdatePermissionDto extends (0, swagger_1.PartialType)(PermissionDto) {
}
exports.UpdatePermissionDto = UpdatePermissionDto;
class GetPermissionDto extends (0, create_get_dto_factory_1.createGetDto)(UpdatePermissionDto, 'permission') {
}
exports.GetPermissionDto = GetPermissionDto;


/***/ }),
/* 102 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionsService = void 0;
const base_service_1 = __webpack_require__(64);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const users_service_1 = __webpack_require__(63);
const roles_service_1 = __webpack_require__(95);
const permission_entity_1 = __webpack_require__(33);
let PermissionsService = class PermissionsService extends base_service_1.BaseService {
    constructor(permissionsRepository, usersService, rolesService) {
        super(permissionsRepository, usersService);
        this.permissionsRepository = permissionsRepository;
        this.usersService = usersService;
        this.rolesService = rolesService;
        this.cachedPermissions = new Map();
        this.preloadPermissions();
    }
    async getAllPermissions() {
        return this.permissionsRepository.find();
    }
    async preloadPermissions() {
        try {
            const permissions = await this.permissionsRepository.find();
            this.cachedPermissions.clear();
            for (const permission of permissions) {
                const key = this.getPermissionKey(permission.action, permission.subject);
                this.cachedPermissions.set(key, permission);
            }
            this.logger.log(`Preloaded ${this.cachedPermissions.size} permissions into cache`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to preload permissions: ${errorMessage}`);
        }
    }
    getPermissionKey(action, subject) {
        return `${action}:${subject}`;
    }
    /**
     * Find or create a permission
     * @param action The action (Create, Read, Update, Delete, Manage)
     * @param subject The subject (resource name)
     * @param name Optional name for the permission
     * @param description Optional description
     * @returns The permission entity
     */
    async findOrCreate(action, subject, name, description) {
        const permissionKey = this.getPermissionKey(action, subject);
        // Check cache first
        if (this.cachedPermissions.has(permissionKey)) {
            return this.cachedPermissions.get(permissionKey);
        }
        // Find in database
        const existingPermission = await this.permissionsRepository.findOne({
            where: { action, subject }
        });
        if (existingPermission) {
            // Update cache and return
            this.cachedPermissions.set(permissionKey, existingPermission);
            return existingPermission;
        }
        // Create new permission
        const newPermission = this.permissionsRepository.create({
            action,
            subject,
            name: name || `${action}_${subject}`.toUpperCase(),
            description: description || `Permission to ${action.toLowerCase()} ${subject}`
        });
        const savedPermission = await this.permissionsRepository.save(newPermission);
        // Update cache
        this.cachedPermissions.set(permissionKey, savedPermission);
        this.logger.log(`Created new permission: ${permissionKey}`);
        return savedPermission;
    }
    /**
     * Create multiple permissions in a transaction
     * @param permissionsData Array of permission data
     * @returns Created or found permissions
     */
    async createMultiple(permissionsData) {
        return this.transactionService.executeInTransaction(async (queryRunner) => {
            const results = [];
            for (const data of permissionsData) {
                const key = this.getPermissionKey(data.action, data.subject);
                // Check cache first
                if (this.cachedPermissions.has(key)) {
                    results.push(this.cachedPermissions.get(key));
                    continue;
                }
                // Find or create in transaction
                const existingPermission = await queryRunner.manager.findOne(permission_entity_1.Permission, {
                    where: { action: data.action, subject: data.subject }
                });
                if (existingPermission) {
                    this.cachedPermissions.set(key, existingPermission);
                    results.push(existingPermission);
                    continue;
                }
                // Create new
                const newPermission = queryRunner.manager.create(permission_entity_1.Permission, {
                    action: data.action,
                    subject: data.subject,
                    name: data.name || `${data.action}_${data.subject}`.toUpperCase(),
                    description: data.description || `Permission to ${data.action.toLowerCase()} ${data.subject}`
                });
                const savedPermission = await queryRunner.manager.save(newPermission);
                this.cachedPermissions.set(key, savedPermission);
                results.push(savedPermission);
            }
            return results;
        }).catch(error => {
            this.logger.error(`Failed to create permissions: ${error.message}`);
            throw error;
        });
    }
    /**
     * Get all permissions by subject
     * @param subject The subject name
     * @returns Array of permissions
     */
    async getPermissionsBySubject(subject) {
        // Try to get from cache first
        const cachedPermissions = Array.from(this.cachedPermissions.values())
            .filter(permission => permission.subject === subject);
        if (cachedPermissions.length > 0) {
            return cachedPermissions;
        }
        // Fetch from database
        const permissions = await this.permissionsRepository.find({
            where: { subject }
        });
        // Update cache
        for (const permission of permissions) {
            const key = this.getPermissionKey(permission.action, permission.subject);
            this.cachedPermissions.set(key, permission);
        }
        return permissions;
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object, typeof (_c = typeof roles_service_1.RolesService !== "undefined" && roles_service_1.RolesService) === "function" ? _c : Object])
], PermissionsService);


/***/ }),
/* 103 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PermissionSeederService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionSeederService = void 0;
const action_enum_1 = __webpack_require__(34);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const fs = __importStar(__webpack_require__(104));
const glob_1 = __webpack_require__(105);
const path = __importStar(__webpack_require__(106));
const typeorm_2 = __webpack_require__(17);
const permission_entity_1 = __webpack_require__(33);
let PermissionSeederService = PermissionSeederService_1 = class PermissionSeederService {
    constructor(permissionRepository) {
        this.permissionRepository = permissionRepository;
        this.logger = new common_1.Logger(PermissionSeederService_1.name);
    }
    // Automatically run on module initialization
    async onModuleInit() {
        if (process.env.NODE_ENV !== 'test') {
            try {
                await this.seedPermissions();
            }
            catch (error) {
                this.logger.error(`Failed to seed permissions: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }
    async seedPermissions() {
        this.logger.log('🔍 Scanning controllers for permissions...');
        // Get permissions from controllers created with createController factory
        const factoryControllerPerms = await this.scanFactoryControllers();
        this.logger.log(`Found ${factoryControllerPerms.length} permissions from factory controllers`);
        // Get permissions from regular BaseController extensions
        const baseControllerPerms = await this.scanBaseControllerExtensions();
        this.logger.log(`Found ${baseControllerPerms.length} permissions from BaseController extensions`);
        // Get permissions from code patterns
        const codePatternPerms = await this.scanForPermissions();
        this.logger.log(`Found ${codePatternPerms.length} permissions from code patterns`);
        // Combine all permissions
        const allPermissions = [...factoryControllerPerms, ...baseControllerPerms, ...codePatternPerms];
        const uniquePermissions = this.removeDuplicates(allPermissions);
        this.logger.log(`Total unique permissions found: ${uniquePermissions.length}`);
        let created = 0;
        let updated = 0;
        try {
            for (const permDef of uniquePermissions) {
                const result = await this.createOrUpdatePermission(permDef);
                if (result.isNew)
                    created++;
                else
                    updated++;
            }
            this.logger.log(`Permission seeding completed: ${created} created, ${updated} updated`);
        }
        catch (error) {
            this.logger.error(`Error creating permissions: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * NEW METHOD: Scan for controllers created with createController factory
     */
    async scanFactoryControllers() {
        const permissions = [];
        const controllers = await this.findControllerFiles();
        // Pattern to match controllers that extend from createController()
        const factoryControllerPattern = /export\s+class\s+(\w+)\s+extends\s+createController\s*<([^>]*)>\s*\(\s*['"]([^'"]+)['"]/;
        this.logger.debug(`Scanning ${controllers.length} controller files for factory controllers`);
        for (const file of controllers) {
            try {
                const fileContent = fs.readFileSync(file, 'utf8');
                const factoryMatch = fileContent.match(factoryControllerPattern);
                if (factoryMatch) {
                    const controllerName = factoryMatch[1];
                    const typeParams = factoryMatch[2].split(',').map(param => param.trim());
                    const entityName = factoryMatch[3];
                    this.logger.debug(`Found factory controller: ${controllerName} for entity ${entityName}`);
                    // Extract parameters passed to createController
                    const paramsPattern = /createController\s*<[^>]*>\s*\(\s*['"]([^'"]+)['"]\s*,\s*[^,]+\s*,\s*([^,]+)(?:\s*,\s*([^,]+))?(?:\s*,\s*([^,)]+))?\s*\)/;
                    const paramsMatch = fileContent.match(paramsPattern);
                    if (paramsMatch) {
                        // Always generate MANAGE permission
                        permissions.push(this.createPermissionDefinition(action_enum_1.Action.MANAGE, entityName));
                        // Check for GetDto (Read permission)
                        if (paramsMatch[2] && paramsMatch[2].trim() !== 'null' && paramsMatch[2].trim() !== 'undefined') {
                            permissions.push(this.createPermissionDefinition(action_enum_1.Action.READ, entityName));
                        }
                        // Check for EntityDto (Create permission)
                        if (paramsMatch[3] && paramsMatch[3].trim() !== 'null' && paramsMatch[3].trim() !== 'undefined') {
                            permissions.push(this.createPermissionDefinition(action_enum_1.Action.CREATE, entityName));
                        }
                        // Check for UpdateDto (Update permission)
                        if (paramsMatch[4] && paramsMatch[4].trim() !== 'null' && paramsMatch[4].trim() !== 'undefined') {
                            permissions.push(this.createPermissionDefinition(action_enum_1.Action.UPDATE, entityName));
                        }
                        // Also check generic types as a backup
                        if (typeParams.length >= 2) { // At least has Entity and GetDto
                            permissions.push(this.createPermissionDefinition(action_enum_1.Action.READ, entityName));
                        }
                        if (typeParams.length >= 3 && typeParams[2].trim() !== 'null') { // Has EntityDto
                            permissions.push(this.createPermissionDefinition(action_enum_1.Action.CREATE, entityName));
                        }
                        if (typeParams.length >= 4 && typeParams[3].trim() !== 'null') { // Has UpdateDto
                            permissions.push(this.createPermissionDefinition(action_enum_1.Action.UPDATE, entityName));
                        }
                        // Add DELETE permission by default too (since most controllers likely support it)
                        permissions.push(this.createPermissionDefinition(action_enum_1.Action.DELETE, entityName));
                    }
                }
            }
            catch (error) {
                this.logger.warn(`Error processing file ${file}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        return permissions;
    }
    /**
     * Helper to create a permission definition object
     */
    createPermissionDefinition(action, subject) {
        const actionName = this.capitalizeFirstLetter(action);
        return {
            action,
            subject,
            name: `${actionName} ${subject}`,
            description: `Permission to ${action.toLowerCase()} ${subject}`
        };
    }
    /**
     * Scan for controllers extending BaseController directly
     */
    async scanBaseControllerExtensions() {
        const permissions = [];
        const controllers = await this.findControllerFiles();
        const baseControllerPattern = /extends\s+(?:[\w.]+\.)?BaseController\s*<\s*\w+\s*,\s*\w+(?:\s*,\s*\w+)*\s*>/;
        const entityPattern = /(?:super\s*\(\s*[\w\s.,]+,\s*[\w\s.,]+,\s*['"](\w+)['"]|protected\s+readonly\s+entityName\s*[:=]\s*['"](\w+)['"])/;
        // Get all actions from the enum
        const allActions = Object.values(action_enum_1.Action);
        this.logger.debug(`Scanning ${controllers.length} controller files for BaseController extensions`);
        for (const file of controllers) {
            try {
                const fileContent = fs.readFileSync(file, 'utf8');
                // Skip files that use createController (we handle those separately)
                if (fileContent.includes('extends createController')) {
                    continue;
                }
                // Check if this extends BaseController directly
                if (baseControllerPattern.test(fileContent)) {
                    this.logger.debug(`Found BaseController extension in ${path.basename(file)}`);
                    // Extract entity name
                    const entityMatch = fileContent.match(entityPattern);
                    let entityName = null;
                    if (entityMatch) {
                        // Get the first capturing group that has a value
                        entityName = entityMatch[1] || entityMatch[2];
                        this.logger.debug(`Found entity name: ${entityName} in ${path.basename(file)}`);
                        // If entity name was found, create permissions for all actions
                        if (entityName) {
                            for (const action of allActions) {
                                permissions.push(this.createPermissionDefinition(action, entityName));
                            }
                        }
                    }
                    else {
                        // Try to infer entity name from controller name
                        const controllerName = path.basename(file, '.controller.ts');
                        if (controllerName) {
                            const inferredEntityName = this.singularize(controllerName);
                            this.logger.debug(`Inferred entity name from controller: ${inferredEntityName}`);
                            for (const action of allActions) {
                                permissions.push(this.createPermissionDefinition(action, inferredEntityName));
                            }
                        }
                    }
                }
            }
            catch (error) {
                this.logger.warn(`Error processing file ${file}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        return permissions;
    }
    /**
     * Capitalize first letter of a string
     */
    capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    /**
     * Simple singularization for English words
     */
    singularize(word) {
        if (word.endsWith('ies')) {
            return word.slice(0, -3) + 'y';
        }
        else if (word.endsWith('s') && !word.endsWith('ss')) {
            return word.slice(0, -1);
        }
        return word;
    }
    async createOrUpdatePermission(permDef) {
        // Check if permission already exists
        let permission = await this.permissionRepository.findOne({
            where: {
                action: permDef.action,
                subject: permDef.subject
            }
        });
        let isNew = false;
        if (!permission) {
            permission = this.permissionRepository.create({
                action: permDef.action,
                subject: permDef.subject,
                name: permDef.name,
                description: permDef.description
            });
            isNew = true;
        }
        else {
            // Update existing permission with any new metadata
            permission.name = permDef.name || permission.name;
            permission.description = permDef.description || permission.description;
        }
        await this.permissionRepository.save(permission);
        return { permission, isNew };
    }
    // Keep your existing scan methods
    async scanForPermissions() {
        // Existing code...
        return [];
    }
    extractNamedPermissions(fileContent, permissions) {
        // Existing code...
    }
    extractAuthorizationRules(fileContent, permissions) {
        // Existing code...
    }
    async findControllerFiles() {
        try {
            return await (0, glob_1.glob)('src/**/*.controller.ts', { ignore: 'node_modules/**' });
        }
        catch (err) {
            throw err;
        }
    }
    mapActionNameToEnum(actionName) {
        const map = {
            'Create': action_enum_1.Action.CREATE,
            'Read': action_enum_1.Action.READ,
            'Update': action_enum_1.Action.UPDATE,
            'Delete': action_enum_1.Action.DELETE,
            'Manage': action_enum_1.Action.MANAGE
        };
        return map[actionName] || action_enum_1.Action.READ;
    }
    removeDuplicates(permissions) {
        const uniqueSet = new Map();
        for (const perm of permissions) {
            const key = `${perm.action}:${perm.subject}`;
            uniqueSet.set(key, perm);
        }
        return Array.from(uniqueSet.values());
    }
};
exports.PermissionSeederService = PermissionSeederService;
exports.PermissionSeederService = PermissionSeederService = PermissionSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], PermissionSeederService);


/***/ }),
/* 104 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 105 */
/***/ ((module) => {

module.exports = require("glob");

/***/ }),
/* 106 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 107 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(108);
const passport_1 = __webpack_require__(61);
const common_module_1 = __webpack_require__(11);
const jwt_auth_guard_1 = __webpack_require__(60);
const permissions_guard_1 = __webpack_require__(62);
const roles_guard_1 = __webpack_require__(73);
const sessions_module_1 = __webpack_require__(109);
const users_module_1 = __webpack_require__(12);
const auth_controller_1 = __webpack_require__(113);
const auth_service_1 = __webpack_require__(117);
const jwt_service_1 = __webpack_require__(119);
const access_token_strategy_1 = __webpack_require__(123);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            common_module_1.CommonModule,
            config_1.ConfigModule,
            sessions_module_1.SessionsModule,
            users_module_1.UsersModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('ACCESS_TOKEN_SECRET'),
                    signOptions: { expiresIn: `${configService.get('ACCESS_TOKEN_EXPIRATION_MINUTES')}m` },
                }),
            }),
        ],
        providers: [auth_service_1.AuthService, jwt_service_1.JwtService, access_token_strategy_1.AccessTokenStrategy, jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard, roles_guard_1.RolesGuard],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, jwt_service_1.JwtService],
    })
], AuthModule);


/***/ }),
/* 108 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 109 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionsModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const users_module_1 = __webpack_require__(12);
const session_entity_1 = __webpack_require__(50);
const sessions_controller_1 = __webpack_require__(110);
const sessions_service_1 = __webpack_require__(112);
let SessionsModule = class SessionsModule {
};
exports.SessionsModule = SessionsModule;
exports.SessionsModule = SessionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([session_entity_1.Session]), users_module_1.UsersModule],
        providers: [sessions_service_1.SessionsService],
        exports: [sessions_service_1.SessionsService],
        controllers: [sessions_controller_1.SessionsController],
    })
], SessionsModule);


/***/ }),
/* 110 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionsController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const session_dto_1 = __webpack_require__(111);
const sessions_service_1 = __webpack_require__(112);
class SessionsController extends (0, create_controller_factory_1.createController)('Sessions', // Entity name for Swagger documentation
sessions_service_1.SessionsService, // The service handling Session-related operations
session_dto_1.GetSessionDto, // DTO for retrieving Sessions
session_dto_1.SessionDto, // DTO for creating Sessions
session_dto_1.UpdateSessionDto // DTO for updating Sessions
) {
    async create(entityDto, createdById) {
        return await super.create(entityDto, createdById);
    }
}
exports.SessionsController = SessionsController;


/***/ }),
/* 111 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetSessionDto = exports.UpdateSessionDto = exports.SessionDto = void 0;
const base_dto_1 = __webpack_require__(92);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
class SessionDto extends (0, swagger_1.PartialType)(base_dto_1.BaseDto) {
}
exports.SessionDto = SessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'userId123', description: 'The ID of the user' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SessionDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'refreshToken123', description: 'The refresh token for the session' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SessionDto.prototype, "refreshToken", void 0);
class UpdateSessionDto extends (0, swagger_1.PartialType)(SessionDto) {
}
exports.UpdateSessionDto = UpdateSessionDto;
class GetSessionDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateSessionDto, 'session') {
}
exports.GetSessionDto = GetSessionDto;


/***/ }),
/* 112 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionsService = void 0;
const base_service_1 = __webpack_require__(64);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const users_service_1 = __webpack_require__(63);
const session_entity_1 = __webpack_require__(50);
let SessionsService = class SessionsService extends base_service_1.BaseService {
    constructor(sessionsRepository, usersService) {
        super(sessionsRepository, usersService);
        this.sessionsRepository = sessionsRepository;
        this.usersService = usersService;
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], SessionsService);


/***/ }),
/* 113 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const authorize_decorator_1 = __webpack_require__(59);
const current_user_decorator_1 = __webpack_require__(75);
const jwt_payload_interface_1 = __webpack_require__(114);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const express_1 = __webpack_require__(115);
const google_auth_guard_1 = __webpack_require__(116);
const user_dto_1 = __webpack_require__(79);
const auth_service_1 = __webpack_require__(117);
const login_user_dto_1 = __webpack_require__(121);
const register_user_dto_1 = __webpack_require__(122);
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async googleOAuth() { }
    async login(loginDto, request, response) {
        const login = await this.authService.loginUser(loginDto, request);
        await this.authService.setAuthCookies(response, login);
        return login;
    }
    // @Public()
    // @Get('google/redirect')
    // @UseGuards(GoogleOAuthGuard)
    // async googleCallback(@Req() request: Request, @Res() response: Response) {
    //   const redirectUrl = new URL(`${this.commonService.getAppUrl}/login`);
    //   const user = request.user as IUser;
    //   try
    //   {
    //     const tokens: Tokens = await this.authService.googleOAuth(user);
    //     const responseWithCookies = this.authService.setAuthCookies(response, tokens);
    //     redirectUrl.searchParams.set('auth', 'success');
    //     return responseWithCookies.redirect(redirectUrl.toString());
    //   }
    //   catch (error) {
    //     redirectUrl.searchParams.set('auth', 'failed');
    //     return response.redirect(redirectUrl.toString());
    //   }
    // }
    async refreshToken(bodyRefreshToken, request, response) {
        var _a;
        // Get refresh token from cookies or request body
        const refreshToken = ((_a = request.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) ||
            bodyRefreshToken;
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token not found');
        }
        const tokens = await this.authService.refreshTokens(refreshToken);
        await this.authService.setAuthCookies(response, tokens);
        return tokens;
    }
    async logout(bodyRefreshToken, request, response) {
        var _a;
        // Get refresh token from cookies or request body
        const refreshToken = ((_a = request.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) ||
            bodyRefreshToken;
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token not found');
        }
        await this.authService.logoutUser(refreshToken, response);
        return { message: 'Logged out successfully' };
    }
    async register(registerDto) {
        return (0, class_transformer_1.plainToInstance)(user_dto_1.GetUserDto, this.authService.registerUser(registerDto));
    }
    // @Get('google')
    // @UseGuards(GoogleAuthGuard)
    // @ApiOperation({ summary: 'Login with Google' })
    // @ApiResponse({ status: 200, description: 'Redirect to Google login.' })
    // async googleAuth(@Request() req) {}
    // @Get('google/redirect')
    // @UseGuards(GoogleAuthGuard)
    // @ApiOperation({ summary: 'Google login redirect' })
    // @ApiResponse({ status: 200, description: 'User logged in with Google successfully.' })
    // googleAuthRedirect(@Request() req) {
    //   return this.authService.googleLogin(req);
    // }
    getCurrentUser(user) {
        return user;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleOAuth", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User logged in successfully.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof login_user_dto_1.LoginUserDto !== "undefined" && login_user_dto_1.LoginUserDto) === "function" ? _b : Object, typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object, typeof (_d = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token using refresh token' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                refreshToken: {
                    type: 'string',
                    description: 'Refresh token (optional if provided in cookies)',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Access token refreshed successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Refresh token not found or invalid' }),
    __param(0, (0, common_1.Body)('refreshToken')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_e = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _e : Object, typeof (_f = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                refreshToken: {
                    type: 'string',
                    description: 'Refresh token (optional if provided in cookies)',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User logged out successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Refresh token not found or invalid' }),
    __param(0, (0, common_1.Body)('refreshToken')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_g = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _g : Object, typeof (_h = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof register_user_dto_1.RegisterUserDto !== "undefined" && register_user_dto_1.RegisterUserDto) === "function" ? _j : Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current authenticated user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return authenticated user details'
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_l = typeof jwt_payload_interface_1.IJwtPayload !== "undefined" && jwt_payload_interface_1.IJwtPayload) === "function" ? _l : Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getCurrentUser", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ }),
/* 114 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 115 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 116 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GoogleAuthGuard = void 0;
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(61);
let GoogleAuthGuard = class GoogleAuthGuard extends (0, passport_1.AuthGuard)('google-auth') {
};
exports.GoogleAuthGuard = GoogleAuthGuard;
exports.GoogleAuthGuard = GoogleAuthGuard = __decorate([
    (0, common_1.Injectable)()
], GoogleAuthGuard);


/***/ }),
/* 117 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const utility_helper_1 = __webpack_require__(68);
const common_service_1 = __webpack_require__(83);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const bcrypt = __importStar(__webpack_require__(118));
const sessions_service_1 = __webpack_require__(112);
const users_service_1 = __webpack_require__(63);
const jwt_service_1 = __webpack_require__(119);
let AuthService = AuthService_1 = class AuthService {
    constructor(usersService, jwtService, configService, commonService, sessionsService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.commonService = commonService;
        this.sessionsService = sessionsService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.commonCookieOptions = {
            httpOnly: true,
            secure: this.commonService.isProduction(),
            // sameSite: 'lax',
            maxAge: this.configService.getOrThrow('ACCESS_TOKEN_EXPIRATION_MINUTES') * 60 * 1000,
        };
    }
    async validateUser(model) {
        // check if emailOrUserName property is an email
        var user = null;
        if (utility_helper_1.UtilityHelper.isEmail(model.emailOrUserName)) {
            // check if email exists
            user = await this.usersService.findOneBy({ email: model.emailOrUserName.toLowerCase().trim() }, { relations: { employee: { roles: true } } });
            if (!user) {
                return null;
            }
        }
        else {
            // check if username exists
            user = await this.usersService.findOneBy({ userName: model.emailOrUserName.toLowerCase().trim() }, { relations: { employee: { roles: true } } });
            if (!user) {
                return null;
            }
        }
        if (!user || !(await bcrypt.compare(model.password, user.password))) {
            return null;
        }
        return user;
    }
    //   /**
    //  * Validates a user from social authentication providers (Google, Facebook, etc.)
    //  * Handles user creation, updates, and generates authentication tokens.
    //  * 
    //  * @param socialUser User data received from the OAuth provider
    //  * @returns User entity with tokens
    //  */
    // async validateSocialUser(socialUser: ISocialUser): Promise<any> {
    //   const { email, provider, providerId, firstName, lastName, picture } = socialUser;
    //   this.logger.log(`Validating social user: ${email} from ${provider}`);
    //   // Start a transaction to ensure data consistency
    //   return await this.transactionService.executeInTransaction(async (manager) => {
    //     const userRepository = manager. y(User);
    //     // Try to find existing user by email
    //     let user = await userRepository.findOne({ 
    //       where: { email },
    //       relations: ['socialLogins'],
    //     });
    //     // Try to find by social provider ID if not found by email
    //     if (!user) {
    //       const socialLoginRepository = manager.getRepository(SocialLogin);
    //       const socialLogin = await socialLoginRepository.findOne({
    //         where: { provider, providerId },
    //         relations: ['user'],
    //       });
    //       if (socialLogin) {
    //         user = socialLogin.user;
    //       }
    //     }
    //     // If we found a user, update their information
    //     if (user) {
    //       this.logger.log(`Found existing user with email ${email}`);
    //       // Check if user is active
    //       if (user.isActive === false) {
    //         this.logger.warn(`User ${email} account is deactivated`);
    //         throw new UnauthorizedException('Your account has been deactivated');
    //       }
    //       // Ensure this social login is linked to the user's account
    //       const socialLoginRepository = manager.getRepository(SocialLogin);
    //       let socialLogin = await socialLoginRepository.findOne({
    //         where: { 
    //           user: { id: user.id },
    //           provider,
    //           providerId,
    //         },
    //       });
    //       // Link this social provider if not already linked
    //       if (!socialLogin) {
    //         socialLogin = socialLoginRepository.create({
    //           user,
    //           provider,
    //           providerId,
    //           lastLogin: new Date(),
    //         });
    //         await socialLoginRepository.save(socialLogin);
    //         this.logger.log(`Linked ${provider} account to existing user ${email}`);
    //       } else {
    //         // Update last login time
    //         socialLogin.lastLogin = new Date();
    //         await socialLoginRepository.save(socialLogin);
    //       }
    //     } 
    //     // Create new user if not found
    //     else {
    //       this.logger.log(`Creating new user for ${email} from ${provider}`);
    //       // Create user with data from social profile
    //       user = userRepository.create({
    //         email,
    //         firstName: firstName || '',
    //         lastName: lastName || '',
    //         profileImage: picture,
    //         isEmailVerified: true, // Social logins are considered verified
    //         lastLoginAt: new Date(),
    //       });
    //       // Try to auto-assign default role (e.g., "user")
    //       try {
    //         const roleRepository = manager.getRepository(Role);
    //         const userRole = await roleRepository.findOne({ 
    //           where: { name: 'user' } 
    //         });
    //         if (userRole) {
    //           user.roles = [userRole];
    //         }
    //       } catch (error) {
    //         this.logger.warn(`Could not assign default role to new user: ${error.message}`);
    //       }
    //       // Save the new user
    //       user = await userRepository.save(user);
    //       // Create social login record
    //       const socialLoginRepository = manager.getRepository(SocialLogin);
    //       const socialLogin = socialLoginRepository.create({
    //         user,
    //         provider,
    //         providerId,
    //         lastLogin: new Date(),
    //       });
    //       await socialLoginRepository.save(socialLogin);
    //     }
    //     // Update profile information if missing or incomplete
    //     let needsUpdate = false;
    //     if (!user.firstName && firstName) {
    //       user.firstName = firstName;
    //       needsUpdate = true;
    //     }
    //     if (!user.lastName && lastName) {
    //       user.lastName = lastName;
    //       needsUpdate = true;
    //     }
    //     if (!user.profileImage && picture) {
    //       user.profileImage = picture;
    //       needsUpdate = true;
    //     }
    //     if (needsUpdate) {
    //       await userRepository.save(user);
    //     }
    //     // Generate tokens for the user
    //     const tokens = await this.jwtService.generateTokens(user);
    //     // Return user with tokens
    //     return {
    //       user: this.usersService.sanitizeUser(user),
    //       ...tokens
    //     };
    //   });
    // }
    async registerUser(model) {
        // check if user already exists
        const existingEmail = await this.usersService.findOneBy({ email: model.email.toLowerCase().trim() });
        const existingUserName = await this.usersService.findOneBy({ userName: model.userName.toLowerCase().trim() });
        if (existingEmail) {
            // throw error if user already exists
            throw new common_1.ConflictException('Email is already used by another user.');
        }
        if (existingUserName) {
            // throw error if user already exists
            throw new common_1.ConflictException('Username is already used by another user.');
        }
        // create new user
        return this.usersService.signUpUser(model);
    }
    clearAuthCookies(response) {
        response.clearCookie('accessToken', this.commonCookieOptions);
        response.clearCookie('refreshToken', this.commonCookieOptions);
        return response;
    }
    setAuthCookies(response, tokens) {
        const accessTokenExpirationMinutes = this.configService.getOrThrow('ACCESS_TOKEN_EXPIRATION_MINUTES');
        const refreshTokenExpirationMinutes = this.configService.getOrThrow('REFRESH_TOKEN_EXPIRATION_MINUTES');
        // Set access token cookie
        response.cookie('accessToken', tokens.accessToken, Object.assign(Object.assign({}, this.commonCookieOptions), { maxAge: accessTokenExpirationMinutes * 60 * 1000 }));
        // response.cookie('refreshToken', tokens.refreshToken, {
        //   ...this.commonCookieOptions,
        //   maxAge: refreshTokenExpirationMinutes * 60 * 1000,
        // });
    }
    async logoutUser(refreshToken, response) {
        // Find the session with this refresh token
        const session = await this.sessionsService.findOneBy({ refreshToken });
        if (session) {
            // Update last active instead of deleting
            await this.sessionsService.update(session.id, {
                lastActiveAt: new Date(),
            });
        }
        // Clear auth cookies
        this.clearAuthCookies(response);
    }
    async refreshTokens(refreshToken) {
        const session = await this.sessionsService.findOneBy({ refreshToken }, {
            relations: {
                user: { employee: { roles: true } } // Include nested employee relation
            },
            order: { createdAt: 'DESC' }, // Get the newest session first
        });
        if (!session) {
            throw new common_1.UnauthorizedException('Session not found');
        }
        if (session.expiresAt && session.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        // Check if user exists
        const user = session.user;
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        // Create new tokens
        const newRefreshToken = await this.jwtService.createRefreshToken();
        const newPayload = this.jwtService.createPayload(user, newRefreshToken);
        const accessToken = await this.jwtService.createToken(newPayload);
        return {
            accessToken,
        };
    }
    // login user
    async loginUser(model, req) {
        var user = await this.validateUser(model);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const refreshToken = await this.jwtService.createRefreshToken();
        const payload = this.jwtService.createPayload(user, refreshToken);
        const accessToken = await this.jwtService.createToken(payload);
        // Calculate expiration time for refresh token
        const refreshTokenExpirationMinutes = this.configService.getOrThrow('REFRESH_TOKEN_EXPIRATION_MINUTES');
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + refreshTokenExpirationMinutes * 2);
        // save refresh token to database
        await this.sessionsService.create({
            refreshToken,
            userId: user.id,
            expiresAt,
            userAgent: req === null || req === void 0 ? void 0 : req.headers['user-agent'],
            ipAddress: req === null || req === void 0 ? void 0 : req.ip,
            deviceId: Array.isArray(req === null || req === void 0 ? void 0 : req.headers['device-id'])
                ? req === null || req === void 0 ? void 0 : req.headers['device-id'][0]
                : req === null || req === void 0 ? void 0 : req.headers['device-id'],
        }, user.id);
        const response = {
            accessToken,
        };
        return response;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object, typeof (_b = typeof jwt_service_1.JwtService !== "undefined" && jwt_service_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object, typeof (_d = typeof common_service_1.CommonService !== "undefined" && common_service_1.CommonService) === "function" ? _d : Object, typeof (_e = typeof sessions_service_1.SessionsService !== "undefined" && sessions_service_1.SessionsService) === "function" ? _e : Object])
], AuthService);


/***/ }),
/* 118 */
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),
/* 119 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JwtService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtService = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(108);
const uuid_1 = __webpack_require__(120);
/**
 * Service responsible for JWT (JSON Web Token) operations.
 * Provides methods for creating, verifying, and decoding JWT tokens,
 * as well as managing JWT payloads.
 */
/**
 * @class JwtService
 * @injectable
 */
/**
 * @constructor
 * @param {NestJwtService} jwtService - The NestJS JWT service instance
 */
/**
 * Creates a JWT token from the provided payload
 * @method createToken
 * @param {IJwtPayload} payload - The payload to be encoded in the JWT
 * @returns {Promise<string>} A Promise that resolves to the JWT string
 */
/**
 * Verifies and decodes a JWT token
 * @method verifyToken
 * @param {string} token - The JWT token to verify
 * @returns {Promise<IJwtPayload>} A Promise that resolves to the decoded payload
 * @throws {Error} If the token is invalid or expired
 */
/**
 * Decodes a JWT token without verifying its signature
 * @method decodeToken
 * @param {string} token - The JWT token to decode
 * @returns {Promise<IJwtPayload>} A Promise that resolves to the decoded payload
 */
/**
 * Creates a standard JWT payload with common claims
 * @method createPayload
 * @param {string} userId - The user's unique identifier
 * @param {string} [email] - Optional email address
 * @param {string[]} [roles] - Optional array of user roles
 * @returns {IJwtPayload} The formatted JWT payload
 */
/**
 * Validates the structure of a JWT payload
 * @method validatePayload
 * @param {any} payload - The payload to validate
 * @returns {boolean} True if the payload matches the IJwtPayload structure
 */
/**
 * Service responsible for handling JSON Web Token (JWT) operations.
 * Provides functionality for creating, verifying, and decoding JWT tokens.
 *
 * @class
 */
/**
 * @constructor
 * @param {NestJwtService} jwtService - The NestJS JWT service instance
 * @param {ConfigService} configService - The configuration service for accessing environment variables
 */
/**
 * Creates a JWT token from the provided payload
 * @param {IJwtPayload} payload - The payload to be encoded in the token
 * @returns {Promise<string>} A Promise that resolves to the signed JWT token
 */
/**
 * Creates a refresh token from the provided payload with configurable expiration
 * @param {IJwtPayload} payload - The payload to be encoded in the refresh token
 * @returns {Promise<string>} A Promise that resolves to the signed refresh token
 */
/**
 * Verifies and decodes a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Promise<IJwtPayload>} A Promise that resolves to the decoded and verified payload
 * @throws {Error} If the token is invalid or expired
 */
/**
 * Decodes a JWT token without verification
 * @param {string} token - The JWT token to decode
 * @returns {Promise<IJwtPayload>} A Promise that resolves to the decoded payload
 */
/**
 * Creates a standard JWT payload with user information and expiration
 * @param {string} userId - The unique identifier of the user
 * @param {string} [email] - Optional email of the user
 * @param {string[]} [roles] - Optional array of user roles
 * @returns {IJwtPayload} The created JWT payload object
 */
/**
 * Validates the structure of a JWT payload
 * @param {any} payload - The payload to validate
 * @returns {boolean} True if the payload matches the expected structure, false otherwise
 */
let JwtService = JwtService_1 = class JwtService {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(JwtService_1.name);
    }
    /**
     * Create a JWT token from payload
     */
    async createToken(payload) {
        return this.jwtService.sign(payload);
    }
    /**
     * Create a refresh token from payload
     */
    async createRefreshToken() {
        // const refreshTokenExpirationMinutes: number = this.configService.getOrThrow<number>('REFRESH_TOKEN_EXPIRATION_MINUTES');
        // return this.jwtService.sign(payload, { expiresIn: `${refreshTokenExpirationMinutes}m` });
        return (0, uuid_1.v4)();
    }
    /**
     * Verify and decode a JWT token
     */
    async verifyToken(token) {
        return this.jwtService.verify(token);
    }
    /**
     * Decode a JWT token without verifying
     */
    async decodeToken(token) {
        return this.jwtService.decode(token);
    }
    /**
     * Create a standard JWT payload
     */
    createPayload(user, refreshToken) {
        var _a, _b, _c;
        const now = Math.floor(Date.now() / 1000);
        const mappedRoles = ((_a = user.employee) === null || _a === void 0 ? void 0 : _a.roles) ? (_b = user.employee) === null || _b === void 0 ? void 0 : _b.roles.map(role => ({
            name: role.name,
            scope: role.scope
        })) : [];
        return {
            sub: user.id,
            iat: now,
            refreshToken,
            email: user.email,
            roles: mappedRoles !== null && mappedRoles !== void 0 ? mappedRoles : [],
            employeeId: (_c = user.employee) === null || _c === void 0 ? void 0 : _c.id
        };
    }
    /**
     * Validate payload structure
     */
    validatePayload(payload) {
        return (typeof payload === 'object' &&
            typeof payload.sub === 'string' &&
            (!payload.email || typeof payload.email === 'string') &&
            (!payload.roles || Array.isArray(payload.roles)));
    }
};
exports.JwtService = JwtService;
exports.JwtService = JwtService = JwtService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], JwtService);


/***/ }),
/* 120 */
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),
/* 121 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoginUserDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
class LoginUserDto {
}
exports.LoginUserDto = LoginUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com', description: 'The email or username of the user' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LoginUserDto.prototype, "emailOrUserName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password', description: 'The password of the user' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginUserDto.prototype, "password", void 0);


/***/ }),
/* 122 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegisterUserDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
const profile_dto_1 = __webpack_require__(81);
class RegisterUserDto {
}
exports.RegisterUserDto = RegisterUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com', description: 'The email of the user' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email address' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user', description: 'The username of the user' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[a-z0-9]+$/, { message: 'Username must contain only lowercase letters and numbers' }),
    (0, class_validator_1.MinLength)(5, { message: 'Username must be at least 5 characters long' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "userName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password', description: 'The password of the user' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.Matches)(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password', description: 'The password confirmation' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8, { message: 'Confirm Password must be at least 8 characters long' }),
    (0, class_validator_1.Matches)(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, { message: 'Confirm Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }),
    (0, class_validator_1.ValidateIf)((o) => o.password === o.confirmPassword, { message: 'Passwords do not match' }),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "confirmPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Profile information', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => profile_dto_1.ProfileDto),
    __metadata("design:type", typeof (_a = typeof profile_dto_1.ProfileDto !== "undefined" && profile_dto_1.ProfileDto) === "function" ? _a : Object)
], RegisterUserDto.prototype, "profile", void 0);


/***/ }),
/* 123 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccessTokenStrategy = void 0;
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(61);
const passport_jwt_1 = __webpack_require__(124);
const jwt_service_1 = __webpack_require__(119);
let AccessTokenStrategy = class AccessTokenStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    constructor(configService, jwtService, userService) {
        super({
            // Combine extractors to check both the Authorization header and the query parameter
            jwtFromRequest: (req) => {
                // Try to extract JWT from the Authorization header
                const authHeaderToken = passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken()(req);
                if (authHeaderToken) {
                    return authHeaderToken;
                }
                // If not found, try to extract JWT from the query parameter named 'token'
                const queryToken = passport_jwt_1.ExtractJwt.fromUrlQueryParameter('token')(req);
                return queryToken;
            },
            secretOrKey: configService.getOrThrow('ACCESS_TOKEN_SECRET'),
            ignoreExpiration: false,
        });
        this.configService = configService;
        this.jwtService = jwtService;
        this.userService = userService;
    }
    async validate(payload) {
        if (!this.jwtService.validatePayload(payload)) {
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        const user = await this.userService.findOneBy({ id: payload.sub });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        return payload;
    }
};
exports.AccessTokenStrategy = AccessTokenStrategy;
exports.AccessTokenStrategy = AccessTokenStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof jwt_service_1.JwtService !== "undefined" && jwt_service_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _c : Object])
], AccessTokenStrategy);


/***/ }),
/* 124 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 125 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProfilesModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const users_module_1 = __webpack_require__(12);
const profile_entity_1 = __webpack_require__(39);
const profiles_controller_1 = __webpack_require__(126);
const profiles_service_1 = __webpack_require__(127);
let ProfilesModule = class ProfilesModule {
};
exports.ProfilesModule = ProfilesModule;
exports.ProfilesModule = ProfilesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([profile_entity_1.Profile]), users_module_1.UsersModule],
        controllers: [profiles_controller_1.ProfilesController],
        providers: [profiles_service_1.ProfilesService],
        exports: [profiles_service_1.ProfilesService],
    })
], ProfilesModule);


/***/ }),
/* 126 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProfilesController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const profile_dto_1 = __webpack_require__(81);
const profiles_service_1 = __webpack_require__(127);
class ProfilesController extends (0, create_controller_factory_1.createController)('Profiles', // Entity name for Swagger documentation
profiles_service_1.ProfilesService, // The service handling Profile-related operations
profile_dto_1.GetProfileDto, // DTO for retrieving profiles
profile_dto_1.ProfileDto, // DTO for creating profiles
profile_dto_1.UpdateProfileDto) {
    findAllAdvanced(paginationDto) {
        return super.findAllAdvanced(paginationDto);
    }
    async findOne(id) {
        return await super.findOne(id);
    }
    delete(id) {
        return super.delete(id);
    }
    deleteMany(ids, hardDelete) {
        return super.deleteMany(ids, hardDelete);
    }
}
exports.ProfilesController = ProfilesController;


/***/ }),
/* 127 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProfilesService = void 0;
const base_service_1 = __webpack_require__(64);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const users_service_1 = __webpack_require__(63);
const profile_entity_1 = __webpack_require__(39);
let ProfilesService = class ProfilesService extends base_service_1.BaseService {
    constructor(ProfilesRepository, usersService) {
        super(ProfilesRepository, usersService);
        this.ProfilesRepository = ProfilesRepository;
        this.usersService = usersService;
    }
};
exports.ProfilesService = ProfilesService;
exports.ProfilesService = ProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(profile_entity_1.Profile)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], ProfilesService);


/***/ }),
/* 128 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UserSeederService_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserSeederService = void 0;
const employment_condition_enum_1 = __webpack_require__(28);
const employment_status_enum_1 = __webpack_require__(29);
const employment_type_enum_1 = __webpack_require__(30);
const role_scope_type_enum_1 = __webpack_require__(32);
const role_enum_1 = __webpack_require__(72);
const auth_service_1 = __webpack_require__(117);
const employees_service_1 = __webpack_require__(94);
const roles_service_1 = __webpack_require__(95);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const bcrypt = __importStar(__webpack_require__(118));
const users_service_1 = __webpack_require__(63);
let UserSeederService = UserSeederService_1 = class UserSeederService {
    constructor(usersService, authService, rolesService, employeesService, configService) {
        this.usersService = usersService;
        this.authService = authService;
        this.rolesService = rolesService;
        this.employeesService = employeesService;
        this.configService = configService;
        this.logger = new common_1.Logger(UserSeederService_1.name);
    }
    async onModuleInit() {
        await this.seedSuperAdmin();
    }
    async seedSuperAdmin() {
        var _a, _b, _c, _d;
        const superAdminEmail = this.configService.getOrThrow('SUPER_ADMIN_EMAIL');
        const superAdminPassword = this.configService.getOrThrow('SUPER_ADMIN_PASSWORD');
        this.logger.log('Checking if super admin role exists...');
        const superAdminRole = await this.seedSuperAdminRole();
        const employeeRole = await this.seedEmployeeRole();
        let superAdminEmployee = await this.seedSuperAdminEmployee();
        // check if super admin employee has the super admin and employee role
        const hasSuperAdminAndEmployeeRole = ((_a = superAdminEmployee.roles) === null || _a === void 0 ? void 0 : _a.some(role => role.name === role_enum_1.Role.SUPERADMIN)) &&
            ((_b = superAdminEmployee.roles) === null || _b === void 0 ? void 0 : _b.some(role => role.name === role_enum_1.Role.EMPLOYEE));
        if (!hasSuperAdminAndEmployeeRole) {
            this.logger.warn('Super admin employee does not have the super admin and employee role');
            superAdminEmployee.roles = [superAdminRole, employeeRole];
            await this.employeesService.update(superAdminEmployee.id, superAdminEmployee);
            this.logger.log('Super admin employee associated with the super admin and employee role successfully');
        }
        else {
            this.logger.log('Super admin employee already has the super admin and employee role');
        }
        // Check if super admin user exists
        let superAdminUser = await this.usersService.findOneBy({ employee: { id: superAdminEmployee.id } }, { relations: { employee: true } });
        if (!superAdminUser) {
            // Check if super admin user exists with the super admin email
            superAdminUser = await this.usersService.findOneBy({ email: superAdminEmail });
            if (superAdminUser) {
                this.logger.warn('Super admin user exists but is not associated with the super admin employee');
                superAdminEmployee.user = superAdminUser;
            }
            else {
                this.logger.log('Creating super admin user...');
                // create super admin user
                superAdminUser = await this.usersService.create({
                    email: superAdminEmail,
                    password: await bcrypt.hash(superAdminPassword, 10),
                    userName: superAdminEmail,
                    employee: superAdminEmployee
                });
                this.logger.log('Super admin user created successfully');
            }
        }
        else {
            // Check if super admin email is the same as the one in the config
            if (superAdminUser.email !== superAdminEmail) {
                // log super admin email
                this.logger.log('Super admin email is different from the one in the config');
                this.logger.log('Super admin user exists with email or username: ' + superAdminUser.email);
                this.logger.log('Super admin email: ' + superAdminEmail);
                this.logger.warn('Super admin email is different from the one in the config');
                // Update super admin email to the one in the config
                superAdminUser.email = superAdminEmail;
                superAdminUser.userName = superAdminEmail;
                await this.usersService.update(superAdminUser.id, superAdminUser);
                this.logger.log('Super admin email updated successfully');
            }
            // log super admin exist email
            this.logger.log('Super admin user exists with email or username: ' + superAdminUser.email);
            // check if password is the same as the one in the config
            var loginCredentials = {
                emailOrUserName: (_c = superAdminUser.email) !== null && _c !== void 0 ? _c : "",
                password: superAdminPassword
            };
            if (await this.authService.validateUser(loginCredentials)) {
                this.logger.log('Super admin password is the same as the one in the config');
            }
            else {
                this.logger.warn('Super admin password is different from the one in the config');
                // Update super admin password to the one in the config
                superAdminUser.password = await bcrypt.hash(superAdminPassword, 10);
                await this.usersService.update(superAdminUser.id, superAdminUser);
                this.logger.log('Super admin password updated successfully');
            }
        }
        // check if superAdminUser is associated with the super admin employee
        if (((_d = superAdminUser.employee) === null || _d === void 0 ? void 0 : _d.id) !== superAdminEmployee.id) {
            this.logger.warn('Super admin user is not associated with the super admin employee');
            superAdminUser.employee = superAdminEmployee;
            await this.usersService.update(superAdminUser.id, superAdminUser);
            this.logger.log('Super admin user associated with the super admin employee successfully');
        }
    }
    async seedSuperAdminRole() {
        // Check if super admin role exists
        let superAdminRole = await this.rolesService.findOneBy({ name: role_enum_1.Role.SUPERADMIN });
        // Create super admin role if it doesn't exist
        if (!superAdminRole) {
            this.logger.log('Creating SuperAdmin role...');
            superAdminRole = await this.rolesService.create({
                name: role_enum_1.Role.SUPERADMIN,
                description: 'Super Admin Role',
                scope: role_scope_type_enum_1.RoleScopeType.GLOBAL,
            });
            this.logger.log('SuperAdmin role created successfully');
        }
        else {
            this.logger.log('SuperAdmin role already exists');
        }
        return superAdminRole;
    }
    async seedEmployeeRole() {
        // Check if employee role exists
        let employeeRole = await this.rolesService.findOneBy({ name: role_enum_1.Role.EMPLOYEE });
        // Create employee role if it doesn't exist
        if (!employeeRole) {
            this.logger.log('Creating Employee role...');
            employeeRole = await this.rolesService.create({
                name: role_enum_1.Role.EMPLOYEE,
                description: 'Employee Role',
                scope: role_scope_type_enum_1.RoleScopeType.OWNED,
            });
            this.logger.log('Employee role created successfully');
        }
        else {
            this.logger.log('Employee role already exists');
        }
        return employeeRole;
    }
    async seedSuperAdminEmployee() {
        // Check if super admin employee exists
        let superAdminEmployee = await this.employeesService.findOneBy({ employeeNumber: 'SA-001' }, { relations: { roles: true } });
        // Create super admin employee if it doesn't exist
        if (!superAdminEmployee) {
            this.logger.log('Creating SuperAdmin employee...');
            superAdminEmployee = await this.employeesService.create({
                employeeNumber: 'SA-001',
                employmentStatus: employment_status_enum_1.EmploymentStatus.ACTIVE,
                employmentCondition: employment_condition_enum_1.EmploymentCondition.REGULAR,
                employmentType: employment_type_enum_1.EmploymentType.FULL_TIME,
                commencementDate: new Date(),
            });
            this.logger.log('SuperAdmin employee created successfully');
        }
        else {
            this.logger.log('SuperAdmin employee already exists');
        }
        return superAdminEmployee;
    }
};
exports.UserSeederService = UserSeederService;
exports.UserSeederService = UserSeederService = UserSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object, typeof (_b = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _b : Object, typeof (_c = typeof roles_service_1.RolesService !== "undefined" && roles_service_1.RolesService) === "function" ? _c : Object, typeof (_d = typeof employees_service_1.EmployeesService !== "undefined" && employees_service_1.EmployeesService) === "function" ? _d : Object, typeof (_e = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _e : Object])
], UserSeederService);


/***/ }),
/* 129 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AddressesModule = void 0;
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(13);
const users_module_1 = __webpack_require__(12);
const addresses_service_1 = __webpack_require__(130);
const address_entity_1 = __webpack_require__(36);
let AddressesModule = class AddressesModule {
};
exports.AddressesModule = AddressesModule;
exports.AddressesModule = AddressesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([address_entity_1.Address]), users_module_1.UsersModule,
            core_1.RouterModule.register([
                {
                    path: 'addresses',
                    module: AddressesModule
                },
            ]),],
        providers: [addresses_service_1.AddressesService],
        exports: [addresses_service_1.AddressesService],
    })
], AddressesModule);


/***/ }),
/* 130 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AddressesService = void 0;
const base_service_1 = __webpack_require__(64);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const users_service_1 = __webpack_require__(63);
const address_entity_1 = __webpack_require__(36);
let AddressesService = class AddressesService extends base_service_1.BaseService {
    constructor(AddressesService, usersService) {
        super(AddressesService, usersService);
        this.AddressesService = AddressesService;
        this.usersService = usersService;
    }
};
exports.AddressesService = AddressesService;
exports.AddressesService = AddressesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(address_entity_1.Address)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], AddressesService);


/***/ }),
/* 131 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttendanceManagementModule = void 0;
const users_module_1 = __webpack_require__(12);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(13);
const attendances_controller_1 = __webpack_require__(132);
const attendances_service_1 = __webpack_require__(134);
const attendance_entity_1 = __webpack_require__(135);
const work_hour_module_1 = __webpack_require__(136);
const work_time_module_1 = __webpack_require__(141);
let AttendanceManagementModule = class AttendanceManagementModule {
};
exports.AttendanceManagementModule = AttendanceManagementModule;
exports.AttendanceManagementModule = AttendanceManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([attendance_entity_1.Attendance]),
            users_module_1.UsersModule,
            core_1.RouterModule.register([
                {
                    path: 'attendances',
                    module: AttendanceManagementModule,
                    children: [
                        {
                            path: 'work-time',
                            module: work_time_module_1.WorkTimeModule
                        },
                        {
                            path: 'work-hour',
                            module: work_hour_module_1.WorkHourModule
                        }
                    ]
                }
            ]),
            work_time_module_1.WorkTimeModule,
            work_hour_module_1.WorkHourModule,
        ],
        providers: [attendances_service_1.AttendancesService],
        exports: [
            attendances_service_1.AttendancesService,
            work_time_module_1.WorkTimeModule,
            work_hour_module_1.WorkHourModule,
        ],
        controllers: [attendances_controller_1.AttendancesController],
    })
], AttendanceManagementModule);


/***/ }),
/* 132 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttendancesController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const attendance_dto_1 = __webpack_require__(133);
const attendances_service_1 = __webpack_require__(134);
class AttendancesController extends (0, create_controller_factory_1.createController)('Attendances', // Entity name for Swagger documentation
attendances_service_1.AttendancesService, // The service handling Attendance-related operations
attendance_dto_1.GetAttendanceDto, // DTO for retrieving Attendances
attendance_dto_1.AttendanceDto, // DTO for creating Attendances
attendance_dto_1.UpdateAttendanceDto) {
}
exports.AttendancesController = AttendancesController;


/***/ }),
/* 133 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetAttendanceDto = exports.UpdateAttendanceDto = exports.AttendanceDto = void 0;
const base_dto_1 = __webpack_require__(92);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
const swagger_2 = __webpack_require__(4);
class AttendanceDto extends (0, swagger_2.PartialType)(base_dto_1.BaseDto) {
}
exports.AttendanceDto = AttendanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the attendance' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttendanceDto.prototype, "name", void 0);
class UpdateAttendanceDto extends (0, swagger_2.PartialType)(AttendanceDto) {
}
exports.UpdateAttendanceDto = UpdateAttendanceDto;
class GetAttendanceDto extends (0, create_get_dto_factory_1.createGetDto)(AttendanceDto) {
}
exports.GetAttendanceDto = GetAttendanceDto;


/***/ }),
/* 134 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttendancesService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const attendance_entity_1 = __webpack_require__(135);
let AttendancesService = class AttendancesService extends base_service_1.BaseService {
    constructor(attendancesRepository, usersService) {
        super(attendancesRepository, usersService);
        this.attendancesRepository = attendancesRepository;
        this.usersService = usersService;
    }
};
exports.AttendancesService = AttendancesService;
exports.AttendancesService = AttendancesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], AttendancesService);


/***/ }),
/* 135 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Attendance = void 0;
const base_entity_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(17);
let Attendance = class Attendance extends base_entity_1.BaseEntity {
};
exports.Attendance = Attendance;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attendance.prototype, "name", void 0);
exports.Attendance = Attendance = __decorate([
    (0, typeorm_1.Entity)('attendances')
], Attendance);


/***/ }),
/* 136 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkHourModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const users_module_1 = __webpack_require__(12);
const work_hour_controller_1 = __webpack_require__(137);
const work_hour_service_1 = __webpack_require__(139);
const work_hour_entity_1 = __webpack_require__(140);
let WorkHourModule = class WorkHourModule {
};
exports.WorkHourModule = WorkHourModule;
exports.WorkHourModule = WorkHourModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([work_hour_entity_1.WorkHour]),
            users_module_1.UsersModule,
        ],
        providers: [work_hour_service_1.WorkHourService],
        exports: [work_hour_service_1.WorkHourService],
        controllers: [work_hour_controller_1.WorkHourController],
    })
], WorkHourModule);


/***/ }),
/* 137 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkHourController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const work_hour_dto_1 = __webpack_require__(138);
const work_hour_service_1 = __webpack_require__(139);
class WorkHourController extends (0, create_controller_factory_1.createController)('WorkHours', // Entity name for Swagger documentation
work_hour_service_1.WorkHourService, // The service handling WorkHour-related operations
work_hour_dto_1.GetWorkHourDto, // DTO for retrieving WorkHours
work_hour_dto_1.WorkHourDto, // DTO for creating WorkHours
work_hour_dto_1.UpdateWorkHourDto) {
}
exports.WorkHourController = WorkHourController;


/***/ }),
/* 138 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetWorkHourDto = exports.UpdateWorkHourDto = exports.WorkHourDto = void 0;
const base_dto_1 = __webpack_require__(92);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
const swagger_2 = __webpack_require__(4);
class WorkHourDto extends (0, swagger_2.PartialType)(base_dto_1.BaseDto) {
}
exports.WorkHourDto = WorkHourDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the work-hour' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkHourDto.prototype, "name", void 0);
class UpdateWorkHourDto extends (0, swagger_2.PartialType)(WorkHourDto) {
}
exports.UpdateWorkHourDto = UpdateWorkHourDto;
class GetWorkHourDto extends (0, create_get_dto_factory_1.createGetDto)(WorkHourDto) {
}
exports.GetWorkHourDto = GetWorkHourDto;


/***/ }),
/* 139 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkHourService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const work_hour_entity_1 = __webpack_require__(140);
let WorkHourService = class WorkHourService extends base_service_1.BaseService {
    constructor(workHourRepository, usersService) {
        super(workHourRepository, usersService);
        this.workHourRepository = workHourRepository;
        this.usersService = usersService;
    }
};
exports.WorkHourService = WorkHourService;
exports.WorkHourService = WorkHourService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(work_hour_entity_1.WorkHour)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], WorkHourService);


/***/ }),
/* 140 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkHour = void 0;
const base_entity_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(17);
let WorkHour = class WorkHour extends base_entity_1.BaseEntity {
};
exports.WorkHour = WorkHour;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], WorkHour.prototype, "name", void 0);
exports.WorkHour = WorkHour = __decorate([
    (0, typeorm_1.Entity)('work-hours')
], WorkHour);


/***/ }),
/* 141 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkTimeModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const users_module_1 = __webpack_require__(12);
const work_time_controller_1 = __webpack_require__(142);
const work_time_service_1 = __webpack_require__(144);
const work_time_entity_1 = __webpack_require__(145);
let WorkTimeModule = class WorkTimeModule {
};
exports.WorkTimeModule = WorkTimeModule;
exports.WorkTimeModule = WorkTimeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([work_time_entity_1.WorkTime]),
            users_module_1.UsersModule,
        ],
        providers: [work_time_service_1.WorkTimeService],
        exports: [work_time_service_1.WorkTimeService],
        controllers: [work_time_controller_1.WorkTimeController],
    })
], WorkTimeModule);


/***/ }),
/* 142 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkTimeController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const work_time_dto_1 = __webpack_require__(143);
const work_time_service_1 = __webpack_require__(144);
class WorkTimeController extends (0, create_controller_factory_1.createController)('WorkTimes', // Entity name for Swagger documentation
work_time_service_1.WorkTimeService, // The service handling WorkTime-related operations
work_time_dto_1.GetWorkTimeDto, // DTO for retrieving WorkTimes
work_time_dto_1.WorkTimeDto, // DTO for creating WorkTimes
work_time_dto_1.UpdateWorkTimeDto) {
}
exports.WorkTimeController = WorkTimeController;


/***/ }),
/* 143 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetWorkTimeDto = exports.UpdateWorkTimeDto = exports.WorkTimeDto = void 0;
const base_dto_1 = __webpack_require__(92);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
const swagger_2 = __webpack_require__(4);
class WorkTimeDto extends (0, swagger_2.PartialType)(base_dto_1.BaseDto) {
}
exports.WorkTimeDto = WorkTimeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the work-time' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkTimeDto.prototype, "name", void 0);
class UpdateWorkTimeDto extends (0, swagger_2.PartialType)(WorkTimeDto) {
}
exports.UpdateWorkTimeDto = UpdateWorkTimeDto;
class GetWorkTimeDto extends (0, create_get_dto_factory_1.createGetDto)(WorkTimeDto) {
}
exports.GetWorkTimeDto = GetWorkTimeDto;


/***/ }),
/* 144 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkTimeService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const work_time_entity_1 = __webpack_require__(145);
let WorkTimeService = class WorkTimeService extends base_service_1.BaseService {
    constructor(workTimeRepository, usersService) {
        super(workTimeRepository, usersService);
        this.workTimeRepository = workTimeRepository;
        this.usersService = usersService;
    }
};
exports.WorkTimeService = WorkTimeService;
exports.WorkTimeService = WorkTimeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(work_time_entity_1.WorkTime)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], WorkTimeService);


/***/ }),
/* 145 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkTime = void 0;
const base_entity_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(17);
let WorkTime = class WorkTime extends base_entity_1.BaseEntity {
};
exports.WorkTime = WorkTime;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], WorkTime.prototype, "name", void 0);
exports.WorkTime = WorkTime = __decorate([
    (0, typeorm_1.Entity)('work-times')
], WorkTime);


/***/ }),
/* 146 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BiometricsModule = void 0;
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const event_emitter_1 = __webpack_require__(147);
const typeorm_1 = __webpack_require__(13);
const biometrics_controller_1 = __webpack_require__(148);
const biometric_device_entity_1 = __webpack_require__(156);
const biometric_template_entity_1 = __webpack_require__(157);
const timeout_interceptor_1 = __webpack_require__(152);
const biometrics_polling_service_1 = __webpack_require__(158);
const zkteco_biometrics_service_1 = __webpack_require__(159);
let BiometricsModule = class BiometricsModule {
};
exports.BiometricsModule = BiometricsModule;
exports.BiometricsModule = BiometricsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([biometric_device_entity_1.BiometricDevice, biometric_template_entity_1.BiometricTemplate]),
            event_emitter_1.EventEmitterModule.forRoot(),
            core_1.RouterModule.register([
                {
                    path: 'biometrics',
                    module: BiometricsModule,
                },
            ]),
        ],
        controllers: [biometrics_controller_1.BiometricsController],
        providers: [
            {
                provide: 'BIOMETRIC_SERVICE',
                useClass: zkteco_biometrics_service_1.ZKTecoBiometricsService,
            },
            // Add this provider for the interceptor
            {
                provide: timeout_interceptor_1.TimeoutInterceptor,
                useFactory: () => new timeout_interceptor_1.TimeoutInterceptor(30), // specify timeout in seconds
            },
            biometrics_polling_service_1.BiometricsPollingService,
        ],
        exports: ['BIOMETRIC_SERVICE'],
    })
], BiometricsModule);


/***/ }),
/* 147 */
/***/ ((module) => {

module.exports = require("@nestjs/event-emitter");

/***/ }),
/* 148 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BiometricsController = void 0;
const generalresponse_dto_1 = __webpack_require__(67);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const connect_device_dto_1 = __webpack_require__(149);
const set_time_dto_1 = __webpack_require__(150);
const set_user_dto_1 = __webpack_require__(151);
const timeout_interceptor_1 = __webpack_require__(152);
const biometric_interface_1 = __webpack_require__(155);
let BiometricsController = class BiometricsController {
    constructor(biometricService) {
        this.biometricService = biometricService;
    }
    // Helper method for consistent error handling
    handleError(error, defaultMessage, notImplementedMessage) {
        if (error instanceof common_1.HttpException) {
            throw error;
        }
        const errorMessage = this.getErrorMessage(error);
        if (notImplementedMessage && errorMessage.includes('not implemented')) {
            throw new common_1.HttpException(notImplementedMessage, common_1.HttpStatus.NOT_IMPLEMENTED);
        }
        throw new common_1.HttpException(`${defaultMessage}: ${errorMessage}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    // Helper to safely extract error messages
    getErrorMessage(error) {
        if (error instanceof Error) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
            return error.message;
        }
        return String(error);
    }
    // @ApiOperation({ summary: 'Get fingerprint template for a user' })
    // @ApiResponse({ 
    // status: HttpStatus.OK, 
    // description: 'Fingerprint template retrieved successfully',
    // schema: {
    //     type: 'object',
    //     properties: {
    //     id: { type: 'string', example: '1001-0' },
    //     userId: { type: 'string', example: '1001' },
    //     fingerId: { type: 'number', example: 0 },
    //     template: { type: 'string', format: 'binary', description: 'Binary template data' },
    //     provider: { type: 'string', example: 'zkteco' }
    //     }
    // }
    // })
    // @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Template or device not found',
    //     type: ErrorResponseDto
    // })
    // @ApiResponse({ 
    //     status: HttpStatus.BAD_REQUEST, 
    //     description: 'Invalid request',
    //     type: ErrorResponseDto
    // })
    // @Get('users/fingerprint')
    // async getUserFingerprint(
    //     @Query(new ValidationPipe({ transform: true })) getFingerprintDto: GetFingerprintDto
    // ): Promise<IBiometricTemplate | null> {
    //     try {
    //         const { deviceId, userId, fingerId = 0 } = getFingerprintDto;
    //         const template = await this.biometricService.getUserFingerprint(
    //             deviceId,
    //             userId,
    //             fingerId
    //         );
    //         if (!template) {
    //             throw new NotFoundException(`No fingerprint template found for user ${userId} (finger ${fingerId})`);
    //         }
    //         return template;
    //     } catch (error: unknown) {
    //         return this.handleError(
    //             error,
    //             'Failed to retrieve fingerprint template',
    //             'Fingerprint template not found or retrieval not supported by this device type'
    //         );
    //     }
    // }
    async registerUser(setUserDto) {
        try {
            return await this.biometricService.registerUser(setUserDto.deviceId, {
                userId: setUserDto.userId,
                name: setUserDto.name,
                password: setUserDto.password,
                cardNumber: setUserDto.cardNumber,
                role: setUserDto.role
            });
        }
        catch (error) {
            return this.handleError(error, 'Failed to register user', 'User registration not supported by this device type');
        }
    }
    // =============================================
    // Device Management Endpoints
    // =============================================
    async connectDevice(connectDeviceDto) {
        try {
            return await this.biometricService.connect(connectDeviceDto.ipAddress, connectDeviceDto.port);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Failed to connect to device: ${this.getErrorMessage(error)}`, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async disconnectDevice(deviceId) {
        try {
            const result = await this.biometricService.disconnect(deviceId);
            return {
                success: result,
                message: result ? 'Device disconnected successfully' : 'Device disconnection initiated'
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to disconnect device', 'Device disconnection not supported by this device type');
        }
    }
    async getConnectedDevices() {
        const devices = await this.biometricService.getConnectedDevices();
        return {
            devices,
            count: devices.length
        };
    }
    async getDeviceInfo(deviceId) {
        try {
            return await this.biometricService.getDeviceInfo(deviceId);
        }
        catch (error) {
            return this.handleError(error, 'Failed to get device information', 'Device information retrieval not supported by this device type');
        }
    }
    // @ApiOperation({ summary: 'Restart a biometric device' })
    // @ApiResponse({ status: HttpStatus.OK, description: 'Device restarted successfully' })
    // @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    // })
    // @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    // })
    // @ApiParam({ name: 'deviceId', description: 'Device ID to restart' })
    // @Post('devices/:deviceId/restart')
    // async restartDevice(
    //     @Param('deviceId') deviceId: string
    // ): Promise<{ success: boolean; message: string }> {
    //     try {
    //     const result = await this.biometricService.restartDevice?.(deviceId);
    //     return { 
    //         success: result,
    //         message: result ? 'Device restart initiated' : 'Device restart failed'
    //     };
    //     } catch (error: unknown) {
    //     return this.handleError(
    //         error,
    //         'Failed to restart device',
    //         'Device restart not supported by this device type'
    //     );
    //     }
    // }
    //   @ApiOperation({ summary: 'Unlock a device door' })
    //   @ApiResponse({ status: HttpStatus.OK, description: 'Door unlocked successfully' })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    //   @Post('devices/:deviceId/unlock')
    //   async unlockDoor(
    //     @Param('deviceId') deviceId: string
    //   ): Promise<{ success: boolean; message: string }> {
    //     try {
    //       const result = await this.biometricService.unlockDoor?.(deviceId);
    //       return { 
    //         success: result,
    //         message: result ? 'Door unlocked successfully' : 'Failed to unlock door'
    //       };
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to unlock door',
    //         'Door unlock not supported by this device type'
    //       );
    //     }
    //   }
    //   @ApiOperation({ summary: 'Execute a custom command on a device' })
    //   @ApiResponse({ status: HttpStatus.OK, description: 'Command executed successfully' })
    //   @ApiResponse({ 
    //     status: HttpStatus.BAD_REQUEST, 
    //     description: 'Invalid command',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    //   @Post('devices/:deviceId/command')
    //   async executeCommand(
    //     @Param('deviceId') deviceId: string,
    //     @Body(new ValidationPipe({ transform: true })) commandDto: CommandDto
    //   ): Promise<{ success: boolean; result: any }> {
    //     try {
    //       const result = await this.biometricService.executeCommand?.(
    //         deviceId, 
    //         commandDto.command,
    //         commandDto.data
    //       );
    //       return { 
    //         success: true,
    //         result
    //       };
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to execute command',
    //         'Command execution not supported by this device type'
    //       );
    //     }
    //   }
    //   @ApiOperation({ summary: 'Get device time' })
    //   @ApiResponse({ status: HttpStatus.OK, description: 'Current device time' })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @ApiParam({ name: 'deviceId', description: 'Target device ID' })
    //   @Get('devices/:deviceId/time')
    //   async getTime(
    //     @Param('deviceId') deviceId: string
    //   ): Promise<{ deviceId: string; time: Date }> {
    //     try {
    //       const time = await this.biometricService.getTime?.(deviceId);
    //       return { deviceId, time };
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to get device time',
    //         'Time retrieval not supported by this device type'
    //       );
    //     }
    //   }
    async setTime(deviceId, timeDto) {
        var _a, _b;
        try {
            const time = new Date(timeDto.time);
            const result = await ((_b = (_a = this.biometricService).setTime) === null || _b === void 0 ? void 0 : _b.call(_a, deviceId, time));
            return {
                success: result,
                message: result ? 'Device time set successfully' : 'Failed to set device time'
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to set device time', 'Time setting not supported by this device type');
        }
    }
    // =============================================
    // User & Template Management Endpoints
    // =============================================
    //   @ApiOperation({ summary: 'Enroll a user fingerprint' })
    //   @ApiResponse({ 
    //     status: HttpStatus.CREATED, 
    //     description: 'User fingerprint enrolled successfully',
    //     type: Object
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.BAD_REQUEST, 
    //     description: 'Invalid input data',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @Post('users/enroll')
    //   async enrollUser(
    //     @Body(new ValidationPipe({ transform: true })) enrollUserDto: EnrollUserDto
    //   ): Promise<IBiometricTemplate> {
    //     try {
    //       return await this.biometricService.enrollUser(
    //         enrollUserDto.deviceId,
    //         enrollUserDto.userId,
    //         enrollUserDto.fingerId
    //       );
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to enroll user',
    //         'User enrollment not supported by this device type'
    //       );
    //     }
    //   }
    //   @ApiOperation({ summary: 'Create or update a user on a device' })
    //   @ApiResponse({ 
    //     status: HttpStatus.CREATED, 
    //     description: 'User created/updated successfully',
    //     type: Object
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.BAD_REQUEST, 
    //     description: 'Invalid input data',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @Post('devices/:deviceId/users')
    //   async setUser(
    //     @Param('deviceId') deviceId: string,
    //     @Body(new ValidationPipe({ transform: true })) userDto: SetUserDto
    //   ): Promise<{ success: boolean; message: string }> {
    //     try {
    //       const result = await this.biometricService.setUser?.(
    //         deviceId,
    //         userDto.uid,
    //         userDto.userId,
    //         userDto.name,
    //         userDto.password,
    //         userDto.role,
    //         userDto.cardno
    //       );
    //       return { 
    //         success: result,
    //         message: result 
    //           ? `User ${userDto.userId} created/updated successfully` 
    //           : `Failed to create/update user ${userDto.userId}`
    //       };
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to create/update user',
    //         'User creation not supported by this device type'
    //       );
    //     }
    //   }
    async deleteUser(deviceId, userId) {
        try {
            const result = await this.biometricService.deleteUser(deviceId, userId);
            return {
                success: result,
                message: result ? `User ${userId} successfully deleted` : `Failed to delete user ${userId}`
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to delete user', 'User deletion not supported by this device type');
        }
    }
    //   @ApiOperation({ summary: 'Verify a fingerprint' })
    //   @ApiResponse({ status: HttpStatus.OK, description: 'Verification result' })
    //   @ApiResponse({ 
    //     status: HttpStatus.BAD_REQUEST, 
    //     description: 'Invalid input data',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @Post('verify')
    //   async verifyFingerprint(
    //     @Body(new ValidationPipe({ transform: true })) verifyDto: VerifyFingerprintDto
    //   ): Promise<{ verified: boolean; userId: string }> {
    //     try {
    //       const result = await this.biometricService.verifyFingerprint(
    //         verifyDto.deviceId,
    //         verifyDto.template
    //       );
    //       return { 
    //         verified: result,
    //         userId: verifyDto.template.userId
    //       };
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to verify fingerprint',
    //         'Fingerprint verification not supported by this device type'
    //       );
    //     }
    //   }
    //   @ApiOperation({ summary: 'Sync users between two devices' })
    //   @ApiResponse({ status: HttpStatus.OK, description: 'Users synced successfully' })
    //   @ApiResponse({ 
    //     status: HttpStatus.BAD_REQUEST, 
    //     description: 'Invalid input data',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_FOUND, 
    //     description: 'Device not found',
    //     type: ErrorResponseDto
    //   })
    //   @ApiResponse({ 
    //     status: HttpStatus.NOT_IMPLEMENTED, 
    //     description: 'Feature not implemented on this device',
    //     type: ErrorResponseDto
    //   })
    //   @Post('devices/sync')
    //   async syncUsers(
    //     @Body(new ValidationPipe({ transform: true })) syncUsersDto: SyncUsersDto
    //   ): Promise<{ syncedCount: number; success: boolean; message: string }> {
    //     try {
    //       const count = await this.biometricService.syncUsers?.(
    //         syncUsersDto.sourceDeviceId,
    //         syncUsersDto.targetDeviceId
    //       );
    //       return { 
    //         syncedCount: count,
    //         success: count > 0,
    //         message: count > 0 
    //           ? `Successfully synced ${count} users` 
    //           : 'No users were synced'
    //       };
    //     } catch (error: unknown) {
    //       return this.handleError(
    //         error,
    //         'Failed to sync users',
    //         'User synchronization not supported by this device type'
    //       );
    //     }
    //   }
    // =============================================
    // Data Operation Endpoints
    // =============================================
    async getUsers(deviceId) {
        try {
            return await this.biometricService.getUsers(deviceId);
        }
        catch (error) {
            return this.handleError(error, 'Failed to get users', 'User listing not supported by this device type');
        }
    }
    async getAttendanceRecords(deviceId, startDate, endDate) {
        try {
            const records = await this.biometricService.getAttendanceRecords(deviceId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
            return {
                records,
                count: records.length,
                deviceId
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to get attendance records', 'Attendance record retrieval not supported by this device type');
        }
    }
    async getAttendanceSize(deviceId) {
        var _a, _b;
        try {
            const size = await ((_b = (_a = this.biometricService).getAttendanceSize) === null || _b === void 0 ? void 0 : _b.call(_a, deviceId));
            return { size, deviceId };
        }
        catch (error) {
            return this.handleError(error, 'Failed to get attendance size', 'Attendance size retrieval not supported by this device type');
        }
    }
    async clearAttendanceRecords(deviceId) {
        try {
            const result = await this.biometricService.clearAttendanceRecords(deviceId);
            return {
                success: result,
                message: result
                    ? 'Attendance records cleared successfully'
                    : 'Failed to clear attendance records'
            };
        }
        catch (error) {
            return this.handleError(error, 'Failed to clear attendance records', 'Attendance record clearing not supported by this device type');
        }
    }
};
exports.BiometricsController = BiometricsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user on a biometric device' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'User registered successfully',
        type: Object
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Device not found',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, common_1.Post)('users/register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof set_user_dto_1.SetUserDto !== "undefined" && set_user_dto_1.SetUserDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], BiometricsController.prototype, "registerUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Connect to a biometric device' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Device connected successfully',
        type: Object
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.SERVICE_UNAVAILABLE,
        description: 'Device connection failed',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, common_1.Post)('devices/connect'),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof connect_device_dto_1.ConnectDeviceDto !== "undefined" && connect_device_dto_1.ConnectDeviceDto) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], BiometricsController.prototype, "connectDevice", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect from a biometric device' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Device disconnected successfully' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Device not found',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', description: 'Device ID to disconnect from' }),
    (0, common_1.Post)('devices/:deviceId/disconnect'),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], BiometricsController.prototype, "disconnectDevice", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all connected biometric devices' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of connected devices',
        type: [Object]
    }),
    (0, common_1.Get)('devices'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], BiometricsController.prototype, "getConnectedDevices", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get device information' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Device information' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Device not found',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', description: 'Target device ID' }),
    (0, common_1.Get)('devices/:deviceId/info'),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], BiometricsController.prototype, "getDeviceInfo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Set device time' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Device time set successfully' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid time format',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Device not found',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_IMPLEMENTED,
        description: 'Feature not implemented on this device',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', description: 'Target device ID' }),
    (0, common_1.Put)('devices/:deviceId/time'),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_j = typeof set_time_dto_1.SetTimeDto !== "undefined" && set_time_dto_1.SetTimeDto) === "function" ? _j : Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], BiometricsController.prototype, "setTime", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete a user from a device' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'User deleted successfully' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Device or user not found',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid user ID format',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Error deleting user',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', description: 'Target device ID' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID to delete' }),
    (0, common_1.Delete)('devices/:deviceId/users/:userId'),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], BiometricsController.prototype, "deleteUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get users registered on a device' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of user IDs',
        type: [String]
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Device not found',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_IMPLEMENTED,
        description: 'Feature not implemented on this device',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', description: 'Target device ID' }),
    (0, common_1.Get)('devices/:deviceId/users'),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], BiometricsController.prototype, "getUsers", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get attendance records from a device' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of attendance records',
        type: [Object]
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Device not found',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_IMPLEMENTED,
        description: 'Feature not implemented on this device',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', description: 'Target device ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Filter by start date (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'Filter by end date (ISO format)' }),
    (0, common_1.Get)('devices/:deviceId/attendance'),
    __param(0, (0, common_1.Param)('deviceId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], BiometricsController.prototype, "getAttendanceRecords", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get attendance records size' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Attendance record count',
        type: Number
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Device not found',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_IMPLEMENTED,
        description: 'Feature not implemented on this device',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', description: 'Target device ID' }),
    (0, common_1.Get)('devices/:deviceId/attendance/size'),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], BiometricsController.prototype, "getAttendanceSize", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Clear attendance records from a device' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Attendance records cleared successfully' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Device not found',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_IMPLEMENTED,
        description: 'Feature not implemented on this device',
        type: generalresponse_dto_1.GeneralResponseDto
    }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', description: 'Target device ID' }),
    (0, common_1.Delete)('devices/:deviceId/attendance'),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], BiometricsController.prototype, "clearAttendanceRecords", null);
exports.BiometricsController = BiometricsController = __decorate([
    (0, swagger_1.ApiTags)('Biometrics'),
    (0, common_1.Controller)(),
    (0, common_1.UseInterceptors)(new timeout_interceptor_1.TimeoutInterceptor(30)),
    __param(0, (0, common_1.Inject)('BIOMETRIC_SERVICE')),
    __metadata("design:paramtypes", [typeof (_a = typeof biometric_interface_1.IBiometricService !== "undefined" && biometric_interface_1.IBiometricService) === "function" ? _a : Object])
], BiometricsController);


/***/ }),
/* 149 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConnectDeviceDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
class ConnectDeviceDto {
}
exports.ConnectDeviceDto = ConnectDeviceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'IP address of the biometric device',
        example: '192.168.1.100'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIP)(4, { message: 'IP address must be a valid IPv4 address' }),
    __metadata("design:type", String)
], ConnectDeviceDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Port number of the biometric device',
        example: 4370,
        minimum: 1,
        maximum: 65535
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(65535),
    __metadata("design:type", Number)
], ConnectDeviceDto.prototype, "port", void 0);


/***/ }),
/* 150 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SetTimeDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
class SetTimeDto {
}
exports.SetTimeDto = SetTimeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time to set on the device (ISO format)',
        example: '2025-04-08T12:00:00.000Z'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SetTimeDto.prototype, "time", void 0);


/***/ }),
/* 151 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SetUserDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
class SetUserDto {
}
exports.SetUserDto = SetUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target device ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetUserDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID', example: '1001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SetUserDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User name', example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 24, { message: 'Name must be between 1 and 24 characters' }),
    __metadata("design:type", String)
], SetUserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User password (max 8 characters)', example: '1234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 8, { message: 'Password must be less than 8 characters' }),
    __metadata("design:type", String)
], SetUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Card number', example: '7654321' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SetUserDto.prototype, "cardNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User role (0 = normal user, 14 = admin)',
        example: 0,
        minimum: 0,
        maximum: 14
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(14),
    __metadata("design:type", Number)
], SetUserDto.prototype, "role", void 0);


/***/ }),
/* 152 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimeoutInterceptor = void 0;
const common_1 = __webpack_require__(1);
const rxjs_1 = __webpack_require__(153);
const operators_1 = __webpack_require__(154);
let TimeoutInterceptor = class TimeoutInterceptor {
    constructor(timeoutSeconds = 30) {
        this.timeoutSeconds = timeoutSeconds;
    }
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.timeout)(this.timeoutSeconds * 1000), (0, operators_1.catchError)(err => {
            if (err instanceof rxjs_1.TimeoutError) {
                return (0, rxjs_1.throwError)(() => new common_1.RequestTimeoutException('Request timed out'));
            }
            return (0, rxjs_1.throwError)(() => err);
        }));
    }
};
exports.TimeoutInterceptor = TimeoutInterceptor;
exports.TimeoutInterceptor = TimeoutInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Number])
], TimeoutInterceptor);


/***/ }),
/* 153 */
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),
/* 154 */
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),
/* 155 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 156 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BiometricDevice = void 0;
const base_entity_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(17);
let BiometricDevice = class BiometricDevice extends base_entity_1.BaseEntity {
};
exports.BiometricDevice = BiometricDevice;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BiometricDevice.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BiometricDevice.prototype, "port", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BiometricDevice.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BiometricDevice.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BiometricDevice.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BiometricDevice.prototype, "firmware", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BiometricDevice.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BiometricDevice.prototype, "deviceVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BiometricDevice.prototype, "os", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], BiometricDevice.prototype, "isConnected", void 0);
exports.BiometricDevice = BiometricDevice = __decorate([
    (0, typeorm_1.Entity)('biometric_devices')
], BiometricDevice);


/***/ }),
/* 157 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BiometricTemplate = void 0;
const base_entity_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(17);
let BiometricTemplate = class BiometricTemplate extends base_entity_1.BaseEntity {
};
exports.BiometricTemplate = BiometricTemplate;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BiometricTemplate.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BiometricTemplate.prototype, "fingerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longblob' }),
    __metadata("design:type", typeof (_a = typeof Buffer !== "undefined" && Buffer) === "function" ? _a : Object)
], BiometricTemplate.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BiometricTemplate.prototype, "provider", void 0);
exports.BiometricTemplate = BiometricTemplate = __decorate([
    (0, typeorm_1.Entity)('biometric_templates')
], BiometricTemplate);


/***/ }),
/* 158 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BiometricsPollingService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BiometricsPollingService = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const event_emitter_1 = __webpack_require__(147);
let BiometricsPollingService = BiometricsPollingService_1 = class BiometricsPollingService {
    constructor(configService, eventEmitter) {
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(BiometricsPollingService_1.name);
        this.devicePollers = new Map();
        this.connections = new Map();
    }
    // Lifecycle hooks
    onModuleInit() {
        this.logger.log('Biometric polling service initialized');
    }
    onModuleDestroy() {
        this.stopAllPolling();
    }
    // Provide a way to register device connections
    registerDeviceConnection(deviceId, zkDevice) {
        this.connections.set(deviceId, zkDevice);
        this.logger.log(`Registered device ${deviceId} for polling`);
    }
    // Start polling for a specific device
    startPolling(deviceId) {
        const zkDevice = this.connections.get(deviceId);
        if (!zkDevice) {
            this.logger.warn(`Cannot start polling for device ${deviceId}: Device not registered`);
            return false;
        }
        // Check if already polling
        if (this.devicePollers.has(deviceId)) {
            this.logger.warn(`Already polling device ${deviceId}`);
            return true;
        }
        const pollingInterval = this.configService.get('BIOMETRIC_DEVICE_POLLING_INTERVAL', 1000);
        let lastAttendanceCount = 0;
        let lastCheckedTime = new Date();
        // Start the interval for polling
        const intervalId = setInterval(async () => {
            if (!this.connections.has(deviceId)) {
                this.stopPolling(deviceId);
                return;
            }
            try {
                // Get current attendance size
                const currentCount = await zkDevice.getAttendanceSize();
                // If there are new records
                if (currentCount > lastAttendanceCount) {
                    // Get all attendance records - returns { data: records, err: error }
                    const response = await zkDevice.getAttendances();
                    // Extract the records array from the response
                    const records = response.data || [];
                    // Filter to only get records since last check
                    const newRecords = records.filter((record) => new Date(record.record_time) > lastCheckedTime);
                    if (newRecords.length > 0) {
                        this.logger.log(`[${deviceId}] Processing ${newRecords.length} new attendance records`);
                        // Process each new record
                        newRecords.forEach((record) => {
                            var _a;
                            // Standardize record format
                            const standardizedRecord = {
                                userId: record.user_id || '',
                                timestamp: new Date(record.record_time || Date.now()),
                                type: (_a = record.type) !== null && _a !== void 0 ? _a : 0,
                                deviceId: deviceId,
                                status: record.state
                            };
                            this.logger.log(`User ID: ${standardizedRecord.userId}, Type: ${standardizedRecord.type}, Timestamp: ${standardizedRecord.timestamp}`);
                            // Emit the event
                            this.eventEmitter.emit('attendance.recorded', standardizedRecord);
                        });
                    }
                    // Update counters
                    lastAttendanceCount = currentCount;
                }
                // Update timestamp
                lastCheckedTime = new Date();
            }
            catch (error) {
                this.logger.error(`Polling error for ${deviceId}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }, pollingInterval);
        // Store interval info to clean up later
        this.devicePollers.set(deviceId, {
            intervalId: intervalId,
            lastCheckedTime,
            lastCount: lastAttendanceCount
        });
        this.logger.log(`Started polling for device ${deviceId} at ${pollingInterval}ms intervals`);
        return true;
    }
    // Stop polling for a specific device
    stopPolling(deviceId) {
        const poller = this.devicePollers.get(deviceId);
        if (!poller) {
            return false;
        }
        clearInterval(poller.intervalId);
        this.devicePollers.delete(deviceId);
        this.logger.log(`Stopped polling for device ${deviceId}`);
        return true;
    }
    // Stop all polling
    stopAllPolling() {
        this.logger.log(`Stopping all device polling (${this.devicePollers.size} active)`);
        for (const [deviceId, poller] of this.devicePollers.entries()) {
            clearInterval(poller.intervalId);
            this.logger.log(`Stopped polling for device ${deviceId}`);
        }
        this.devicePollers.clear();
    }
};
exports.BiometricsPollingService = BiometricsPollingService;
exports.BiometricsPollingService = BiometricsPollingService = BiometricsPollingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object])
], BiometricsPollingService);


/***/ }),
/* 159 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ZKTecoBiometricsService_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ZKTecoBiometricsService = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(13);
const ZKLib = __webpack_require__(160);
const event_emitter_1 = __webpack_require__(147);
const typeorm_2 = __webpack_require__(17);
const biometric_device_entity_1 = __webpack_require__(156);
const biometric_template_entity_1 = __webpack_require__(157);
const base_biometrics_service_1 = __webpack_require__(161);
const biometrics_polling_service_1 = __webpack_require__(158);
/**
 * ZKTeco implementation of the biometric service
 * Handles communication with ZKTeco biometric devices
 */
let ZKTecoBiometricsService = ZKTecoBiometricsService_1 = class ZKTecoBiometricsService extends base_biometrics_service_1.BaseBiometricsService {
    constructor(configService, deviceRepository, biometricsPollingService, templateRepository, eventEmitter) {
        super(deviceRepository, templateRepository, eventEmitter);
        this.configService = configService;
        this.deviceRepository = deviceRepository;
        this.biometricsPollingService = biometricsPollingService;
        this.templateRepository = templateRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(ZKTecoBiometricsService_1.name);
        // Listen for attendance events from polling service
        this.eventEmitter.on('attendance.recorded', (record) => {
            this.emitAttendanceEvent(record);
            // Call any registered callback
            const monitorInfo = this.activeMonitoring.get(record.deviceId);
            if (monitorInfo && typeof monitorInfo.callback === 'function') {
                monitorInfo.callback(record);
            }
        });
    }
    /**
     * Register a new user on the ZKTeco device without fingerprint enrollment
     * @param deviceId Device identifier
     * @param userData User data to register
     * @returns Created user information
     */
    async registerUser(deviceId, userData) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            this.logger.log(`Registering user ${userData.userId} on device ${deviceId}`);
            // Convert userId to numeric ID if possible, or use a default
            const uid = parseInt(userData.userId) || Math.floor(Math.random() * 9000) + 1000;
            // Prepare parameters with defaults
            const name = userData.name || `User ${userData.userId}`;
            const password = userData.password || '';
            const role = userData.role || 0; // 0 = normal user, 14 = admin
            const cardno = userData.cardNumber ? parseInt(userData.cardNumber) : 0;
            // Validate input parameters
            if (uid <= 0 || uid > 65535) {
                throw new Error('User ID must be a positive integer less than 65535');
            }
            if (name.length > 24) {
                throw new Error('Name must be less than 24 characters');
            }
            if (password.length > 8) {
                throw new Error('Password must be less than 8 characters');
            }
            // Create/update the user on the device
            await zkDevice.setUser(uid, userData.userId, name, password, role, cardno);
            // Create a standardized user object to return
            const createdUser = {
                userId: userData.userId,
                name: name,
                password: password,
                cardNumber: cardno.toString(),
                role: role
            };
            this.logger.log(`Successfully registered user ${userData.userId} on device ${deviceId}`);
            return createdUser;
        }
        catch (error) {
            // log error object as json
            this.logger.error(`Error registering user on device ${deviceId}: ${JSON.stringify(error)}`);
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error registering user on device ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to register user: ${errorMessage}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    /**
     * Get fingerprint template for a specific user and finger
     * @param deviceId Device identifier
     * @param userId User ID
     * @param fingerId Finger ID (0-9)
     * @returns Fingerprint template data
     */
    async getUserFingerprint(deviceId, userId, fingerId = 0) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            this.logger.log(`Retrieving fingerprint template for user ${userId} (finger ${fingerId}) from device ${deviceId}`);
            // First check database for existing template
            try {
                const existingTemplate = await this.templateRepository.findOne({
                    where: {
                        userId,
                        fingerId,
                        provider: 'zkteco'
                    }
                });
                if (existingTemplate && existingTemplate.template) {
                    this.logger.log(`Found existing template in database for user ${userId} (finger ${fingerId})`);
                    return {
                        id: `${userId}-${fingerId}`,
                        userId,
                        fingerId,
                        template: existingTemplate.template,
                        provider: 'zkteco'
                    };
                }
            }
            catch (dbError) {
                this.logger.warn(`Database lookup failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
            }
            // Convert userId to numeric ID if it's a number
            const uid = parseInt(userId) || Number(userId);
            if (isNaN(uid)) {
                throw new Error(`Invalid user ID format: ${userId}`);
            }
            // Create data buffer for the command
            const cmdData = Buffer.alloc(8);
            cmdData.writeUInt32LE(uid, 0); // User ID in little-endian format
            cmdData.writeUInt32LE(fingerId, 4); // Finger ID in little-endian format
            // Check if executeCmd is available
            if (typeof zkDevice.executeCmd !== 'function') {
                throw new Error('Device does not support the required commands');
            }
            // Clear any pending data
            try {
                await zkDevice.freeData();
            }
            catch (err) {
                this.logger.warn(`Could not free data buffer: ${err instanceof Error ? err.message : String(err)}`);
            }
            // Proper device state management
            await zkDevice.disableDevice();
            await zkDevice.enableDevice();
            // Add a small delay to ensure device is ready
            await new Promise(resolve => setTimeout(resolve, 200));
            // Execute the command to get the fingerprint template
            // CMD_USERTEMP_RRQ = 9 (0x0009)
            const result = await zkDevice.executeCmd('CMD_USERTEMP_RRQ', cmdData);
            // Log raw result for debugging
            this.logger.debug(`Raw result from device: length=${(result === null || result === void 0 ? void 0 : result.length) || 0}, first bytes: ${result ? result.slice(0, 20).toString('hex') : 'null'}`);
            // Check if we got a valid response
            if (!result || result.length < 12) {
                this.logger.warn(`No fingerprint template found for user ${userId} (finger ${fingerId})`);
                return null;
            }
            // Parse the result according to ZKTeco protocol
            const templateData = result.subarray(12);
            if (templateData.length === 0) {
                this.logger.warn(`Empty template data for user ${userId} (finger ${fingerId})`);
                return null;
            }
            this.logger.debug(`Retrieved fingerprint template for user ${userId} (finger ${fingerId}): ${templateData.length} bytes`);
            // Create a standardized template object
            const template = {
                id: `${userId}-${fingerId}`,
                userId,
                fingerId,
                template: templateData,
                provider: 'zkteco'
            };
            // Optionally save the template to database
            try {
                await this.templateRepository.save({
                    userId,
                    fingerId,
                    template: templateData,
                    provider: 'zkteco'
                });
                this.logger.debug(`Saved fingerprint template for user ${userId} (finger ${fingerId}) to database`);
            }
            catch (dbError) {
                this.logger.warn(`Could not save template to database: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
                // Continue even if database save fails
            }
            return template;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error retrieving fingerprint template from device ${deviceId}: ${errorMessage}`);
            // Check if it's a "template not exist" error, which should return null instead of throwing
            if (errorMessage.includes('not exist') || errorMessage.includes('No Record')) {
                this.logger.warn(`No fingerprint template exists for user ${userId} (finger ${fingerId})`);
                return null;
            }
            throw new base_biometrics_service_1.BiometricException(`Failed to get fingerprint template: ${errorMessage}`);
        }
    }
    /**
     * Connect to a device with retry logic
     * @param deviceId Device identifier
     * @param ipAddress Device IP address
     * @param port Device port
     * @returns Connected device information
     */
    async connectWithRetry(deviceId, ipAddress, port) {
        const timeout = this.configService.get('ZKTECO_TIMEOUT', 5000);
        const retryAttempts = this.configService.get('ZKTECO_RETRY_ATTEMPTS', 3);
        const retryDelay = this.configService.get('ZKTECO_RETRY_DELAY', 1000);
        let attempts = 0;
        let lastError = new Error('No connection attempts made');
        while (attempts < retryAttempts) {
            try {
                attempts++;
                this.logger.log(`Connecting to device ${deviceId} (attempt ${attempts}/${retryAttempts})`);
                // Create ZK instance with parameters, not options object
                // According to the example: new ZKLib(host, port, timeout, retry)
                const zk = new ZKLib(ipAddress, port, timeout, retryDelay);
                // Create socket connection first (as per example)
                await zk.createSocket();
                // Collect comprehensive device information
                let deviceInfo = await zk.getInfo();
                // Try to get additional device information
                try {
                    const serialNumber = await zk.getSerialNumber();
                    const firmware = await zk.getFirmware();
                    const platform = await zk.getPlatform();
                    const deviceName = await zk.getDeviceName();
                    const deviceVersion = await zk.getDeviceVersion();
                    const os = await zk.getOS();
                    // Enhance device info with additional details
                    deviceInfo = Object.assign(Object.assign({}, deviceInfo), { serialNumber: serialNumber || (deviceInfo === null || deviceInfo === void 0 ? void 0 : deviceInfo.serialNumber), firmware: firmware || (deviceInfo === null || deviceInfo === void 0 ? void 0 : deviceInfo.firmware), platform: platform || (deviceInfo === null || deviceInfo === void 0 ? void 0 : deviceInfo.platform), deviceName: deviceName, deviceVersion: deviceVersion, os: os });
                }
                catch (infoError) {
                    this.logger.warn(`Could not retrieve comprehensive device info: ${infoError instanceof Error ? infoError.message : String(infoError)}`);
                }
                // Store connection
                this.connections.set(deviceId, zk);
                // Create device object with enhanced info
                const device = {
                    id: deviceId,
                    ipAddress,
                    port,
                    model: (deviceInfo === null || deviceInfo === void 0 ? void 0 : deviceInfo.deviceName) || (deviceInfo === null || deviceInfo === void 0 ? void 0 : deviceInfo.model) || 'Unknown',
                    serialNumber: (deviceInfo === null || deviceInfo === void 0 ? void 0 : deviceInfo.serialNumber) || 'Unknown',
                    firmware: deviceInfo === null || deviceInfo === void 0 ? void 0 : deviceInfo.firmware,
                    platform: deviceInfo === null || deviceInfo === void 0 ? void 0 : deviceInfo.platform,
                    deviceVersion: deviceInfo === null || deviceInfo === void 0 ? void 0 : deviceInfo.deviceVersion,
                    os: deviceInfo === null || deviceInfo === void 0 ? void 0 : deviceInfo.os,
                    isConnected: true,
                };
                // Store device in memory
                this.devices.set(deviceId, device);
                // Store in database
                await this.deviceRepository.save({
                    id: deviceId,
                    ipAddress,
                    port,
                    model: device.model,
                    serialNumber: device.serialNumber,
                    provider: 'zkteco',
                    firmware: device.firmware,
                    platform: device.platform,
                    deviceVersion: device.deviceVersion,
                    os: device.os,
                    isConnected: true,
                });
                // Register the connection with the polling service
                this.biometricsPollingService.registerDeviceConnection(deviceId, zk);
                // Start polling instead of direct setup
                this.biometricsPollingService.startPolling(deviceId);
                this.logger.log(`Successfully connected to ZKTeco device at ${ipAddress}:${port}`);
                return device;
            }
            catch (error) {
                // Ensure error is properly typed
                this.logger.warn(`Connection attempt ${attempts} to device ${deviceId}`);
                // If we have retries left, wait before trying again
                if (attempts < retryAttempts) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
        }
        // If we get here, all connection attempts failed
        this.logger.error(`Failed to connect to ZKTeco device after ${attempts} attempts: ${lastError.message}`);
        throw new base_biometrics_service_1.BiometricException(`Failed to connect to device: ${lastError.message}`, common_1.HttpStatus.SERVICE_UNAVAILABLE);
    }
    /**
     * Set up default real-time monitoring for a device
     * @param deviceId Device identifier
     * @param zkDevice ZK device instance
     */
    async setupDefaultRealTimeMonitoring(deviceId, zkDevice) {
        this.logger.log(`Setting up default real-time monitoring for device ${deviceId}`);
        // Before attempting to get real-time logs, ensure connection is active
        if (!zkDevice._socket || !zkDevice._socket.writable) {
            await zkDevice.createSocket();
            this.logger.debug(`Refreshed socket connection for device ${deviceId}`);
        }
        // Enable device first to ensure it's ready to receive commands
        await zkDevice.enableDevice();
        // Register for real-time logs
        zkDevice.getRealTimeLogs((record) => {
            var _a;
            if (!record)
                return;
            this.logger.debug(`Received real-time log: ${JSON.stringify(record)}`);
            // Convert to standard format
            const standardizedRecord = {
                userId: record.userId || '',
                timestamp: new Date(record.timestamp || Date.now()),
                type: (_a = record.type) !== null && _a !== void 0 ? _a : 0,
                deviceId: deviceId,
                verificationMode: record.verificationMode,
                status: record.status,
                workcode: record.workcode,
                isSynced: false,
                retrievedAt: new Date(),
                data: record.data
            };
            // Emit event for this record
            this.emitAttendanceEvent(standardizedRecord);
            // Call any custom callback if registered
            const monitorInfo = this.activeMonitoring.get(deviceId);
            if (monitorInfo && typeof monitorInfo.callback === 'function') {
                monitorInfo.callback(standardizedRecord);
            }
        });
        // Store in active monitoring with empty callback
        this.activeMonitoring.set(deviceId, { deviceId, callback: undefined });
        this.logger.log(`Default real-time monitoring established for device ${deviceId}`);
    }
    /**
     * Setup monitoring for device connection status
     * @param deviceId Device identifier
     * @param zkDevice ZK device instance
     */
    setupDeviceMonitoring(deviceId, zkDevice) {
        const pingInterval = this.configService.get('DEVICE_PING_INTERVAL', 3000);
        const interval = setInterval(async () => {
            if (!this.connections.has(deviceId)) {
                clearInterval(interval);
                return;
            }
            try {
                // Try to get device info as a ping
                await zkDevice.getInfo();
                // If monitoring was set up but is no longer active, try to restart it
                if (this.activeMonitoring.has(deviceId) && !this.isMonitoringActive(deviceId)) {
                    this.logger.warn(`Real-time monitoring appears to have stopped for device ${deviceId}. Attempting to restart...`);
                    try {
                        await this.setupDefaultRealTimeMonitoring(deviceId, zkDevice);
                        this.logger.log(`Successfully restarted real-time monitoring for device ${deviceId}`);
                    }
                    catch (monitoringError) {
                        this.logger.error(`Failed to restart monitoring: ${monitoringError instanceof Error ? monitoringError.message : String(monitoringError)}`);
                    }
                }
            }
            catch (error) {
                // Your existing error handling code
            }
        }, pingInterval);
    }
    /**
     * Disconnect from a ZKTeco device
     * @param deviceId Device identifier
     * @returns True if disconnected successfully
     */
    async disconnect(deviceId) {
        // Stop the polling first
        this.biometricsPollingService.stopPolling(deviceId);
        const zkDevice = this.connections.get(deviceId);
        if (!zkDevice) {
            this.logger.warn(`Attempted to disconnect from device ${deviceId} but no connection found`);
            return false;
        }
        try {
            // Clear monitoring first
            this.activeMonitoring.delete(deviceId);
            // Use disconnect method
            await zkDevice.disconnect();
            this.connections.delete(deviceId);
            const device = this.devices.get(deviceId);
            if (device) {
                device.isConnected = false;
                this.devices.set(deviceId, device);
            }
            await this.deviceRepository.update({ id: deviceId }, { isConnected: false });
            this.logger.log(`Successfully disconnected from ZKTeco device ${deviceId}`);
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error disconnecting from device ${deviceId}: ${errorMessage}`);
            return false;
        }
    }
    /**
     * Get connected device by ID, throwing an exception if not found
     * @param deviceId Device identifier
     * @returns ZK device instance
     */
    getConnectedDevice(deviceId) {
        const zkDevice = this.connections.get(deviceId);
        if (!zkDevice) {
            throw new base_biometrics_service_1.BiometricException(`Device ${deviceId} not connected or not found`, common_1.HttpStatus.NOT_FOUND);
        }
        return zkDevice;
    }
    /**
     * Get device information
     * @param deviceId Device identifier
     * @returns Device information
     */
    async getDeviceInfo(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            const info = await zkDevice.getInfo();
            this.logger.debug(`Retrieved device info for ${deviceId}: ${JSON.stringify(info)}`);
            return info;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting device info from ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get device info: ${errorMessage}`);
        }
    }
    /**
     * Get device serial number
     * @param deviceId Device identifier
     * @returns Device serial number
     */
    async getSerialNumber(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            const serialNumber = await zkDevice.getSerialNumber();
            this.logger.debug(`Retrieved serial number for ${deviceId}: ${serialNumber}`);
            return serialNumber;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting serial number from ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get serial number: ${errorMessage}`);
        }
    }
    /**
     * Get firmware version
     * @param deviceId Device identifier
     * @returns Firmware version
     */
    async getFirmwareVersion(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            const firmware = await zkDevice.getFaceOn();
            this.logger.debug(`Retrieved firmware version for ${deviceId}: ${firmware}`);
            return firmware;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting firmware version from ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get firmware version: ${errorMessage}`);
        }
    }
    /**
     * Get device platform
     * @param deviceId Device identifier
     * @returns Platform information
     */
    async getPlatform(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            const platform = await zkDevice.getPlatform();
            this.logger.debug(`Retrieved platform info for ${deviceId}: ${platform}`);
            return platform;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting platform info from ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get platform info: ${errorMessage}`);
        }
    }
    /**
     * Get device name
     * @param deviceId Device identifier
     * @returns Device name
     */
    async getDeviceName(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            const name = await zkDevice.getDeviceName();
            this.logger.debug(`Retrieved device name for ${deviceId}: ${name}`);
            return name;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting device name from ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get device name: ${errorMessage}`);
        }
    }
    /**
     * Get device OS version
     * @param deviceId Device identifier
     * @returns OS version
     */
    async getOS(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            const os = await zkDevice.getOS();
            this.logger.debug(`Retrieved OS info for ${deviceId}: ${os}`);
            return os;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting OS info from ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get OS info: ${errorMessage}`);
        }
    }
    /**
     * Get device version
     * @param deviceId Device identifier
     * @returns Device version
     */
    async getDeviceVersion(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            const version = await zkDevice.getDeviceVersion();
            this.logger.debug(`Retrieved device version for ${deviceId}: ${version}`);
            return version;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting device version from ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get device version: ${errorMessage}`);
        }
    }
    /**
     * Get device PIN
     * @param deviceId Device identifier
     * @returns Device PIN
     */
    async getPIN(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            const pin = await zkDevice.getPIN();
            this.logger.debug(`Retrieved PIN for ${deviceId}: ${pin}`);
            return pin;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting PIN from ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get PIN: ${errorMessage}`);
        }
    }
    /**
     * Check if face recognition is enabled
     * @param deviceId Device identifier
     * @returns True if face recognition is enabled
     */
    async getFaceOn(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            const faceOn = await zkDevice.getFaceOn();
            this.logger.debug(`Retrieved face recognition status for ${deviceId}: ${faceOn}`);
            return faceOn;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting face recognition status from ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get face recognition status: ${errorMessage}`);
        }
    }
    /**
     * Get Self-Service-Recorder status
     * @param deviceId Device identifier
     * @returns SSR status
     */
    async getSSR(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            const ssr = await zkDevice.getSSR();
            this.logger.debug(`Retrieved SSR status for ${deviceId}: ${JSON.stringify(ssr)}`);
            return ssr;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting SSR status from ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get SSR status: ${errorMessage}`);
        }
    }
    /**
     * Get device time
     * @param deviceId Device identifier
     * @returns Current device time
     */
    async getTime(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            const time = await zkDevice.getTime();
            this.logger.debug(`Retrieved time for ${deviceId}: ${time}`);
            return time;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting time from ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get time: ${errorMessage}`);
        }
    }
    /**
     * Set device time
     * @param deviceId Device identifier
     * @param time Date to set
     * @returns Success indicator
     */
    async setTime(deviceId, time) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            await zkDevice.setTime(time);
            this.logger.debug(`Set time for ${deviceId} to ${time}`);
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error setting time for ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to set time: ${errorMessage}`);
        }
    }
    /**
     * Get work code from device
     * @param deviceId Device identifier
     * @returns Work code
     */
    async getWorkCode(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            const workCode = await zkDevice.getWorkCode();
            this.logger.debug(`Retrieved work code for ${deviceId}: ${workCode}`);
            return workCode;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting work code from ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get work code: ${errorMessage}`);
        }
    }
    /**
     * Get attendance log size
     * @param deviceId Device identifier
     * @returns Attendance log size
     */
    async getAttendanceSize(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            const size = await zkDevice.getAttendanceSize();
            this.logger.debug(`Retrieved attendance size for ${deviceId}: ${size}`);
            return size;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting attendance size from ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get attendance size: ${errorMessage}`);
        }
    }
    /**
     * Get users from a device
     * @param deviceId Device identifier
     * @returns Array of user IDs
     */
    async getUsers(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            this.logger.log(`Getting users from device ${deviceId}`);
            const response = await zkDevice.getUsers();
            // Extract the data array from the response object
            const users = response && response.data && Array.isArray(response.data)
                ? response.data
                : [];
            if (users.length === 0) {
                return [];
            }
            // Extract essential information for each user
            const userInfo = users.map((user) => {
                var _a;
                return ({
                    userId: user.userId || user.id || '',
                    name: user.name || '',
                    password: user.password || '',
                    role: user.role || 0,
                    uid: user.uid || parseInt(user.userId) || 0,
                    cardNumber: ((_a = user.cardno) === null || _a === void 0 ? void 0 : _a.toString()) || ''
                });
            }).filter((user) => user.userId && user.role <= 14);
            this.logger.log(`Found ${userInfo.length} users on device ${deviceId}`);
            return userInfo;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting users from device ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get users: ${errorMessage}`);
        }
    }
    /**
     * Delete a user from the device with specific ZKTeco protocol implementation
     * @param deviceId Device identifier
     * @param userId User ID to delete
     * @returns True if deleted successfully
     */
    async deleteUser(deviceId, userId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            this.logger.log(`Deleting user ${userId} from device ${deviceId}`);
            // Convert userId to numeric ID
            const uid = parseInt(userId);
            // Validate input parameter
            if (isNaN(uid) || uid <= 0 || uid > 65535) {
                throw new Error('Invalid user ID: must be a positive number less than 65535');
            }
            // Clear any pending data
            try {
                await zkDevice.freeData();
            }
            catch (err) {
                this.logger.warn(`Could not free data buffer: ${err instanceof Error ? err.message : String(err)}`);
            }
            if (typeof zkDevice.deleteUser === 'function') {
                const response = await zkDevice.deleteUser(uid);
                // Check the response for success
                const success = response && response.length > 0;
                // After successful deletion from device, also remove templates from database
                if (success) {
                    try {
                        const deleteResult = await this.templateRepository.delete({
                            userId: userId,
                            provider: 'zkteco'
                        });
                        this.logger.debug(`Deleted ${deleteResult.affected || 0} templates from database for user ${userId}`);
                    }
                    catch (dbError) {
                        this.logger.warn(`Failed to delete templates from database: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
                        // Continue even if database deletion fails
                    }
                }
                this.logger.log(`User ${userId} deletion ${success ? 'successful' : 'failed'}`);
                return success;
            }
            else {
                throw new Error('Device does not support direct user deletion through this library');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error deleting user ${userId} from device ${deviceId}: ${errorMessage}`);
            // If the user doesn't exist, consider it a success
            if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
                this.logger.warn(`User ${userId} not found on device ${deviceId}, considering deletion successful`);
                return true;
            }
            throw new base_biometrics_service_1.BiometricException(`Failed to delete user: ${errorMessage}`);
        }
    }
    /**
     * Enroll a user's fingerprint
     * @param deviceId Device identifier
     * @param userId User ID
     * @param fingerId Finger ID (0-9)
     * @returns Biometric template
     */
    async enrollUser(deviceId, userId, fingerId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            this.logger.log(`Enrolling fingerprint for user ${userId} (finger ${fingerId}) on device ${deviceId}`);
            // First create or ensure the user exists
            // Convert userId to numeric if possible, or use a default
            const uid = parseInt(userId) || 1;
            const name = `User ${userId}`; // Default name if not provided
            // Create/update the user first
            await this.setUser(deviceId, uid, userId, name);
            // Start enrollment mode using executeCmd
            // According to ZKTeco protocol, CMD_STARTENROLL (61 or 0x3d) initiates enrollment
            const enrollData = Buffer.alloc(24);
            enrollData.writeUInt32LE(uid, 0); // User ID
            enrollData.writeUInt32LE(fingerId, 4); // Finger index (0-9)
            enrollData.writeUInt32LE(1, 8); // Flag (1 = valid)
            this.logger.log(`Starting enrollment process for user ${userId} (finger ${fingerId})`);
            // Use executeCmd to start enrollment if available
            let templateData;
            if (typeof zkDevice.executeCmd === 'function') {
                const result = await zkDevice.executeCmd('CMD_STARTENROLL', enrollData);
                // This is where we would typically wait for the enrollment result
                // But since the library doesn't have a direct method for this,
                // we'll need to implement a custom approach
                // For now, we'll create a placeholder template
                // In a real implementation, you would need to:
                // 1. Prompt the user to place their finger on the device
                // 2. Wait for the device to capture the fingerprint
                // 3. Retrieve the template data from the device
                // Mock template data (should be replaced with actual implementation)
                templateData = Buffer.from(`template-${userId}-${fingerId}-${Date.now()}`);
                this.logger.warn(`Note: This is a placeholder implementation. The ZKTeco-js library doesn't directly support fingerprint enrollment. Please check the device manual for specific enrollment procedures.`);
            }
            else {
                throw new Error('Device does not support direct fingerprint enrollment through this library. Consider using the device\'s physical interface for enrollment.');
            }
            // Create a template object
            const template = {
                id: `${userId}-${fingerId}`,
                userId,
                fingerId,
                template: Buffer.isBuffer(templateData) ? templateData : Buffer.from(templateData),
                provider: 'zkteco'
            };
            // Save template to database
            await this.templateRepository.save({
                userId,
                fingerId,
                template: Buffer.isBuffer(template.template)
                    ? template.template
                    : Buffer.from(template.template.toString()),
                provider: 'zkteco'
            });
            this.logger.log(`Successfully enrolled fingerprint for user ${userId} (finger ${fingerId})`);
            return template;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error enrolling user on device ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to enroll user: ${errorMessage}`);
        }
    }
    /**
     * Verify a fingerprint template
     * @param deviceId Device identifier
     * @param template Template to verify
     * @returns True if verified
     */
    async verifyFingerprint(deviceId, template) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            this.logger.log(`Verifying fingerprint for user ${template.userId} on device ${deviceId}`);
            // The method name depends on the library implementation
            let result;
            if (typeof zkDevice.verifyFingerprint === 'function') {
                result = await zkDevice.verifyFingerprint(template.userId, template.fingerId, template.template);
            }
            else if (typeof zkDevice.verify === 'function') {
                result = await zkDevice.verify(template.userId, template.fingerId, template.template);
            }
            else {
                throw new Error('Device does not support fingerprint verification');
            }
            this.logger.log(`Verification result for user ${template.userId}: ${result}`);
            return result === true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error verifying fingerprint on device ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to verify fingerprint: ${errorMessage}`);
        }
    }
    /**
     * Get attendance records from a device
     * @param deviceId Device identifier
     * @param startDate Optional start date for filtering
     * @param endDate Optional end date for filtering
     * @returns Array of attendance records
     */
    async getAttendanceRecords(deviceId, startDate, endDate) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            this.logger.log(`Getting attendance records from device ${deviceId}`);
            // Use the getAttendances method
            const records = await zkDevice.getAttendances();
            if (!records || !Array.isArray(records)) {
                return [];
            }
            // Convert records to a standard format
            const standardizedRecords = records.map(record => {
                var _a;
                return ({
                    userId: record.userId || '',
                    timestamp: new Date(record.timestamp),
                    type: (_a = record.type) !== null && _a !== void 0 ? _a : 0, // Required field with fallback
                    deviceId: deviceId, // Required field - use the current device ID
                    verificationMode: record.verificationMode,
                    status: record.status,
                    workcode: record.workcode,
                    isSynced: false, // Default value for new records
                    retrievedAt: new Date(), // Set current time as retrieval time
                    data: record.data
                });
            });
            // Filter by date if provided
            let filteredRecords = standardizedRecords;
            if (startDate || endDate) {
                filteredRecords = standardizedRecords.filter(record => {
                    if (startDate && record.timestamp < startDate)
                        return false;
                    if (endDate && record.timestamp > endDate)
                        return false;
                    return true;
                });
            }
            this.logger.log(`Found ${filteredRecords.length} attendance records on device ${deviceId}`);
            return filteredRecords;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error getting attendance records from device ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to get attendance records: ${errorMessage}`);
        }
    }
    /**
     * Set up real-time attendance log monitoring
     * @param deviceId Device identifier
     * @param callback Function to call when attendance logs are received
     * @returns Monitoring ID that can be used to stop monitoring
     */
    startRealTimeMonitoring(deviceId, callback) {
        const zkDevice = this.getConnectedDevice(deviceId);
        const monitoringId = `monitoring-${deviceId}-${Date.now()}`;
        try {
            this.logger.log(`Registering custom callback for real-time monitoring on device ${deviceId}`);
            // Update or create monitoring info
            this.activeMonitoring.set(deviceId, {
                deviceId,
                callback: callback // Store the callback
            });
            // If monitoring isn't already active, set it up
            if (!this.isMonitoringActive(deviceId)) {
                this.setupDefaultRealTimeMonitoring(deviceId, zkDevice)
                    .catch(err => {
                    const errMsg = err instanceof Error ? err.message : String(err);
                    this.logger.error(`Failed to set up monitoring for device ${deviceId}: ${errMsg}`);
                });
            }
            this.logger.log(`Real-time monitoring callback registered for device ${deviceId} with ID ${monitoringId}`);
            return monitoringId;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error registering monitoring callback for device ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to start real-time monitoring: ${errorMessage}`);
        }
    }
    /**
     * Check if monitoring is active for a device
     */
    isMonitoringActive(deviceId) {
        return this.activeMonitoring.has(deviceId);
    }
    /**
     * Stop real-time monitoring
     * @param monitoringId Monitoring ID returned from startRealTimeMonitoring
     * @returns True if stopped successfully
     */
    stopRealTimeMonitoring(monitoringId) {
        // This would need to be implemented based on how the library handles stopping monitoring
        // This is a placeholder implementation
        this.logger.log(`Stopping real-time monitoring for ID ${monitoringId}`);
        // In a real implementation, you would:
        // 1. Look up the deviceId and monitoring info using the monitoringId
        // 2. Call the appropriate method to stop monitoring on the device
        // 3. Clean up any resources
        return true;
    }
    /**
     * Clear all attendance records from a device
     * @param deviceId Device identifier
     * @returns True if cleared successfully
     */
    async clearAttendanceRecords(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            this.logger.log(`Clearing attendance records from device ${deviceId}`);
            // Use the clearAttendanceLog method
            await zkDevice.clearAttendanceLog();
            this.logger.log(`Successfully cleared attendance records from device ${deviceId}`);
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error clearing attendance records from device ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to clear attendance records: ${errorMessage}`);
        }
    }
    /**
     * Restart a device
     * @param deviceId Device identifier
     * @returns True if restart initiated successfully
     */
    async restartDevice(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            this.logger.log(`Restarting device ${deviceId}`);
            // The method name depends on the library implementation
            if (typeof zkDevice.restart === 'function') {
                await zkDevice.restart();
            }
            else if (typeof zkDevice.restartDevice === 'function') {
                await zkDevice.restartDevice();
            }
            else {
                throw new Error('Device does not support restart');
            }
            this.logger.log(`Successfully initiated restart for device ${deviceId}`);
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error restarting device ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to restart device: ${errorMessage}`);
        }
    }
    /**
     * Unlock the device door
     * @param deviceId Device identifier
     * @returns True if unlock command sent successfully
     */
    async unlockDoor(deviceId) {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            this.logger.log(`Unlocking door for device ${deviceId}`);
            // The method name depends on the library implementation
            if (typeof zkDevice.executeCmd === 'function') {
                // Execute the unlock command
                // Note: CMD.CMD_UNLOCK would need to be defined or imported
                await zkDevice.executeCmd('CMD_UNLOCK', '');
            }
            else if (typeof zkDevice.unlockDoor === 'function') {
                await zkDevice.unlockDoor();
            }
            else {
                throw new Error('Device does not support door unlock');
            }
            this.logger.log(`Successfully unlocked door for device ${deviceId}`);
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error unlocking door for device ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to unlock door: ${errorMessage}`);
        }
    }
    /**
     * Execute a custom command on the device
     * @param deviceId Device identifier
     * @param command Command to execute
     * @param data Optional data for the command
     * @returns Command result
     */
    async executeCommand(deviceId, command, data = '') {
        const zkDevice = this.getConnectedDevice(deviceId);
        try {
            this.logger.log(`Executing command ${command} on device ${deviceId}`);
            if (typeof zkDevice.executeCmd !== 'function') {
                throw new Error('Device does not support custom commands');
            }
            const result = await zkDevice.executeCmd(command, data);
            this.logger.log(`Successfully executed command ${command} on device ${deviceId}`);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error executing command on device ${deviceId}: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to execute command: ${errorMessage}`);
        }
    }
    /**
     * Sync users between two devices
     * @param sourceDeviceId Source device ID
     * @param targetDeviceId Target device ID
     * @returns Number of users synced
     */
    async syncUsers(sourceDeviceId, targetDeviceId) {
        try {
            this.logger.log(`Syncing users from device ${sourceDeviceId} to ${targetDeviceId}`);
            // Get users from source device
            const users = await this.getUserDetails(sourceDeviceId);
            if (!users || users.length === 0) {
                this.logger.warn(`No users found on source device ${sourceDeviceId}`);
                return 0;
            }
            // Get target device
            const targetDevice = this.getConnectedDevice(targetDeviceId);
            // Transfer each user to target device
            let syncedCount = 0;
            for (const user of users) {
                try {
                    await this.setUser(targetDeviceId, parseInt(user.userId) || 0, // Use numeric ID if possible
                    user.userId, user.name, user.password, user.role, parseInt(user.cardNumber || '0') || 0);
                    syncedCount++;
                }
                catch (userError) {
                    const errorMessage = userError instanceof Error ? userError.message : String(userError);
                    this.logger.warn(`Failed to sync user ${user.userId}: ${errorMessage}`);
                }
            }
            this.logger.log(`Successfully synced ${syncedCount} users from ${sourceDeviceId} to ${targetDeviceId}`);
            return syncedCount;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error syncing users: ${errorMessage}`);
            throw new base_biometrics_service_1.BiometricException(`Failed to sync users: ${errorMessage}`);
        }
    }
};
exports.ZKTecoBiometricsService = ZKTecoBiometricsService;
exports.ZKTecoBiometricsService = ZKTecoBiometricsService = ZKTecoBiometricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(biometric_device_entity_1.BiometricDevice)),
    __param(3, (0, typeorm_1.InjectRepository)(biometric_template_entity_1.BiometricTemplate)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof biometrics_polling_service_1.BiometricsPollingService !== "undefined" && biometrics_polling_service_1.BiometricsPollingService) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _e : Object])
], ZKTecoBiometricsService);


/***/ }),
/* 160 */
/***/ ((module) => {

module.exports = require("zkteco-js");

/***/ }),
/* 161 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseBiometricsService = exports.BiometricException = void 0;
const common_1 = __webpack_require__(1);
/**
 * Base exception class for biometric-related errors
 */
class BiometricException extends common_1.HttpException {
    constructor(message, statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
        super(message, statusCode);
    }
}
exports.BiometricException = BiometricException;
/**
 * Abstract base class for all biometric service implementations
 * Provides common functionality and defines the interface that all biometric services must implement
 */
class BaseBiometricsService {
    constructor(deviceRepository, templateRepository, eventEmitter) {
        this.deviceRepository = deviceRepository;
        this.templateRepository = templateRepository;
        this.eventEmitter = eventEmitter;
        // Make logger protected so it can be inherited by derived classes
        this.logger = new common_1.Logger(this.constructor.name);
        this.connections = new Map();
        this.activeMonitoring = new Map();
        this.devices = new Map();
        this.initializeFromDatabase();
    }
    /**
     * Load previously connected devices from database on service startup
     */
    async initializeFromDatabase() {
        try {
            const savedDevices = await this.deviceRepository.find();
            if (savedDevices.length > 0) {
                this.logger.log(`Found ${savedDevices.length} previously connected devices. Attempting to reconnect...`);
                // Try to reconnect to devices in parallel
                await Promise.allSettled(savedDevices.map(device => this.connect(device.ipAddress, device.port)
                    .catch(err => {
                    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                    this.logger.warn(`Failed to reconnect to device ${device.id}: ${errorMessage}`);
                })));
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error initializing devices from database: ${errorMessage}`);
        }
    }
    /**
     * Clean up resources when module is destroyed
     */
    async onModuleDestroy() {
        this.logger.log('Module destroying, disconnecting from all devices...');
        // Close all connections when service is destroyed
        const disconnectPromises = Array.from(this.connections.entries()).map(([deviceId]) => this.disconnect(deviceId));
        await Promise.allSettled(disconnectPromises);
        this.logger.log('All device connections closed');
    }
    emitAttendanceEvent(record) {
        try {
            this.eventEmitter.emit('biometric.attendance', record);
        }
        catch (error) {
            this.logger.error(`Error emitting attendance event: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Connect to a Biometric device
     * @param ipAddress Device IP address
     * @param port Device port
     * @returns Connected device information
     */
    async connect(ipAddress, port) {
        var _a;
        if (!ipAddress || !port) {
            throw new BiometricException('IP address and port are required', common_1.HttpStatus.BAD_REQUEST);
        }
        const deviceId = this.generateDeviceId(ipAddress, port);
        // Check if already connected
        if (this.connections.has(deviceId)) {
            this.logger.warn(`Device ${deviceId} is already connected`);
            return (_a = this.devices.get(deviceId)) !== null && _a !== void 0 ? _a : null;
        }
        // Create new connection with retry logic
        return this.connectWithRetry(deviceId, ipAddress, port);
    }
    // Device information methods (optional with default implementation)
    async getDeviceInfo(deviceId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    async getSerialNumber(deviceId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    async getFirmwareVersion(deviceId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    async getDeviceName(deviceId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    async restartDevice(deviceId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    // Time management methods (optional)
    async getTime(deviceId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    async setTime(deviceId, time) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    // User management methods (optional)
    async enrollUser(deviceId, userId, fingerId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    async deleteUser(deviceId, userId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    async verifyFingerprint(deviceId, template) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    async getUsers(deviceId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    async getUserDetails(deviceId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    async setUser(deviceId, uid, userId, name, password, role, cardno) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    async syncUsers(sourceDeviceId, targetDeviceId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    // Attendance management methods (optional)
    async getAttendanceRecords(deviceId, startDate, endDate) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    async clearAttendanceRecords(deviceId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    async getAttendanceSize(deviceId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    // Real-time monitoring methods (optional)
    startRealTimeMonitoring(deviceId, callback) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    stopRealTimeMonitoring(monitoringId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    // Door control (optional)
    async unlockDoor(deviceId) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    // Command execution (optional)
    async executeCommand(deviceId, command, data) {
        throw new BiometricException('Method not implemented', common_1.HttpStatus.NOT_IMPLEMENTED);
    }
    /**
     * Get all connected devices
     * @returns Array of connected biometric devices
     */
    getConnectedDevices() {
        return Promise.resolve(Array.from(this.devices.values()));
    }
    /**
     * Get a device by ID, throwing an exception if not found
     * @param deviceId Device identifier
     * @returns Device information
     */
    getDevice(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new BiometricException(`Device with ID ${deviceId} not found or not connected`, common_1.HttpStatus.NOT_FOUND);
        }
        return device;
    }
    /**
     * Generate a unique device ID from IP address and port
     * @param ipAddress Device IP address
     * @param port Device port
     * @returns Unique device identifier
     */
    generateDeviceId(ipAddress, port) {
        return `${ipAddress}:${port}`;
    }
    /**
     * Safely handle errors by ensuring proper type conversion
     * @param error The error to process
     * @returns Standardized error message string
     */
    formatErrorMessage(error) {
        return error instanceof Error ? error.message : String(error);
    }
}
exports.BaseBiometricsService = BaseBiometricsService;


/***/ }),
/* 162 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentsModule = void 0;
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(13);
const users_module_1 = __webpack_require__(12);
const document_types_module_1 = __webpack_require__(163);
const documents_controller_1 = __webpack_require__(167);
const documents_service_1 = __webpack_require__(168);
const document_entity_1 = __webpack_require__(15);
let DocumentsModule = class DocumentsModule {
};
exports.DocumentsModule = DocumentsModule;
exports.DocumentsModule = DocumentsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([document_entity_1.Document]), users_module_1.UsersModule, document_types_module_1.DocumentTypesModule,
            core_1.RouterModule.register([
                {
                    path: 'documents',
                    module: DocumentsModule,
                    children: [
                        {
                            path: 'types',
                            module: document_types_module_1.DocumentTypesModule,
                        }
                    ]
                },
            ]),
        ],
        providers: [documents_service_1.DocumentsService],
        exports: [documents_service_1.DocumentsService, document_types_module_1.DocumentTypesModule],
        controllers: [documents_controller_1.DocumentsController],
    })
], DocumentsModule);


/***/ }),
/* 163 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentTypesModule = void 0;
const users_module_1 = __webpack_require__(12);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const document_types_controller_1 = __webpack_require__(164);
const document_types_service_1 = __webpack_require__(165);
const document_type_entity_1 = __webpack_require__(44);
let DocumentTypesModule = class DocumentTypesModule {
};
exports.DocumentTypesModule = DocumentTypesModule;
exports.DocumentTypesModule = DocumentTypesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([document_type_entity_1.DocumentType]), users_module_1.UsersModule],
        providers: [document_types_service_1.DocumentTypesService],
        exports: [document_types_service_1.DocumentTypesService],
        controllers: [document_types_controller_1.DocumentTypesController],
    })
], DocumentTypesModule);


/***/ }),
/* 164 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentTypesController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const document_types_service_1 = __webpack_require__(165);
const document_type_dto_1 = __webpack_require__(166);
class DocumentTypesController extends (0, create_controller_factory_1.createController)('Document Types', // Entity name for Swagger documentation
document_types_service_1.DocumentTypesService, // The service handling DocumentType-related operations
document_type_dto_1.GetDocumentTypeDto, // DTO for retrieving DocumentTypes
document_type_dto_1.DocumentTypeDto, // DTO for creating DocumentTypes
document_type_dto_1.UpdateDocumentTypeDto) {
}
exports.DocumentTypesController = DocumentTypesController;


/***/ }),
/* 165 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentTypesService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const document_type_entity_1 = __webpack_require__(44);
let DocumentTypesService = class DocumentTypesService extends base_service_1.BaseService {
    constructor(documentTypesRepository, usersService) {
        super(documentTypesRepository, usersService);
        this.documentTypesRepository = documentTypesRepository;
        this.usersService = usersService;
    }
};
exports.DocumentTypesService = DocumentTypesService;
exports.DocumentTypesService = DocumentTypesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_type_entity_1.DocumentType)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], DocumentTypesService);


/***/ }),
/* 166 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetDocumentTypeDto = exports.UpdateDocumentTypeDto = exports.DocumentTypeDto = void 0;
const base_dto_1 = __webpack_require__(92);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
class DocumentTypeDto extends base_dto_1.BaseDto {
    constructor() {
        super(...arguments);
        this.active = false;
        this.requiredForApplicants = true;
        this.requiredForEmployees = true;
    }
}
exports.DocumentTypeDto = DocumentTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the document type', example: 'Contract' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentTypeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description of the document type', required: false, example: 'Legal contract documents' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentTypeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Indicates if the document type is active', example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DocumentTypeDto.prototype, "active", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Indicates if the document type is required for applicants', example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DocumentTypeDto.prototype, "requiredForApplicants", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Indicates if the document type is required for employees', example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DocumentTypeDto.prototype, "requiredForEmployees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier for the parent document type', required: false, example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DocumentTypeDto.prototype, "parentId", void 0);
class UpdateDocumentTypeDto extends (0, swagger_1.PartialType)(DocumentTypeDto) {
}
exports.UpdateDocumentTypeDto = UpdateDocumentTypeDto;
class GetDocumentTypeDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateDocumentTypeDto, 'document type') {
}
exports.GetDocumentTypeDto = GetDocumentTypeDto;


/***/ }),
/* 167 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentsController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const documents_service_1 = __webpack_require__(168);
const document_dto_1 = __webpack_require__(169);
class DocumentsController extends (0, create_controller_factory_1.createController)('Documents', // Entity name for Swagger documentation
documents_service_1.DocumentsService, // The service handling Document-related operations
document_dto_1.GetDocumentDto, // DTO for retrieving Documents
document_dto_1.DocumentDto, // DTO for creating Documents
document_dto_1.UpdateDocumentDto // DTO for updating Documents
) {
}
exports.DocumentsController = DocumentsController;


/***/ }),
/* 168 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentsService = void 0;
const base_service_1 = __webpack_require__(64);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const users_service_1 = __webpack_require__(63);
const document_entity_1 = __webpack_require__(15);
let DocumentsService = class DocumentsService extends base_service_1.BaseService {
    constructor(documentsRepository, usersService) {
        super(documentsRepository, usersService);
        this.documentsRepository = documentsRepository;
        this.usersService = usersService;
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], DocumentsService);


/***/ }),
/* 169 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetDocumentDto = exports.UpdateDocumentDto = exports.DocumentDto = void 0;
const base_dto_1 = __webpack_require__(92);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
class DocumentDto extends base_dto_1.BaseDto {
}
exports.DocumentDto = DocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the document', example: 'Contract.pdf' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description of the document', required: false, example: 'Legal contract document' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File key for storage reference', example: 'documents/contract.pdf' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentDto.prototype, "fileKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Size of the document in bytes', example: 102400 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DocumentDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MIME type of the document', example: 'application/pdf' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID associated with the document', required: false, example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DocumentDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document type ID', example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DocumentDto.prototype, "documentTypeId", void 0);
class UpdateDocumentDto extends (0, swagger_1.PartialType)(DocumentDto) {
}
exports.UpdateDocumentDto = UpdateDocumentDto;
class GetDocumentDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateDocumentDto, 'document') {
}
exports.GetDocumentDto = GetDocumentDto;


/***/ }),
/* 170 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FilesModule = void 0;
const common_1 = __webpack_require__(1);
const users_module_1 = __webpack_require__(12);
const file_provider_config_1 = __webpack_require__(171);
const files_controller_1 = __webpack_require__(180);
let FilesModule = class FilesModule {
};
exports.FilesModule = FilesModule;
exports.FilesModule = FilesModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule],
        providers: [...file_provider_config_1.fileProviders],
        controllers: [files_controller_1.FilesController],
    })
], FilesModule);


/***/ }),
/* 171 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fileProviders = exports.fileProviderConfig = exports.FILE_SERVICE = void 0;
const config_1 = __webpack_require__(2);
const local_file_service_1 = __webpack_require__(172);
exports.FILE_SERVICE = 'FILE_SERVICE';
exports.fileProviderConfig = {
    provide: exports.FILE_SERVICE,
    useFactory: (configService) => {
        // Read provider from options or config
        const fileProvider = configService.get('FILE_PROVIDER') ||
            'local';
        // Select the appropriate implementation based on provider
        switch (fileProvider.toLowerCase()) {
            case 'cloudflare':
                // return new CloudflareFileService(configService);
                throw new Error('Cloudflare provider not implemented yet');
            case 's3':
                // return new S3FileService(configService);
                throw new Error('S3 provider not implemented yet');
            case 'local':
            default:
                return new local_file_service_1.LocalFileService(configService);
        }
    },
    inject: [config_1.ConfigService],
};
exports.fileProviders = [exports.fileProviderConfig, local_file_service_1.LocalFileService];


/***/ }),
/* 172 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalFileService = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const fs = __importStar(__webpack_require__(104));
const fs_1 = __webpack_require__(104);
const mime = __importStar(__webpack_require__(173));
const path_1 = __importDefault(__webpack_require__(106));
const file_list_options_dto_1 = __webpack_require__(174);
const base_file_service_1 = __webpack_require__(175);
let LocalFileService = class LocalFileService extends base_file_service_1.BaseFileService {
    constructor(configService) {
        const uploadDir = configService.getOrThrow('FILE_DIRECTORY');
        const baseUrl = configService.getOrThrow('FILE_BASE_URL');
        super(uploadDir, baseUrl);
        this.configService = configService;
        this.chunkUploads = new Map();
        this.uploadDir = uploadDir; // Keep for backward compatibility
        this.baseUrl = baseUrl; // Keep for backward compatibility
        this.tempDir = path_1.default.join(this.uploadDir, 'temp');
        // Ensure upload directories exist
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
        // Ensure temp directory exists
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
        // Create a dir for tracking upload metadata
        this.metadataDir = path_1.default.join(this.uploadDir, 'metadata');
        if (!fs.existsSync(this.metadataDir)) {
            fs.mkdirSync(this.metadataDir, { recursive: true });
        }
    }
    // Replace chunkUploads in-memory map with file-based storage
    async initiateChunkedUpload(fileInfo) {
        try {
            const uploadId = crypto.randomUUID();
            // Store metadata in a file instead of memory
            const metadataPath = path_1.default.join(this.metadataDir, `${uploadId}.json`);
            await fs_1.promises.writeFile(metadataPath, JSON.stringify({
                info: fileInfo,
                chunks: [],
                chunkPaths: Array(fileInfo.totalChunks).fill(''),
                createdAt: new Date().toISOString()
            }));
            this.logger.log(`Initiated chunked upload ${uploadId} for ${fileInfo.filename}`);
            return uploadId;
        }
        catch (error) {
            throw error;
        }
    }
    // Update getChunkUploadData helper
    async getChunkUploadData(uploadId) {
        const metadataPath = path_1.default.join(this.metadataDir, `${uploadId}.json`);
        if (!fs.existsSync(metadataPath)) {
            throw new Error(`Upload with ID ${uploadId} not found`);
        }
        const data = JSON.parse(await fs_1.promises.readFile(metadataPath, 'utf8'));
        // Convert chunks array back to Set for backwards compatibility
        data.chunks = new Set(data.chunks);
        return data;
    }
    // Update saveChunkUploadData helper
    async saveChunkUploadData(uploadId, data) {
        const metadataPath = path_1.default.join(this.metadataDir, `${uploadId}.json`);
        // Convert Set back to array for storage
        const toSave = Object.assign(Object.assign({}, data), { chunks: Array.from(data.chunks) });
        await fs_1.promises.writeFile(metadataPath, JSON.stringify(toSave));
    }
    async uploadChunk(uploadId, chunkNumber, chunk) {
        try {
            // Get upload tracking data
            const uploadData = this.chunkUploads.get(uploadId);
            if (!uploadData) {
                throw new Error(`Upload with ID ${uploadId} not found`);
            }
            // Validate chunk number
            if (chunkNumber < 0 || chunkNumber >= uploadData.info.totalChunks) {
                throw new Error(`Invalid chunk number ${chunkNumber}. Must be between 0 and ${uploadData.info.totalChunks - 1}`);
            }
            // Create a temporary file for this chunk
            const chunkFileName = `${uploadId}_chunk_${chunkNumber}`;
            const chunkPath = path_1.default.join(this.tempDir, chunkFileName);
            // Write the chunk to disk
            await fs_1.promises.writeFile(chunkPath, chunk);
            // Update tracking data
            uploadData.chunks.add(chunkNumber);
            uploadData.chunkPaths[chunkNumber] = chunkPath;
            // Prepare result
            const result = {
                uploadId,
                chunkNumber,
                receivedSize: chunk.length,
                totalChunksReceived: uploadData.chunks.size,
                completed: uploadData.chunks.size === uploadData.info.totalChunks
            };
            this.logger.log(`Received chunk ${chunkNumber} for upload ${uploadId} (${uploadData.chunks.size}/${uploadData.info.totalChunks})`);
            return result;
        }
        catch (error) {
            const err = error;
            this.logger.error(`Error uploading chunk: ${err.message}`, err.stack);
            throw error;
        }
    }
    async completeChunkedUpload(uploadId) {
        try {
            // Get upload tracking data
            const uploadData = this.chunkUploads.get(uploadId);
            if (!uploadData) {
                throw new Error(`Upload with ID ${uploadId} not found`);
            }
            // Verify all chunks have been received
            if (uploadData.chunks.size !== uploadData.info.totalChunks) {
                throw new Error(`Cannot complete upload: received ${uploadData.chunks.size} of ${uploadData.info.totalChunks} chunks`);
            }
            // Create target directory if needed
            const folder = uploadData.info.folder || '';
            const targetDir = path_1.default.join(this.uploadDir, folder);
            if (folder && !fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            // Generate final filename and path
            const fileName = this.generateUniqueFileName(uploadData.info.filename);
            const finalPath = path_1.default.join(targetDir, fileName);
            const fileKey = folder ? `${folder}/${fileName}` : fileName;
            // Combine chunks into the final file
            const writeStream = fs.createWriteStream(finalPath);
            // Process chunks in order
            for (let i = 0; i < uploadData.info.totalChunks; i++) {
                const chunkPath = uploadData.chunkPaths[i];
                if (!chunkPath) {
                    throw new Error(`Missing chunk ${i} for upload ${uploadId}`);
                }
                // Read chunk and append to final file
                const chunkData = await fs_1.promises.readFile(chunkPath);
                writeStream.write(chunkData);
                // Delete temporary chunk file
                await fs_1.promises.unlink(chunkPath).catch(err => this.logger.warn(`Failed to delete chunk file: ${err.message}`));
            }
            // Close the write stream
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
                writeStream.end();
            });
            // Get file stats
            const stats = await fs_1.promises.stat(finalPath);
            // Create metadata
            const metadata = {
                key: fileKey,
                originalName: uploadData.info.filename,
                size: stats.size,
                mimeType: uploadData.info.mimeType,
                url: `${this.baseUrl}/${fileKey}`,
                createdAt: stats.birthtime,
                lastModified: stats.mtime,
                metadata: uploadData.info.metadata
            };
            // Clean up upload tracking data
            this.chunkUploads.delete(uploadId);
            this.logger.log(`Completed chunked upload ${uploadId}, created file ${fileKey}`);
            return metadata;
        }
        catch (error) {
            const err = error;
            this.logger.error(`Error completing chunked upload: ${err.message}`, err.stack);
            // Try to clean up any temporary files if possible
            try {
                const uploadData = this.chunkUploads.get(uploadId);
                if (uploadData) {
                    for (const chunkPath of uploadData.chunkPaths) {
                        if (chunkPath && fs.existsSync(chunkPath)) {
                            await fs_1.promises.unlink(chunkPath).catch(() => { });
                        }
                    }
                }
            }
            catch (_a) { }
            throw error;
        }
    }
    async uploadFile(file, options) {
        const folder = (options === null || options === void 0 ? void 0 : options.folder) || '';
        const finalDir = path_1.default.join(this.uploadDir, folder);
        // Create folder if it doesn't exist
        if (folder && !fs.existsSync(finalDir)) {
            fs.mkdirSync(finalDir, { recursive: true });
        }
        const fileName = this.generateUniqueFileName(file.originalname);
        const filePath = path_1.default.join(finalDir, fileName);
        const fileKey = folder ? `${folder}/${fileName}` : fileName;
        // Write file
        await fs_1.promises.writeFile(filePath, file.buffer);
        // Get file stats
        const stats = await fs_1.promises.stat(filePath);
        const url = await this.getFileUrl(fileKey, options === null || options === void 0 ? void 0 : options.token);
        const metadata = {
            key: fileKey,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            url,
            createdAt: stats.birthtime,
            lastModified: stats.mtime,
            encoding: file.encoding,
            metadata: options === null || options === void 0 ? void 0 : options.metadata,
        };
        return metadata;
    }
    async uploadFiles(files, options) {
        const results = [];
        for (const file of files) {
            const result = await this.uploadFile(file, options);
            results.push(result);
        }
        return results;
    }
    async getFileMetadata(fileKey, authorization) {
        const filePath = path_1.default.join(this.uploadDir, fileKey);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File ${fileKey} not found`);
        }
        const stats = await fs_1.promises.stat(filePath);
        const mimeType = mime.lookup(filePath) || 'application/octet-stream';
        const originalName = path_1.default.basename(fileKey);
        const url = await this.getFileUrl(fileKey, authorization);
        return {
            key: fileKey,
            originalName,
            size: stats.size,
            mimeType,
            url,
            createdAt: stats.birthtime,
            lastModified: stats.mtime,
        };
    }
    async deleteFile(fileKey) {
        const filePath = path_1.default.join(this.uploadDir, fileKey);
        if (!fs.existsSync(filePath)) {
            return false;
        }
        await fs_1.promises.unlink(filePath);
        return true;
    }
    async fileExists(fileKey) {
        try {
            const filePath = path_1.default.join(this.uploadDir, fileKey);
            return fs.existsSync(filePath);
        }
        catch (error) {
            return false;
        }
    }
    async listFiles(options, authorization) {
        try {
            // Set default options
            const opts = Object.assign({ limit: 100, includeDirs: true, recursive: false, sortDirection: 'asc' }, options);
            // Resolve base directory
            const baseDir = opts.prefix
                ? path_1.default.join(this.uploadDir, opts.prefix)
                : this.uploadDir;
            // Check if directory exists
            if (!fs.existsSync(baseDir)) {
                return {
                    files: [],
                    directories: [],
                    count: 0,
                    prefix: opts.prefix,
                    hasMore: false,
                    totalSize: 0,
                };
            }
            // Initialize result containers
            const files = [];
            const directories = [];
            let totalSize = 0;
            // Helper function to check if file matches filters
            const matchesFilters = async (filePath, stats) => {
                // Extension filter
                if (opts.extensions) {
                    const fileExt = path_1.default.extname(filePath).toLowerCase().replace('.', '');
                    const allowedExts = opts.extensions.split(',').map(e => e.trim().toLowerCase());
                    if (!allowedExts.includes(fileExt))
                        return false;
                }
                // Size filter
                if (opts.size) {
                    if (opts.size.min !== undefined && stats.size < opts.size.min)
                        return false;
                    if (opts.size.max !== undefined && stats.size > opts.size.max)
                        return false;
                }
                // Create date filter
                if (opts.createdAt) {
                    const createTime = stats.birthtime.getTime();
                    if (opts.createdAt.from && createTime < new Date(opts.createdAt.from).getTime())
                        return false;
                    if (opts.createdAt.to && createTime > new Date(opts.createdAt.to).getTime())
                        return false;
                }
                // Modified date filter
                if (opts.modifiedAt) {
                    const modTime = stats.mtime.getTime();
                    if (opts.modifiedAt.from && modTime < new Date(opts.modifiedAt.from).getTime())
                        return false;
                    if (opts.modifiedAt.to && modTime > new Date(opts.modifiedAt.to).getTime())
                        return false;
                }
                // MIME type filter
                if (opts.mimeType) {
                    const fileMime = mime.lookup(filePath) || 'application/octet-stream';
                    if (!fileMime.includes(opts.mimeType))
                        return false;
                }
                // Text search filter
                if (opts.searchTerm) {
                    const fileName = path_1.default.basename(filePath).toLowerCase();
                    if (!fileName.includes(opts.searchTerm.toLowerCase()))
                        return false;
                }
                return true;
            };
            // Function to process directory content
            const processDirectory = async (dirPath, relPath = '') => {
                const items = await fs_1.promises.readdir(dirPath);
                // Process directories first
                if (opts.includeDirs) {
                    for (const item of items) {
                        const itemPath = path_1.default.join(dirPath, item);
                        const stats = await fs_1.promises.stat(itemPath);
                        if (stats.isDirectory()) {
                            const dirRelPath = relPath ? `${relPath}/${item}` : item;
                            const dirKey = opts.prefix ? `${opts.prefix}/${dirRelPath}` : dirRelPath;
                            // Skip if this is the root of a recursive search
                            if (dirPath === baseDir) {
                                // Calculate directory size and item count (can be expensive for large dirs)
                                let dirSize = 0;
                                let itemCount = 0;
                                try {
                                    const dirItems = await fs_1.promises.readdir(itemPath);
                                    itemCount = dirItems.length;
                                    // Optionally calculate directory size
                                    // This can be expensive, so we might want to make it optional
                                    if (opts.includeSizes) {
                                        dirSize = await this.calculateDirectorySize(itemPath);
                                    }
                                }
                                catch (err) {
                                    const error = err;
                                    this.logger.warn(`Error reading directory ${dirKey}: ${error.message}`);
                                }
                                directories.push({
                                    key: dirKey,
                                    name: item,
                                    createdAt: stats.birthtime,
                                    lastModified: stats.mtime,
                                    itemCount,
                                    size: dirSize
                                });
                            }
                            // If recursive, process subdirectories
                            if (opts.recursive) {
                                await processDirectory(itemPath, dirRelPath);
                            }
                        }
                    }
                }
                // Process files
                for (const item of items) {
                    const itemPath = path_1.default.join(dirPath, item);
                    const stats = await fs_1.promises.stat(itemPath);
                    if (stats.isFile()) {
                        const fileRelPath = relPath ? `${relPath}/${item}` : item;
                        const fileKey = opts.prefix ? `${opts.prefix}/${fileRelPath}` : fileRelPath;
                        // Apply filters
                        if (await matchesFilters(itemPath, stats)) {
                            totalSize += stats.size;
                            files.push({
                                key: fileKey,
                                originalName: item,
                                size: stats.size,
                                mimeType: mime.lookup(itemPath) || 'application/octet-stream',
                                url: opts.includeUrls ? await this.getFileUrl(fileKey) : undefined,
                                createdAt: stats.birthtime,
                                lastModified: stats.mtime,
                            });
                        }
                    }
                }
            };
            // Process main directory and all subdirectories if recursive
            await processDirectory(baseDir);
            // Generate breadcrumbs
            const breadcrumbs = [];
            if (opts.prefix) {
                const segments = opts.prefix.split('/');
                let currentPath = '';
                breadcrumbs.push({ name: 'Home', path: '' });
                for (let i = 0; i < segments.length; i++) {
                    currentPath = currentPath ? `${currentPath}/${segments[i]}` : segments[i];
                    breadcrumbs.push({
                        name: segments[i],
                        path: currentPath
                    });
                }
            }
            // Calculate parent directory
            let parentDir = undefined;
            if (opts.prefix) {
                const segments = opts.prefix.split('/');
                segments.pop();
                parentDir = segments.join('/');
            }
            // Apply sorting
            const sortItems = (a, b) => {
                var _a, _b, _c, _d, _e, _f;
                const direction = opts.sortDirection === file_list_options_dto_1.SortDirection.DESC ? -1 : 1;
                switch (opts.sortBy) {
                    case file_list_options_dto_1.FileSortField.NAME:
                        return ((_a = a.originalName) === null || _a === void 0 ? void 0 : _a.localeCompare(b.originalName || b.name)) * direction;
                    case file_list_options_dto_1.FileSortField.SIZE:
                        return ((a.size || 0) - (b.size || 0)) * direction;
                    case file_list_options_dto_1.FileSortField.DATE_CREATED:
                        return (((_b = a.createdAt) === null || _b === void 0 ? void 0 : _b.getTime()) - ((_c = b.createdAt) === null || _c === void 0 ? void 0 : _c.getTime())) * direction;
                    case file_list_options_dto_1.FileSortField.DATE_MODIFIED:
                        return (((_d = a.lastModified) === null || _d === void 0 ? void 0 : _d.getTime()) - ((_e = b.lastModified) === null || _e === void 0 ? void 0 : _e.getTime())) * direction;
                    case file_list_options_dto_1.FileSortField.TYPE:
                        const aType = a.mimeType || '';
                        const bType = b.mimeType || '';
                        return aType.localeCompare(bType) * direction;
                    default:
                        return ((_f = a.originalName) === null || _f === void 0 ? void 0 : _f.localeCompare(b.originalName || b.name)) * direction;
                }
            };
            // Sort files and directories
            files.sort(sortItems);
            directories.sort(sortItems);
            // Apply pagination
            let hasMore = false;
            let nextMarker = undefined;
            // Calculate actual limit considering marker-based pagination
            let startIdx = 0;
            const combinedItems = [...directories, ...files];
            if (opts.marker) {
                // Find the index after the marker
                startIdx = combinedItems.findIndex(item => (item.key || '') === opts.marker) + 1;
                if (startIdx <= 0)
                    startIdx = 0;
            }
            // Slice the results based on pagination
            const endIdx = opts.limit ? startIdx + opts.limit : combinedItems.length;
            const paginatedItems = combinedItems.slice(startIdx, endIdx);
            // Calculate if there are more results and next marker
            hasMore = endIdx < combinedItems.length;
            if (hasMore && paginatedItems.length > 0) {
                nextMarker = paginatedItems[paginatedItems.length - 1].key;
            }
            // Separate files and directories again
            const paginatedFiles = paginatedItems
                .filter(item => 'originalName' in item);
            const paginatedDirs = paginatedItems
                .filter(item => !('originalName' in item));
            return {
                files: paginatedFiles,
                directories: opts.includeDirs ? paginatedDirs : undefined,
                count: paginatedFiles.length + ((paginatedDirs === null || paginatedDirs === void 0 ? void 0 : paginatedDirs.length) || 0),
                prefix: opts.prefix,
                hasMore,
                nextMarker,
                totalSize,
                parentDir,
                breadcrumbs: breadcrumbs.length > 0 ? breadcrumbs : undefined
            };
        }
        catch (error) {
            const err = error;
            this.logger.error(`Error listing files: ${err.message}`, err.stack);
            throw error;
        }
    }
    // Helper method to calculate directory size
    async calculateDirectorySize(dirPath) {
        let totalSize = 0;
        const items = await fs_1.promises.readdir(dirPath);
        for (const item of items) {
            const itemPath = path_1.default.join(dirPath, item);
            const stats = await fs_1.promises.stat(itemPath);
            if (stats.isFile()) {
                totalSize += stats.size;
            }
            else if (stats.isDirectory()) {
                totalSize += await this.calculateDirectorySize(itemPath);
            }
        }
        return totalSize;
    }
    async createDirectory(dirPath) {
        try {
            const fullPath = path_1.default.join(this.uploadDir, dirPath);
            if (fs.existsSync(fullPath)) {
                throw new Error(`Directory ${dirPath} already exists`);
            }
            await fs_1.promises.mkdir(fullPath, { recursive: true });
            const stats = await fs_1.promises.stat(fullPath);
            return {
                key: dirPath,
                name: path_1.default.basename(dirPath),
                createdAt: stats.birthtime,
                lastModified: stats.mtime,
                itemCount: 0,
                size: 0
            };
        }
        catch (error) {
            const err = error;
            this.logger.error(`Error creating directory: ${err.message}`, err.stack);
            throw error;
        }
    }
    async deleteDirectory(dirPath, recursive = false) {
        try {
            const fullPath = path_1.default.join(this.uploadDir, dirPath);
            if (!fs.existsSync(fullPath)) {
                return false;
            }
            const stats = await fs_1.promises.stat(fullPath);
            if (!stats.isDirectory()) {
                throw new Error(`Path ${dirPath} is not a directory`);
            }
            // Check if directory is empty
            const items = await fs_1.promises.readdir(fullPath);
            if (items.length > 0 && !recursive) {
                throw new Error(`Directory ${dirPath} is not empty. Use recursive=true to delete anyway.`);
            }
            await fs_1.promises.rm(fullPath, { recursive, force: true });
            return true;
        }
        catch (error) {
            const err = error;
            this.logger.error(`Error deleting directory: ${err.message}`, err.stack);
            throw error;
        }
    }
    async renameDirectory(oldPath, newPath) {
        try {
            const oldFullPath = path_1.default.join(this.uploadDir, oldPath);
            const newFullPath = path_1.default.join(this.uploadDir, newPath);
            if (!fs.existsSync(oldFullPath)) {
                throw new Error(`Directory ${oldPath} does not exist`);
            }
            if (fs.existsSync(newFullPath)) {
                throw new Error(`Target directory ${newPath} already exists`);
            }
            const stats = await fs_1.promises.stat(oldFullPath);
            if (!stats.isDirectory()) {
                throw new Error(`Path ${oldPath} is not a directory`);
            }
            await fs_1.promises.rename(oldFullPath, newFullPath);
            const newStats = await fs_1.promises.stat(newFullPath);
            const items = await fs_1.promises.readdir(newFullPath);
            return {
                key: newPath,
                name: path_1.default.basename(newPath),
                createdAt: newStats.birthtime,
                lastModified: newStats.mtime,
                itemCount: items.length,
                size: await this.calculateDirectorySize(newFullPath)
            };
        }
        catch (error) {
            const err = error;
            this.logger.error(`Error renaming directory: ${err.message}`, err.stack);
            throw error;
        }
    }
    async getFileStream(fileKey) {
        const filePath = path_1.default.join(this.uploadDir, fileKey);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File ${fileKey} not found`);
        }
        return fs.createReadStream(filePath);
    }
    async getFileBuffer(fileKey) {
        const filePath = path_1.default.join(this.uploadDir, fileKey);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File ${fileKey} not found`);
        }
        return fs_1.promises.readFile(filePath);
    }
    async getFileUrl(fileKey, authorization) {
        // Local storage doesn't support presigned URLs with expiration
        // Just return a direct URL
        const encodedFileKey = encodeURIComponent(fileKey);
        const token = (authorization === null || authorization === void 0 ? void 0 : authorization.replace(/^Bearer\s+/i, '')) || '';
        return `${this.baseUrl}/${encodedFileKey}?token=${token}`;
    }
    async getContentType(fileKey) {
        const filePath = path_1.default.join(this.uploadDir, fileKey);
        return mime.lookup(filePath) || 'application/octet-stream';
    }
};
exports.LocalFileService = LocalFileService;
exports.LocalFileService = LocalFileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], LocalFileService);


/***/ }),
/* 173 */
/***/ ((module) => {

module.exports = require("mime-types");

/***/ }),
/* 174 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileListOptions = exports.SizeRangeFilter = exports.DateRangeFilter = exports.SortDirection = exports.FileSortField = void 0;
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
var FileSortField;
(function (FileSortField) {
    FileSortField["NAME"] = "name";
    FileSortField["SIZE"] = "size";
    FileSortField["DATE_CREATED"] = "createdAt";
    FileSortField["DATE_MODIFIED"] = "lastModified";
    FileSortField["TYPE"] = "mimeType";
})(FileSortField || (exports.FileSortField = FileSortField = {}));
var SortDirection;
(function (SortDirection) {
    SortDirection["ASC"] = "asc";
    SortDirection["DESC"] = "desc";
})(SortDirection || (exports.SortDirection = SortDirection = {}));
class DateRangeFilter {
}
exports.DateRangeFilter = DateRangeFilter;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start date for range filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DateRangeFilter.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End date for range filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DateRangeFilter.prototype, "to", void 0);
class SizeRangeFilter {
}
exports.SizeRangeFilter = SizeRangeFilter;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum file size in bytes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SizeRangeFilter.prototype, "min", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum file size in bytes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SizeRangeFilter.prototype, "max", void 0);
class FileListOptions {
    constructor() {
        this.includeDirs = true;
        this.includeSizes = true;
        this.recursive = false;
        this.sortDirection = SortDirection.ASC;
    }
}
exports.FileListOptions = FileListOptions;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Directory path to list files from' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileListOptions.prototype, "prefix", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum number of items to return' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FileListOptions.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pagination marker/cursor' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileListOptions.prototype, "marker", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to include file URLs in response' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], FileListOptions.prototype, "includeUrls", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to include directories in results' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], FileListOptions.prototype, "includeDirs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to include file sizes in response' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], FileListOptions.prototype, "includeSizes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to recursively traverse directories' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], FileListOptions.prototype, "recursive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: FileSortField,
        description: 'Field to sort by'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(FileSortField),
    __metadata("design:type", String)
], FileListOptions.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: SortDirection,
        description: 'Sort direction'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortDirection),
    __metadata("design:type", String)
], FileListOptions.prototype, "sortDirection", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search term for filename' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileListOptions.prototype, "searchTerm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'File extensions to filter by (comma-separated)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileListOptions.prototype, "extensions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by file size' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SizeRangeFilter),
    __metadata("design:type", SizeRangeFilter)
], FileListOptions.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by creation date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DateRangeFilter),
    __metadata("design:type", DateRangeFilter)
], FileListOptions.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by modification date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DateRangeFilter),
    __metadata("design:type", DateRangeFilter)
], FileListOptions.prototype, "modifiedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by MIME type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileListOptions.prototype, "mimeType", void 0);


/***/ }),
/* 175 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseFileService = void 0;
const common_1 = __webpack_require__(1);
const crypto = __importStar(__webpack_require__(176));
const csv_writer_1 = __webpack_require__(177);
const ExcelJS = __importStar(__webpack_require__(178));
const fs = __importStar(__webpack_require__(104));
const path = __importStar(__webpack_require__(106));
const pdfkit_1 = __importDefault(__webpack_require__(179));
let BaseFileService = class BaseFileService {
    constructor(uploadDir, baseUrl) {
        this.logger = new common_1.Logger(this.constructor.name);
        this.uploadDir = uploadDir || '';
        this.baseUrl = baseUrl || '';
    }
    // Common implementable methods
    async streamFile(fileKey, res, inline = null) {
        var _a;
        try {
            // Check if file exists first to handle 404 gracefully
            if (!(await this.fileExists(fileKey))) {
                res.status(404).send('File not found');
                return;
            }
            const contentType = await this.getContentType(fileKey);
            const metadata = await this.getFileMetadata(fileKey);
            const filename = path.basename(fileKey);
            const fileSize = metadata.size;
            const filePath = path.join(this.uploadDir, fileKey);
            // Auto-detect if inline should be true based on content type if not explicitly set
            if (inline === null) {
                inline = contentType.startsWith('video/') ||
                    contentType.startsWith('audio/') ||
                    contentType === 'application/pdf' ||
                    contentType.startsWith('image/');
            }
            // Set common headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Range');
            res.setHeader('Accept-Ranges', 'bytes');
            // Set cache control based on file type
            if (contentType.startsWith('image/')) {
                // Cache images longer
                res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
            }
            else if (contentType.startsWith('video/') || contentType.startsWith('audio/')) {
                // Streaming media cache
                res.setHeader('Cache-Control', 'public, max-age=3600');
            }
            else {
                // Default cache for documents and other files
                res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
            }
            // Set content type and disposition
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(filename)}"`);
            // Get range header from request
            const range = res.req.headers.range;
            // Apply range requests for videos, audio, and large files
            const isRangeSupported = contentType.startsWith('video/') ||
                contentType.startsWith('audio/') ||
                contentType === 'application/pdf' ||
                fileSize > 10 * 1024 * 1024; // 10MB+
            // If no range header or range not supported for this file type, send entire file
            if (!range || !isRangeSupported) {
                res.setHeader('Content-Length', fileSize);
                const stream = await this.getFileStream(fileKey);
                return new Promise((resolve, reject) => {
                    stream.pipe(res)
                        .on('finish', () => resolve())
                        .on('error', (err) => {
                        this.logger.error(`Error streaming file: ${err.message}`, err.stack);
                        reject(err);
                    });
                });
            }
            // Handle range request
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            // Validate range request
            if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize) {
                // Return 416 Range Not Satisfiable if range is invalid
                res.status(416);
                res.setHeader('Content-Range', `bytes */${fileSize}`);
                res.end();
                return;
            }
            const chunkSize = end - start + 1;
            // Set partial content headers
            res.status(206);
            res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            res.setHeader('Content-Length', chunkSize);
            // Create read stream with range
            const stream = fs.createReadStream(filePath, { start, end });
            return new Promise((resolve, reject) => {
                stream.pipe(res)
                    .on('finish', () => resolve())
                    .on('error', (err) => {
                    this.logger.error(`Error streaming file range: ${err.message}`, err.stack);
                    reject(err);
                });
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`Error streaming file: ${err.message}`, err.stack);
            // If headers haven't been sent yet, send appropriate error response
            if (!res.headersSent) {
                if ((_a = err.message) === null || _a === void 0 ? void 0 : _a.includes('not found')) {
                    res.status(404).send('File not found');
                }
                else {
                    res.status(500).send('Error streaming file');
                }
            }
            else {
                // If headers were sent, just end the response
                res.end();
            }
            throw error;
        }
    }
    async downloadFile(fileKey, res) {
        try {
            return this.streamFile(fileKey, res, false);
        }
        catch (error) {
            const err = error;
            this.logger.error(`Error downloading file: ${err.message}`, err.stack);
            throw error;
        }
    }
    generateUniqueFileName(originalName) {
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const extension = path.extname(originalName);
        const sanitizedName = path.basename(originalName, extension)
            .replace(/[^a-zA-Z0-9]/g, '-')
            .substring(0, 40);
        return `${sanitizedName}-${timestamp}-${randomString}${extension}`;
    }
    async exportToCsv(data, options) {
        const columns = (options === null || options === void 0 ? void 0 : options.columns) || Object.keys(data[0] || {}).map(id => ({ id, title: id }));
        const csvStringifier = (0, csv_writer_1.createObjectCsvStringifier)({ header: columns });
        const headers = csvStringifier.getHeaderString();
        const records = csvStringifier.stringifyRecords(data);
        return Buffer.from(headers + records);
    }
    async exportToExcel(data, options) {
        var _a;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet((options === null || options === void 0 ? void 0 : options.sheetName) || 'Data');
        const columns = ((_a = options === null || options === void 0 ? void 0 : options.columns) === null || _a === void 0 ? void 0 : _a.map(col => ({
            header: col.title,
            key: col.id,
            width: 15
        }))) || Object.keys(data[0] || {}).map(id => ({
            header: id,
            key: id,
            width: 15
        }));
        worksheet.columns = columns;
        if (options === null || options === void 0 ? void 0 : options.headerStyle) {
            worksheet.getRow(1).font = options.headerStyle;
        }
        data.forEach(item => {
            worksheet.addRow(item);
        });
        return await workbook.xlsx.writeBuffer();
    }
    async exportToPdf(data, options) {
        return new Promise((resolve) => {
            const buffers = [];
            const doc = new pdfkit_1.default({
                margin: 50,
                size: 'A4',
                layout: (options === null || options === void 0 ? void 0 : options.orientation) || 'portrait'
            });
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
            // Add title
            doc.fontSize(16).text((options === null || options === void 0 ? void 0 : options.filename) || 'Data Export', {
                align: 'center'
            });
            doc.moveDown();
            // Create a simple table
            const columns = (options === null || options === void 0 ? void 0 : options.columns) || Object.keys(data[0] || {}).map(id => ({ id, title: id }));
            const tableTop = 150;
            const tableLeft = 50;
            let rowTop = tableTop;
            // Draw header
            doc.fontSize(12);
            columns.forEach((column, i) => {
                const leftPos = tableLeft + (i * 100);
                doc.font('Helvetica-Bold').text(column.title, leftPos, rowTop);
            });
            // Draw rows
            rowTop += 20;
            data.forEach(row => {
                columns.forEach((column, i) => {
                    const leftPos = tableLeft + (i * 100);
                    doc.font('Helvetica').text(String(row[column.id] || ''), leftPos, rowTop);
                });
                rowTop += 20;
                // Add new page if needed
                if (rowTop > 700) {
                    doc.addPage();
                    rowTop = 50;
                }
            });
            doc.end();
        });
    }
    /**
     * Validates file against size and type constraints
     * Utility method for implementations to use during upload operations
     */
    validateFile(file, options) {
        // Check file size if max size specified
        if ((options === null || options === void 0 ? void 0 : options.maxSizeBytes) && file.size > options.maxSizeBytes) {
            throw new Error(`File size exceeds the limit of ${options.maxSizeBytes} bytes`);
        }
        // Check file type if allowed types specified
        if ((options === null || options === void 0 ? void 0 : options.allowedTypes) && options.allowedTypes.length > 0) {
            const mimeType = options.contentType || file.mimetype;
            if (!options.allowedTypes.includes(mimeType)) {
                throw new Error(`File type ${mimeType} not allowed`);
            }
        }
        return true;
    }
};
exports.BaseFileService = BaseFileService;
exports.BaseFileService = BaseFileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String, String])
], BaseFileService);


/***/ }),
/* 176 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 177 */
/***/ ((module) => {

module.exports = require("csv-writer");

/***/ }),
/* 178 */
/***/ ((module) => {

module.exports = require("exceljs");

/***/ }),
/* 179 */
/***/ ((module) => {

module.exports = require("pdfkit");

/***/ }),
/* 180 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FilesController_1;
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FilesController = void 0;
const authorize_decorator_1 = __webpack_require__(59);
const current_user_decorator_1 = __webpack_require__(75);
const common_1 = __webpack_require__(1);
const platform_express_1 = __webpack_require__(181);
const swagger_1 = __webpack_require__(4);
const express_1 = __webpack_require__(115);
const file_provider_config_1 = __webpack_require__(171);
const directory_metadata_dto_1 = __webpack_require__(182);
const file_list_response_dto_1 = __webpack_require__(183);
const file_meta_data_dto_1 = __webpack_require__(184);
const file_service_interface_1 = __webpack_require__(185);
let FilesController = FilesController_1 = class FilesController {
    constructor(fileService) {
        this.fileService = fileService;
        this.logger = new common_1.Logger(FilesController_1.name);
    }
    async uploadFile(file, req, folder, userId) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        try {
            const authorization = req.headers.authorization;
            this.logger.debug(`Authorization header: ${authorization}`);
            return await this.fileService.uploadFile(file, {
                folder,
                token: authorization,
                metadata: { uploadedBy: userId || 'anonymous' }
            });
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.BadRequestException(`File upload failed: ${error.message}`);
            }
            throw new common_1.BadRequestException('File upload failed');
        }
    }
    async uploadMultiple(files, req, folder, userId) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        try {
            const authorization = req.headers.authorization;
            return await this.fileService.uploadFiles(files, {
                folder,
                token: authorization,
                metadata: { uploadedBy: userId || 'anonymous' }
            });
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.BadRequestException(`Files upload failed: ${error.message}`);
            }
            throw new common_1.BadRequestException('Files upload failed');
        }
    }
    async getFileMetadata(key, request) {
        try {
            const authorization = request.headers.authorization;
            return await this.fileService.getFileMetadata(key, authorization);
        }
        catch (error) {
            throw new common_1.NotFoundException(`File not found: ${key}`);
        }
    }
    async downloadFile(key, res) {
        try {
            await this.fileService.downloadFile(key, res);
        }
        catch (error) {
            throw new common_1.NotFoundException(`File not found: ${key}`);
        }
    }
    async streamFile(key, res) {
        try {
            // Check if file exists first before starting to stream
            if (!(await this.fileService.fileExists(key))) {
                res.status(404).send(`File not found: ${key}`);
                return;
            }
            // Stream the file - no try/catch here to prevent header modifications after streaming
            await this.fileService.streamFile(key, res, true);
        }
        catch (error) {
            // Only set status and send error if headers haven't been sent yet
            if (!res.headersSent) {
                res.status(500).send('Error streaming file');
            }
        }
    }
    async getFileUrl(key, req) {
        try {
            const authorization = req.headers.authorization;
            const url = await this.fileService.getFileUrl(key, authorization);
            return { url };
        }
        catch (error) {
            throw new common_1.NotFoundException(`File not found: ${key}`);
        }
    }
    async listFiles(req, prefix, limit, marker, includeUrls, includeDirs, includeSizes, recursive, sortBy, sortDirection, searchTerm, extensions) {
        var _a, _b;
        // Transform boolean strings to actual booleans
        const boolFromString = (val) => {
            if (val === 'true')
                return true;
            if (val === 'false')
                return false;
            return val === true;
        };
        const options = {
            prefix,
            limit: limit ? parseInt(String(limit), 10) : undefined,
            marker,
            includeUrls: boolFromString(includeUrls),
            includeDirs: includeDirs !== undefined ? boolFromString(includeDirs) : true,
            recursive: boolFromString(recursive),
            sortBy: sortBy,
            sortDirection: sortDirection || 'asc',
            searchTerm,
            extensions
        };
        try {
            const authorization = req.headers.authorization;
            const result = await this.fileService.listFiles(options, authorization);
            // If the result is already in the correct format, return it directly
            if ('directories' in result) {
                return result;
            }
            // Otherwise, build the response in the correct format
            // This is for backward compatibility with implementations that don't return directories
            return {
                files: Array.isArray(result) ? result : (result.files || []),
                directories: result.directories || [],
                count: Array.isArray(result) ? result.length : (result.count || ((_a = result.files) === null || _a === void 0 ? void 0 : _a.length) || 0),
                prefix: options.prefix,
                hasMore: Array.isArray(result)
                    ? result.length === options.limit
                    : (result.hasMore || (((_b = result.files) === null || _b === void 0 ? void 0 : _b.length) === options.limit)),
                nextMarker: result.nextMarker,
                totalSize: result.totalSize,
                parentDir: result.parentDir,
                breadcrumbs: result.breadcrumbs
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.BadRequestException(`Failed to list files: ${error.message}`);
            }
            throw new common_1.BadRequestException('Failed to list files');
        }
    }
    async deleteFile(key) {
        const success = await this.fileService.deleteFile(key);
        return { success };
    }
    async fileExists(key) {
        const exists = await this.fileService.fileExists(key);
        return { exists };
    }
    async createDirectory(dirPath, userId) {
        if (!dirPath) {
            throw new common_1.BadRequestException('No directory path provided');
        }
        try {
            return await this.fileService.createDirectory(dirPath);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.BadRequestException(`Directory creation failed: ${error.message}`);
            }
            throw new common_1.BadRequestException('Directory creation failed');
        }
    }
    async deleteDirectory(dirPath, recursive = false, userId) {
        try {
            const success = await this.fileService.deleteDirectory(dirPath, recursive);
            return { success };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.BadRequestException(`Directory deletion failed: ${error.message}`);
            }
            throw new common_1.BadRequestException('Directory deletion failed');
        }
    }
    async renameDirectory(dirPath, newPath, userId) {
        if (!newPath) {
            throw new common_1.BadRequestException('No new path provided');
        }
        try {
            return await this.fileService.renameDirectory(dirPath, newPath);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.BadRequestException(`Directory rename failed: ${error.message}`);
            }
            throw new common_1.BadRequestException('Directory rename failed');
        }
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a single file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'File uploaded successfully',
        type: file_meta_data_dto_1.FileMetadata
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('folder')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof Express !== "undefined" && (_b = Express.Multer) !== void 0 && _b.File) === "function" ? _c : Object, typeof (_d = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _d : Object, String, String]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Upload multiple files' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary'
                    },
                    description: 'Files to upload (max 10)'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Files uploaded successfully',
        type: [file_meta_data_dto_1.FileMetadata]
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('folder')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object, String, String]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], FilesController.prototype, "uploadMultiple", null);
__decorate([
    (0, common_1.Get)('metadata/:key'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get file metadata' }),
    (0, swagger_1.ApiParam)({ name: 'key', description: 'File key' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File metadata retrieved successfully',
        type: file_meta_data_dto_1.FileMetadata
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_h = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _h : Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], FilesController.prototype, "getFileMetadata", null);
__decorate([
    (0, common_1.Get)('download/:key'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Download a file' }),
    (0, swagger_1.ApiParam)({ name: 'key', description: 'File key' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File download' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_k = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], FilesController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)('stream/:key'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Stream a file (for browser viewing)' }),
    (0, swagger_1.ApiParam)({ name: 'key', description: 'File key' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File stream' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' })
    // This properly disables all interceptors for this route
    ,
    (0, common_1.UseInterceptors)()
    // Important! Add this to bypass global interceptors
    ,
    (0, common_1.Version)(common_1.VERSION_NEUTRAL),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Res)({ passthrough: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_m = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _m : Object]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], FilesController.prototype, "streamFile", null);
__decorate([
    (0, common_1.Get)('url/:key'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a temporary URL for a file with user current token' }),
    (0, swagger_1.ApiParam)({ name: 'key', description: 'File key' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File URL',
        schema: {
            type: 'object',
            properties: {
                url: { type: 'string' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_p = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _p : Object]),
    __metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], FilesController.prototype, "getFileUrl", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'List files and directories' }),
    (0, swagger_1.ApiQuery)({
        name: 'prefix',
        required: false,
        description: 'Directory path to list files from'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Maximum number of items to return'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'marker',
        required: false,
        description: 'Pagination marker/cursor for fetching next page'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'includeUrls',
        required: false,
        type: Boolean,
        description: 'Whether to include file URLs in response'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'includeDirs',
        required: false,
        type: Boolean,
        description: 'Whether to include directories in results'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'includeSizes',
        required: false,
        type: Boolean,
        description: 'Whether to include file sizes in response'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'recursive',
        required: false,
        type: Boolean,
        description: 'Whether to recursively list files in subdirectories'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        enum: ['name', 'size', 'createdAt', 'lastModified', 'mimeType'],
        description: 'Field to sort by'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortDirection',
        required: false,
        enum: ['asc', 'desc'],
        description: 'Sort direction (asc or desc)'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'searchTerm',
        required: false,
        description: 'Filter files by filename search term'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'extensions',
        required: false,
        description: 'Filter by file extensions (comma-separated)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Files and directories listed successfully',
        type: file_list_response_dto_1.FileListResponseDto
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('prefix')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('marker')),
    __param(4, (0, common_1.Query)('includeUrls')),
    __param(5, (0, common_1.Query)('includeDirs')),
    __param(6, (0, common_1.Query)('includeSizes')),
    __param(7, (0, common_1.Query)('recursive')),
    __param(8, (0, common_1.Query)('sortBy')),
    __param(9, (0, common_1.Query)('sortDirection')),
    __param(10, (0, common_1.Query)('searchTerm')),
    __param(11, (0, common_1.Query)('extensions')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_r = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _r : Object, String, Number, String, Boolean, Boolean, Boolean, Boolean, String, String, String, String]),
    __metadata("design:returntype", typeof (_s = typeof Promise !== "undefined" && Promise) === "function" ? _s : Object)
], FilesController.prototype, "listFiles", null);
__decorate([
    (0, common_1.Delete)(':key'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a file' }),
    (0, swagger_1.ApiParam)({ name: 'key', description: 'File key' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File deleted successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_t = typeof Promise !== "undefined" && Promise) === "function" ? _t : Object)
], FilesController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Get)('validate/:key'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check if a file exists' }),
    (0, swagger_1.ApiParam)({ name: 'key', description: 'File key' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File existence status',
        schema: {
            type: 'object',
            properties: {
                exists: { type: 'boolean' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_u = typeof Promise !== "undefined" && Promise) === "function" ? _u : Object)
], FilesController.prototype, "fileExists", null);
__decorate([
    (0, common_1.Post)('directories'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new directory' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'Directory path to create'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Directory created successfully',
        type: directory_metadata_dto_1.DirectoryMetadata
    }),
    __param(0, (0, common_1.Body)('path')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", typeof (_v = typeof Promise !== "undefined" && Promise) === "function" ? _v : Object)
], FilesController.prototype, "createDirectory", null);
__decorate([
    (0, common_1.Delete)('directories/:path(*)'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a directory' }),
    (0, swagger_1.ApiParam)({ name: 'path', description: 'Directory path to delete' }),
    (0, swagger_1.ApiQuery)({
        name: 'recursive',
        required: false,
        description: 'Whether to recursively delete non-empty directories'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Directory deleted successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('path')),
    __param(1, (0, common_1.Query)('recursive')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, String]),
    __metadata("design:returntype", typeof (_w = typeof Promise !== "undefined" && Promise) === "function" ? _w : Object)
], FilesController.prototype, "deleteDirectory", null);
__decorate([
    (0, common_1.Put)('directories/:path(*)'),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Rename a directory' }),
    (0, swagger_1.ApiParam)({ name: 'path', description: 'Current directory path' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                newPath: {
                    type: 'string',
                    description: 'New directory path'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Directory renamed successfully',
        type: directory_metadata_dto_1.DirectoryMetadata
    }),
    __param(0, (0, common_1.Param)('path')),
    __param(1, (0, common_1.Body)('newPath')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", typeof (_x = typeof Promise !== "undefined" && Promise) === "function" ? _x : Object)
], FilesController.prototype, "renameDirectory", null);
exports.FilesController = FilesController = FilesController_1 = __decorate([
    (0, swagger_1.ApiTags)('Files'),
    (0, common_1.Controller)('files'),
    __param(0, (0, common_1.Inject)(file_provider_config_1.FILE_SERVICE)),
    __metadata("design:paramtypes", [typeof (_a = typeof file_service_interface_1.IFileService !== "undefined" && file_service_interface_1.IFileService) === "function" ? _a : Object])
], FilesController);


/***/ }),
/* 181 */
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),
/* 182 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DirectoryMetadata = void 0;
const swagger_1 = __webpack_require__(4);
class DirectoryMetadata {
}
exports.DirectoryMetadata = DirectoryMetadata;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Directory path/key' }),
    __metadata("design:type", String)
], DirectoryMetadata.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Directory name' }),
    __metadata("design:type", String)
], DirectoryMetadata.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Directory creation date' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], DirectoryMetadata.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Last modified date' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], DirectoryMetadata.prototype, "lastModified", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Item count in directory' }),
    __metadata("design:type", Number)
], DirectoryMetadata.prototype, "itemCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total size of all files in directory' }),
    __metadata("design:type", Number)
], DirectoryMetadata.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether this is a parent directory link' }),
    __metadata("design:type", Boolean)
], DirectoryMetadata.prototype, "isParent", void 0);


/***/ }),
/* 183 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileListResponseDto = void 0;
const swagger_1 = __webpack_require__(4);
const directory_metadata_dto_1 = __webpack_require__(182);
const file_meta_data_dto_1 = __webpack_require__(184);
class FileListResponseDto {
}
exports.FileListResponseDto = FileListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [file_meta_data_dto_1.FileMetadata], description: 'List of files' }),
    __metadata("design:type", Array)
], FileListResponseDto.prototype, "files", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [directory_metadata_dto_1.DirectoryMetadata], description: 'List of directories' }),
    __metadata("design:type", Array)
], FileListResponseDto.prototype, "directories", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total count of files in result' }),
    __metadata("design:type", Number)
], FileListResponseDto.prototype, "count", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current directory/prefix' }),
    __metadata("design:type", String)
], FileListResponseDto.prototype, "prefix", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there are more results available' }),
    __metadata("design:type", Boolean)
], FileListResponseDto.prototype, "hasMore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pagination marker for next page' }),
    __metadata("design:type", String)
], FileListResponseDto.prototype, "nextMarker", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Total size of all files in bytes' }),
    __metadata("design:type", Number)
], FileListResponseDto.prototype, "totalSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Parent directory path' }),
    __metadata("design:type", String)
], FileListResponseDto.prototype, "parentDir", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Breadcrumb navigation path segments' }),
    __metadata("design:type", typeof (_a = typeof Array !== "undefined" && Array) === "function" ? _a : Object)
], FileListResponseDto.prototype, "breadcrumbs", void 0);


/***/ }),
/* 184 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileMetadata = void 0;
class FileMetadata {
}
exports.FileMetadata = FileMetadata;


/***/ }),
/* 185 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 186 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogsModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const activity_logs_entity_1 = __webpack_require__(45);
const logs_service_1 = __webpack_require__(187);
let LogsModule = class LogsModule {
};
exports.LogsModule = LogsModule;
exports.LogsModule = LogsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([activity_logs_entity_1.ActivityLog])],
        providers: [logs_service_1.LogsService],
        exports: [logs_service_1.LogsService],
    })
], LogsModule);


/***/ }),
/* 187 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogsService = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const activity_logs_entity_1 = __webpack_require__(45);
let LogsService = class LogsService extends common_1.Logger {
    constructor(activityLogRepository) {
        super();
        this.activityLogRepository = activityLogRepository;
    }
    async logActivity(logActivityDto) {
        const activityLog = this.activityLogRepository.create({
            action: logActivityDto.action,
            subject: logActivityDto.subject,
            actor: logActivityDto.user,
            message: logActivityDto.message,
            details: logActivityDto.details,
            logType: logActivityDto.logType,
        });
        return await this.activityLogRepository.save(activityLog);
    }
    log(model) {
        super.log(model.message);
        this.saveLog(model);
    }
    error(model) {
        super.error(model.message);
        this.saveLog(model);
    }
    warn(model) {
        super.warn(model.message);
        this.saveLog(model);
    }
    debug(model) {
        super.debug(model.message);
        this.saveLog(model);
    }
    verbose(model) {
        super.verbose(model.message);
        this.saveLog(model);
    }
    async saveLog(model) {
        await this.logActivity(model);
    }
};
exports.LogsService = LogsService;
exports.LogsService = LogsService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT }),
    __param(0, (0, typeorm_1.InjectRepository)(activity_logs_entity_1.ActivityLog)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], LogsService);


/***/ }),
/* 188 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationsModule = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(13);
const account_management_module_1 = __webpack_require__(88);
const users_module_1 = __webpack_require__(12);
const notification_entity_1 = __webpack_require__(47);
const notifications_gateway_1 = __webpack_require__(189);
const notifications_service_1 = __webpack_require__(193);
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([notification_entity_1.Notification]), users_module_1.UsersModule, config_1.ConfigModule, account_management_module_1.AccountManagementModule],
        providers: [notifications_service_1.NotificationsService, notifications_gateway_1.NotificationsGateway],
        exports: [notifications_service_1.NotificationsService, notifications_gateway_1.NotificationsGateway],
    })
], NotificationsModule);


/***/ }),
/* 189 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationsGateway = void 0;
const base_gateway_1 = __webpack_require__(190);
const jwt_service_1 = __webpack_require__(119);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const websockets_1 = __webpack_require__(191);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
const notifications_service_1 = __webpack_require__(193);
// DTOs for notification events
class ReadNotificationDto {
}
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReadNotificationDto.prototype, "notificationId", void 0);
class FetchNotificationsDto {
    constructor() {
        this.limit = 20;
        this.page = 1;
    }
}
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FetchNotificationsDto.prototype, "category", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FetchNotificationsDto.prototype, "limit", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FetchNotificationsDto.prototype, "page", void 0);
let NotificationsGateway = class NotificationsGateway extends base_gateway_1.BaseGateway {
    constructor(jwtService, usersService, configService, notificationsService) {
        super(jwtService, usersService, configService);
        this.notificationsService = notificationsService;
        // Fulfill abstract properties from BaseGateway
        this.namespace = 'notifications';
        // Define event handlers map
        this.eventHandlers = new Map([
            ['read', this.handleReadNotification.bind(this)],
            ['fetch', this.handleFetchNotifications.bind(this)],
            ['mark_all_read', this.handleMarkAllRead.bind(this)],
        ]);
    }
    // Override afterConnect to automatically join user-specific notification room
    afterConnect(client) {
        if (client.user) {
            const userRoom = `user:${client.user.email}:notifications`;
            this.joinRoom(client, userRoom);
            this.logger.log(`${client.user.email} subscribed to notifications`);
        }
    }
    // Event handlers
    // private async handleSendNotification(client: AuthenticatedSocket, payload: any): Promise<void> {
    //   if (!client.user) return;
    //   try {
    //     // Validate input
    //     const dto = this.validatePayload(payload, NotificationDto);
    //     // Create notification object
    //     const notification: Notification = {
    //       id: uuidv4(), // You'll need to import uuidv4 from 'uuid'
    //       userId: dto.recipientId,
    //       title: dto.title,
    //       message: dto.message,
    //       category: dto.category || 'user',
    //       read: false,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     };
    //     // Optional: Save to database if you want persistence
    //     await this.notificationsService.create(notification);
    //     // Send the notification
    //     await this.sendNotification(notification);
    //     // Confirm to sender
    //     client.emit('notification_sent', { 
    //       success: true,
    //       notificationId: notification.id
    //     });
    //   } catch (error) {
    //     this.handleError('Sending notification', error, client);
    //     client.emit('notification_sent', { 
    //       success: false,
    //       error: error instanceof Error ? error.message : 'Unknown error'
    //     });
    //   }
    // }
    async handleReadNotification(client, payload) {
        if (!client.user)
            return;
        try {
            const dto = this.validatePayload(payload, ReadNotificationDto);
            // Mark notification as read
            await this.notificationsService.markAsRead(dto.notificationId, client.user.sub);
            // Get updated unread count
            const count = await this.notificationsService.countUnreadByUser(client.user.sub);
            // Confirm to client
            client.emit('notification_read', {
                id: dto.notificationId,
                unreadCount: count
            });
        }
        catch (error) {
            this.handleError('Reading notification', error, client);
        }
    }
    async handleFetchNotifications(client, payload) {
        if (!client.user)
            return;
        try {
            const dto = this.validatePayload(payload, FetchNotificationsDto);
        }
        catch (error) {
            this.handleError('Fetching notifications', error, client);
        }
    }
    async handleMarkAllRead(client) {
        if (!client.user)
            return;
        try {
            // Mark all notifications as read
            await this.notificationsService.markAllAsRead(client.user.sub);
            // Return updated unread count (should be 0 if all marked as read)
            const count = await this.notificationsService.countUnreadByUser(client.user.sub);
            client.emit('all_read', { unreadCount: count });
        }
        catch (error) {
            this.handleError('Marking all notifications as read', error, client);
        }
    }
    // Public method to send notification to a specific user
    async sendNotification(notification) {
        if (!notification.userId) {
            this.logger.warn('Attempted to send notification without userId');
            return false;
        }
        // Try to emit to user's personal notification room
        const userRoom = `user:${notification.userId}:notifications`;
        this.emitToRoom(userRoom, 'notification', notification);
        return true;
    }
    async broadcastNotification(notification, userIds) {
        for (const userId of userIds) {
            const userRoom = `user:${userId}:notifications`;
            const userNotification = Object.assign(Object.assign({}, notification), { userId });
            this.emitToRoom(userRoom, 'notification', userNotification);
        }
    }
};
exports.NotificationsGateway = NotificationsGateway;
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: 'notifications' }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_service_1.JwtService !== "undefined" && jwt_service_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object, typeof (_d = typeof notifications_service_1.NotificationsService !== "undefined" && notifications_service_1.NotificationsService) === "function" ? _d : Object])
], NotificationsGateway);


/***/ }),
/* 190 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseGateway = void 0;
const common_1 = __webpack_require__(1);
const websockets_1 = __webpack_require__(191);
const class_transformer_1 = __webpack_require__(57);
const socket_io_1 = __webpack_require__(192);
const uuid_1 = __webpack_require__(120);
class BaseGateway {
    constructor(jwtService, usersService, configService) {
        var _a, _b;
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.configService = configService;
        this.logger = new common_1.Logger(this.constructor.name);
        // Organized client tracking
        this.connectedClients = new Map();
        this.userRooms = new Map();
        // Add middleware support
        this.middlewares = [];
        // Rate limiting protection
        this.messageRateLimit = new Map();
        this.MAX_MESSAGES_PER_MINUTE = 60;
        this.HEARTBEAT_INTERVAL = 60000; // ms
        this.CONNECTION_TIMEOUT = 300000; // 5 minutes in ms
        this.AUTH_TOKEN_EXPIRY_BUFFER = 300; // 5 minutes in seconds
        this.metrics = {
            totalConnections: 0,
            activeConnections: 0,
            messagesProcessed: 0,
            authFailures: 0,
            rateLimitHits: 0
        };
        this.MAX_MESSAGES_PER_MINUTE = this.configService.get('websocket.rateLimit', 60);
        this.HEARTBEAT_INTERVAL = this.configService.get('websocket.heartbeatInterval', 60000);
        this.CONNECTION_TIMEOUT = this.configService.get('websocket.connectionTimeout', 300000);
        this.AUTH_TOKEN_EXPIRY_BUFFER = this.configService.get('websocket.tokenExpiryBuffer', 300);
        // Configure compression
        const compressionThreshold = this.configService.get('websocket.compressionThreshold', 1024);
        (_b = (_a = this.server) === null || _a === void 0 ? void 0 : _a.engine) === null || _b === void 0 ? void 0 : _b.on('connection', (socket) => {
            socket.compress = (data) => {
                return data.length > compressionThreshold;
            };
        });
    }
    // Lifecycle hooks
    onModuleInit() {
        this.logger.log(`Gateway ${this.constructor.name} initialized`);
        this.setupHeartbeat();
        this.setupEventHandlers();
    }
    onModuleDestroy() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        this.logger.log(`Gateway ${this.constructor.name} destroyed`);
    }
    afterInit(server) {
        this.logger.log(`WebSocket Gateway ${this.constructor.name} initialized`);
    }
    handleConnection(client) {
        try {
            this.metrics.totalConnections++;
            this.metrics.activeConnections++;
            // Generate a unique connection ID for this socket
            client.connectionId = (0, uuid_1.v4)();
            // Apply middlewares before proceeding with connection
            this.applyMiddlewares(client, async (err) => {
                if (err) {
                    this.logger.error(`Middleware error: ${err.message}`);
                    client.disconnect();
                    return;
                }
                // Continue with existing connection logic
                const isAuthenticated = await this.authenticateClient(client);
                if (!isAuthenticated) {
                    this.logger.warn(`Authentication failed for connection ${client.id}`);
                    client.disconnect();
                    return;
                }
                // Rest of your existing connection logic...
                if (!client.user) {
                    this.logger.warn(`User not defined after authentication for connection ${client.id}`);
                    client.disconnect();
                    return;
                }
                const user = client.user.email || client.user.sub;
                this.connectedClients.set(user, client);
                this.messageRateLimit.set(user, 0);
                this.logger.log(`Client connected: ${user} (${client.connectionId})`);
                this.logger.log(`Total active connections: ${this.metrics.activeConnections}`);
                this.afterConnect(client);
            });
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Connection error: ${error.message}`, error.stack);
            }
            else {
                this.logger.error('Connection error: Unknown error');
            }
            client.disconnect();
        }
    }
    // Add to BaseGateway class
    async handleShutdown() {
        this.logger.log(`Gateway ${this.constructor.name} shutting down gracefully`);
        // Send disconnect warning to all clients
        this.broadcast('server_shutdown', {
            message: 'Server is shutting down for maintenance',
            reconnectIn: 10000 // ms
        });
        // Wait to allow clients to process the message
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Close all connections
        this.connectedClients.forEach((client) => {
            client.disconnect(true);
        });
        // Clear data structures
        this.connectedClients.clear();
        this.userRooms.clear();
        this.messageRateLimit.clear();
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
    }
    validatePayload(payload, schema) {
        try {
            return (0, class_transformer_1.plainToClass)(schema, payload, { excludeExtraneousValues: true });
        }
        catch (error) {
            throw new websockets_1.WsException('Invalid payload format');
        }
    }
    addMiddleware(middleware) {
        this.middlewares.push(middleware);
    }
    applyMiddlewares(client, callback) {
        let index = 0;
        const next = (err) => {
            if (err)
                return callback(err);
            if (index >= this.middlewares.length)
                return callback();
            const middleware = this.middlewares[index++];
            try {
                middleware(client, next);
            }
            catch (error) {
                next(error instanceof Error ? error : new Error('Middleware error'));
            }
        };
        next();
    }
    handleDisconnect(client) {
        try {
            this.metrics.activeConnections--;
            if (!client.user || !client.user.sub || !client.user.email) {
                return;
            }
            const user = client.user.email || client.user.sub;
            // Clean up resources
            this.connectedClients.delete(user);
            this.messageRateLimit.delete(user);
            // Leave all rooms
            const rooms = this.userRooms.get(user);
            if (rooms) {
                rooms.forEach(room => {
                    client.leave(room);
                });
                this.userRooms.delete(user);
            }
            this.logger.log(`Client disconnected: ${user} (${client.connectionId})`);
            this.logger.log(`Total active connections: ${this.metrics.activeConnections}`);
            this.afterDisconnect(client);
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Disconnect error: ${error.message}`, error.stack);
            }
            else {
                this.logger.error('Disconnect error: Unknown error');
            }
        }
    }
    // A centralized error handler
    handleError(context, error, client) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : undefined;
        this.logger.error(`${context}: ${errorMessage}`, stack);
        if (client) {
            client.emit('error', {
                message: 'An error occurred',
                code: 'INTERNAL_ERROR',
                context
            });
        }
    }
    // Authentication - override this in derived classes for specific auth logic
    async authenticateClient(client) {
        try {
            const token = this.extractTokenFromSocket(client);
            if (!token) {
                this.logger.debug('No token provided');
                return false;
            }
            // Verify token hasn't expired
            const payload = await this.jwtService.verifyToken(token);
            // Check token expiration with buffer time to avoid edge cases
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp - this.AUTH_TOKEN_EXPIRY_BUFFER < currentTime) {
                this.logger.debug(`Token expiring soon: ${payload.exp - currentTime}s remaining`);
            }
            // Find and verify the user exists and is active
            const user = await this.usersService.findOneBy({
                id: payload.sub
            });
            if (!user) {
                this.logger.debug(`User not found or inactive: ${payload.sub}`);
                return false;
            }
            // Store minimal user data on socket
            client.user = payload;
            // Track connection with timestamp
            client.connectionId = `${user.id}-${Date.now()}`;
            client.handshake.auth.connectedAt = Date.now();
            return true;
        }
        catch (error) {
            this.handleError('Authentication', error);
            return false;
        }
    }
    // Helper method to extract token from socket connection
    extractTokenFromSocket(client) {
        const origin = client.handshake.headers.origin;
        // log origin
        // const allowedOrigins = this.configService.get<string[]>('cors.origins', []);
        // if (!origin || !allowedOrigins.includes(origin)) {
        //     this.logger.warn(`Connection attempt from unauthorized origin: ${origin}`);
        //     return null;
        // }
        // Try to get from handshake auth
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        // Try to get from query parameters
        const { token } = client.handshake.query;
        if (token && typeof token === 'string') {
            return token;
        }
        return null;
    }
    // Room management
    joinRoom(client, room) {
        try {
            client.join(room);
            if (!client.user) {
                throw new websockets_1.WsException('User not authenticated');
            }
            const user = client.user.email || client.user.sub;
            if (!this.userRooms.has(user)) {
                this.userRooms.set(user, new Set());
            }
            const userRoomSet = this.userRooms.get(user);
            userRoomSet.add(room);
            this.logger.debug(`${user} joined room: ${room}`);
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error joining room: ${error.message}`, error.stack);
                throw new websockets_1.WsException(`Failed to join room: ${error.message}`);
            }
            else {
                this.logger.error('Error joining room: Unknown error');
                throw new websockets_1.WsException('Failed to join room: Unknown error');
            }
        }
    }
    leaveRoom(client, room) {
        try {
            client.leave(room);
            if (!client.user) {
                throw new websockets_1.WsException('User not authenticated');
            }
            const user = client.user.email || client.user.sub;
            const rooms = this.userRooms.get(user);
            if (rooms) {
                rooms.delete(room);
            }
            this.logger.debug(`User ${user} left room: ${room}`);
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error leaving room: ${error.message}`, error.stack);
                throw new websockets_1.WsException(`Failed to leave room: ${error.message}`);
            }
            else {
                this.logger.error('Error leaving room: Unknown error');
                throw new websockets_1.WsException('Failed to leave room: Unknown error');
            }
        }
    }
    // Messaging methods
    emitToUser(userId, event, data) {
        try {
            const client = this.connectedClients.get(userId);
            if (!client) {
                return false;
            }
            client.emit(event, data);
            return true;
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error emitting to user: ${error.message}`, error.stack);
            }
            else {
                this.logger.error('Error emitting to user: Unknown error');
            }
            return false;
        }
    }
    emitToRoom(room, event, data) {
        try {
            this.server.to(room).emit(event, data);
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error emitting to room: ${error.message}`, error.stack);
                throw new websockets_1.WsException(`Failed to emit to room: ${error.message}`);
            }
            else {
                this.logger.error('Error emitting to room: Unknown error');
                throw new websockets_1.WsException('Failed to emit to room: Unknown error');
            }
        }
    }
    broadcast(event, data, exceptUser) {
        try {
            if (exceptUser) {
                // Send to all clients except the one with exceptUserId
                for (const [userId, client] of this.connectedClients.entries()) {
                    if (userId !== exceptUser) {
                        client.emit(event, data);
                    }
                }
            }
            else {
                // Send to all clients
                this.server.emit(event, data);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error broadcasting: ${error.message}`, error.stack);
                throw new websockets_1.WsException(`Failed to broadcast: ${error.message}`);
            }
            else {
                this.logger.error('Error broadcasting: Unknown error');
                throw new websockets_1.WsException('Failed to broadcast: Unknown error');
            }
        }
    }
    // Rate limiting
    isRateLimited(userId) {
        const currentRate = this.messageRateLimit.get(userId) || 0;
        if (currentRate >= this.MAX_MESSAGES_PER_MINUTE) {
            return true;
        }
        this.messageRateLimit.set(userId, currentRate + 1);
        return false;
    }
    // Heartbeat management
    setupHeartbeat() {
        // Reset rate limits every minute
        this.heartbeatInterval = setInterval(() => {
            this.messageRateLimit.clear();
            // Check for stale connections
            this.checkConnections();
        }, 60000); // 1 minute
    }
    checkConnections() {
        const now = Date.now();
        // Check each connection for activity
        this.connectedClients.forEach((client, user) => {
            if (!client.connected) {
                this.logger.debug(`Removing disconnected client: ${user}`);
                this.connectedClients.delete(user);
                return;
            }
            // Check for timeout (no activity for X minutes)
            const connectedAt = client.handshake.auth.connectedAt || 0;
            if (now - connectedAt > this.CONNECTION_TIMEOUT) {
                this.logger.debug(`Connection timeout for user: ${user}`);
                client.disconnect(true);
                this.connectedClients.delete(user);
            }
        });
    }
    // Event handling setup
    setupEventHandlers() {
        this.server.on('connection', (socket) => {
            // Register all event handlers from the derived class
            if (this.eventHandlers) {
                this.eventHandlers.forEach((handler, event) => {
                    socket.on(event, (payload) => {
                        try {
                            // Validate user is authenticated
                            if (!socket.user || !socket.user.sub) {
                                socket.emit('error', { message: 'Not authenticated' });
                                return;
                            }
                            // Check rate limiting
                            if (this.isRateLimited(socket.user.sub)) {
                                socket.emit('error', { message: 'Rate limit exceeded' });
                                return;
                            }
                            // Execute the handler
                            handler(socket, payload);
                        }
                        catch (error) {
                            if (error instanceof Error) {
                                this.logger.error(`Error handling event ${event}: ${error.message}`, error.stack);
                            }
                            else {
                                this.logger.error(`Error handling event ${event}: Unknown error`);
                            }
                            socket.emit('error', { message: 'Internal server error' });
                        }
                    });
                });
            }
        });
    }
    // Hooks for derived classes
    afterConnect(client) { }
    afterDisconnect(client) { }
}
exports.BaseGateway = BaseGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_a = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _a : Object)
], BaseGateway.prototype, "server", void 0);


/***/ }),
/* 191 */
/***/ ((module) => {

module.exports = require("@nestjs/websockets");

/***/ }),
/* 192 */
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),
/* 193 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationsService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const notification_entity_1 = __webpack_require__(47);
let NotificationsService = NotificationsService_1 = class NotificationsService extends base_service_1.BaseService {
    constructor(notificationRepo, usersService) {
        super(notificationRepo, usersService);
        this.notificationRepo = notificationRepo;
        this.usersService = usersService;
        this.notificationLogger = new common_1.Logger(NotificationsService_1.name);
    }
    async countUnreadByUser(userId) {
        throw new common_1.NotImplementedException('Method not implemented');
    }
    async markAsRead(notificationId, userId) {
        await this.update(notificationId, {
            read: true,
            readAt: new Date()
        }, userId);
    }
    async markAllAsRead(userId) {
        throw new common_1.NotImplementedException('Method not implemented');
    }
    async createBulkNotifications(dto) {
        throw new common_1.NotImplementedException('Method not implemented');
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], NotificationsService);


/***/ }),
/* 194 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationManagementModule = void 0;
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(13);
const users_module_1 = __webpack_require__(12);
const branches_module_1 = __webpack_require__(195);
const departments_module_1 = __webpack_require__(199);
const organization_entity_1 = __webpack_require__(37);
const organizations_controller_1 = __webpack_require__(203);
const organizations_service_1 = __webpack_require__(205);
let OrganizationManagementModule = class OrganizationManagementModule {
};
exports.OrganizationManagementModule = OrganizationManagementModule;
exports.OrganizationManagementModule = OrganizationManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([organization_entity_1.Organization]),
            users_module_1.UsersModule,
            branches_module_1.BranchesModule,
            departments_module_1.DepartmentsModule,
            core_1.RouterModule.register([
                {
                    path: 'organizations',
                    module: OrganizationManagementModule,
                    children: [
                        {
                            path: 'branches',
                            module: branches_module_1.BranchesModule,
                            children: [
                                {
                                    path: 'departments',
                                    module: departments_module_1.DepartmentsModule
                                }
                            ],
                        }
                    ]
                },
            ]),
        ],
        providers: [organizations_service_1.OrganizationsService],
        exports: [
            organizations_service_1.OrganizationsService,
            branches_module_1.BranchesModule,
            departments_module_1.DepartmentsModule,
        ],
        controllers: [organizations_controller_1.OrganizationsController],
    })
], OrganizationManagementModule);


/***/ }),
/* 195 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BranchesModule = void 0;
const users_module_1 = __webpack_require__(12);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const branches_controller_1 = __webpack_require__(196);
const branches_service_1 = __webpack_require__(197);
const departments_module_1 = __webpack_require__(199);
const branch_entity_1 = __webpack_require__(38);
let BranchesModule = class BranchesModule {
};
exports.BranchesModule = BranchesModule;
exports.BranchesModule = BranchesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([branch_entity_1.Branch]),
            departments_module_1.DepartmentsModule, users_module_1.UsersModule],
        controllers: [branches_controller_1.BranchesController],
        providers: [branches_service_1.BranchesService],
        exports: [branches_service_1.BranchesService, departments_module_1.DepartmentsModule],
    })
], BranchesModule);


/***/ }),
/* 196 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BranchesController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const branches_service_1 = __webpack_require__(197);
const branch_dto_1 = __webpack_require__(198);
class BranchesController extends (0, create_controller_factory_1.createController)('Branches', branches_service_1.BranchesService, branch_dto_1.GetBranchDto, branch_dto_1.BranchDto, branch_dto_1.UpdateBranchDto) {
}
exports.BranchesController = BranchesController;


/***/ }),
/* 197 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BranchesService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const branch_entity_1 = __webpack_require__(38);
let BranchesService = class BranchesService extends base_service_1.BaseService {
    constructor(branchesRepository, usersService) {
        super(branchesRepository, usersService);
        this.branchesRepository = branchesRepository;
        this.usersService = usersService;
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(branch_entity_1.Branch)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], BranchesService);


/***/ }),
/* 198 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetBranchDto = exports.UpdateBranchDto = exports.BranchDto = void 0;
const create_get_dto_factory_1 = __webpack_require__(80);
const address_dto_1 = __webpack_require__(82);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
class BranchDto {
}
exports.BranchDto = BranchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Organization ID associated with the branch' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], BranchDto.prototype, "organizationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The name of the branch',
        example: 'Acme Corporation',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], BranchDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description of the branch',
        example: 'Leading provider of innovative solutions',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], BranchDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL or path to the branch logo',
        example: 'https://example.com/logo.png',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BranchDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique alias/slug for the branch',
        example: 'acme-corp',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], BranchDto.prototype, "alias", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Address information', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => address_dto_1.AddressDto),
    __metadata("design:type", typeof (_a = typeof address_dto_1.AddressDto !== "undefined" && address_dto_1.AddressDto) === "function" ? _a : Object)
], BranchDto.prototype, "address", void 0);
class UpdateBranchDto extends (0, swagger_1.PartialType)(BranchDto) {
}
exports.UpdateBranchDto = UpdateBranchDto;
class GetBranchDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateBranchDto, 'branch') {
}
exports.GetBranchDto = GetBranchDto;


/***/ }),
/* 199 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DepartmentsModule = void 0;
const users_module_1 = __webpack_require__(12);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const departments_controller_1 = __webpack_require__(200);
const departments_service_1 = __webpack_require__(201);
const department_entity_1 = __webpack_require__(35);
let DepartmentsModule = class DepartmentsModule {
};
exports.DepartmentsModule = DepartmentsModule;
exports.DepartmentsModule = DepartmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([department_entity_1.Department]),
            users_module_1.UsersModule,
        ],
        providers: [departments_service_1.DepartmentsService],
        controllers: [departments_controller_1.DepartmentsController],
        exports: [departments_service_1.DepartmentsService],
    })
], DepartmentsModule);


/***/ }),
/* 200 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DepartmentsController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const departments_service_1 = __webpack_require__(201);
const department_dto_1 = __webpack_require__(202);
class DepartmentsController extends (0, create_controller_factory_1.createController)('Departments', // Entity name for Swagger documentation
departments_service_1.DepartmentsService, // The service handling Department-related operations
department_dto_1.GetDepartmentDto, // DTO for retrieving departments
department_dto_1.DepartmentDto, // DTO for creating departments
department_dto_1.UpdateDepartmentDto // DTO for updating departments
) {
}
exports.DepartmentsController = DepartmentsController;


/***/ }),
/* 201 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DepartmentsService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const department_entity_1 = __webpack_require__(35);
let DepartmentsService = class DepartmentsService extends base_service_1.BaseService {
    constructor(departmentsRepository, usersService) {
        super(departmentsRepository, usersService);
        this.departmentsRepository = departmentsRepository;
        this.usersService = usersService;
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], DepartmentsService);


/***/ }),
/* 202 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetDepartmentDto = exports.UpdateDepartmentDto = exports.DepartmentDto = void 0;
const create_get_dto_factory_1 = __webpack_require__(80);
const address_dto_1 = __webpack_require__(82);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
class DepartmentDto {
}
exports.DepartmentDto = DepartmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Branch ID associated with the branch' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DepartmentDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The name of the Department',
        example: 'Acme Corporation',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], DepartmentDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description of the Department',
        example: 'Leading provider of innovative solutions',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], DepartmentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL or path to the Department logo',
        example: 'https://example.com/logo.png',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DepartmentDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique alias/slug for the Department',
        example: 'acme-corp',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], DepartmentDto.prototype, "alias", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Address information', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => address_dto_1.AddressDto),
    __metadata("design:type", typeof (_a = typeof address_dto_1.AddressDto !== "undefined" && address_dto_1.AddressDto) === "function" ? _a : Object)
], DepartmentDto.prototype, "address", void 0);
class UpdateDepartmentDto extends (0, swagger_1.PartialType)(DepartmentDto) {
}
exports.UpdateDepartmentDto = UpdateDepartmentDto;
class GetDepartmentDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateDepartmentDto, 'department') {
}
exports.GetDepartmentDto = GetDepartmentDto;


/***/ }),
/* 203 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationsController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const organization_dto_1 = __webpack_require__(204);
const organizations_service_1 = __webpack_require__(205);
class OrganizationsController extends (0, create_controller_factory_1.createController)('Organizations', organizations_service_1.OrganizationsService, organization_dto_1.GetOrganizationDto, organization_dto_1.OrganizationDto, organization_dto_1.UpdateOrganizationDto) {
}
exports.OrganizationsController = OrganizationsController;


/***/ }),
/* 204 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetOrganizationDto = exports.UpdateOrganizationDto = exports.OrganizationDto = void 0;
const create_get_dto_factory_1 = __webpack_require__(80);
const address_dto_1 = __webpack_require__(82);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
class OrganizationDto {
}
exports.OrganizationDto = OrganizationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The name of the organization',
        example: 'Acme Corporation',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], OrganizationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description of the organization',
        example: 'Leading provider of innovative solutions',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], OrganizationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL or path to the organization logo',
        example: 'https://example.com/logo.png',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OrganizationDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique alias/slug for the organization',
        example: 'acme-corp',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], OrganizationDto.prototype, "alias", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Address information', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => address_dto_1.AddressDto),
    __metadata("design:type", typeof (_a = typeof address_dto_1.AddressDto !== "undefined" && address_dto_1.AddressDto) === "function" ? _a : Object)
], OrganizationDto.prototype, "address", void 0);
class UpdateOrganizationDto extends (0, swagger_1.PartialType)(OrganizationDto) {
}
exports.UpdateOrganizationDto = UpdateOrganizationDto;
class GetOrganizationDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateOrganizationDto, 'organization') {
}
exports.GetOrganizationDto = GetOrganizationDto;


/***/ }),
/* 205 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationsService = void 0;
const base_service_1 = __webpack_require__(64);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const users_service_1 = __webpack_require__(63);
const organization_entity_1 = __webpack_require__(37);
let OrganizationsService = class OrganizationsService extends base_service_1.BaseService {
    constructor(organizationsRepository, usersService) {
        super(organizationsRepository, usersService);
        this.organizationsRepository = organizationsRepository;
        this.usersService = usersService;
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], OrganizationsService);


/***/ }),
/* 206 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PayrollManagementModule = void 0;
const users_module_1 = __webpack_require__(12);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(13);
const payroll_entity_1 = __webpack_require__(207);
const payroll_item_types_module_1 = __webpack_require__(208);
const payroll_items_module_1 = __webpack_require__(212);
const payrolls_controller_1 = __webpack_require__(216);
const payrolls_service_1 = __webpack_require__(218);
let PayrollManagementModule = class PayrollManagementModule {
};
exports.PayrollManagementModule = PayrollManagementModule;
exports.PayrollManagementModule = PayrollManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([payroll_entity_1.Payroll]),
            users_module_1.UsersModule,
            core_1.RouterModule.register([
                {
                    path: 'payrolls',
                    module: PayrollManagementModule,
                    children: [
                        {
                            path: 'payroll-items',
                            module: payroll_items_module_1.PayrollItemsModule
                        },
                        {
                            path: 'payroll-item-types',
                            module: payroll_item_types_module_1.PayrollItemTypesModule
                        }
                    ]
                }
            ]),
            payroll_items_module_1.PayrollItemsModule,
            payroll_item_types_module_1.PayrollItemTypesModule,
        ],
        providers: [payrolls_service_1.PayrollsService],
        exports: [
            payrolls_service_1.PayrollsService,
            payroll_items_module_1.PayrollItemsModule,
            payroll_item_types_module_1.PayrollItemTypesModule,
        ],
        controllers: [payrolls_controller_1.PayrollsController],
    })
], PayrollManagementModule);


/***/ }),
/* 207 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Payroll = void 0;
const base_entity_1 = __webpack_require__(16);
const typeorm_1 = __webpack_require__(17);
let Payroll = class Payroll extends base_entity_1.BaseEntity {
};
exports.Payroll = Payroll;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Payroll.prototype, "name", void 0);
exports.Payroll = Payroll = __decorate([
    (0, typeorm_1.Entity)('payrolls')
], Payroll);


/***/ }),
/* 208 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PayrollItemTypesModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const users_module_1 = __webpack_require__(12);
const payroll_item_types_controller_1 = __webpack_require__(209);
const payroll_item_types_service_1 = __webpack_require__(211);
const payroll_item_type_entity_1 = __webpack_require__(41);
let PayrollItemTypesModule = class PayrollItemTypesModule {
};
exports.PayrollItemTypesModule = PayrollItemTypesModule;
exports.PayrollItemTypesModule = PayrollItemTypesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([payroll_item_type_entity_1.PayrollItemType]),
            users_module_1.UsersModule,
        ],
        providers: [payroll_item_types_service_1.PayrollItemTypesService],
        exports: [payroll_item_types_service_1.PayrollItemTypesService],
        controllers: [payroll_item_types_controller_1.PayrollItemTypesController],
    })
], PayrollItemTypesModule);


/***/ }),
/* 209 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PayrollItemTypesController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const payroll_item_type_dto_1 = __webpack_require__(210);
const payroll_item_types_service_1 = __webpack_require__(211);
class PayrollItemTypesController extends (0, create_controller_factory_1.createController)('PayrollItemTypes', // Entity name for Swagger documentation
payroll_item_types_service_1.PayrollItemTypesService, // The service handling PayrollItemType-related operations
payroll_item_type_dto_1.GetPayrollItemTypeDto, // DTO for retrieving PayrollItemTypes
payroll_item_type_dto_1.PayrollItemTypeDto, // DTO for creating PayrollItemTypes
payroll_item_type_dto_1.UpdatePayrollItemTypeDto) {
}
exports.PayrollItemTypesController = PayrollItemTypesController;


/***/ }),
/* 210 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetPayrollItemTypeDto = exports.UpdatePayrollItemTypeDto = exports.PayrollItemTypeDto = void 0;
const base_dto_1 = __webpack_require__(92);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
const swagger_2 = __webpack_require__(4);
class PayrollItemTypeDto extends (0, swagger_2.PartialType)(base_dto_1.BaseDto) {
}
exports.PayrollItemTypeDto = PayrollItemTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the payroll-item-type' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayrollItemTypeDto.prototype, "name", void 0);
class UpdatePayrollItemTypeDto extends (0, swagger_2.PartialType)(PayrollItemTypeDto) {
}
exports.UpdatePayrollItemTypeDto = UpdatePayrollItemTypeDto;
class GetPayrollItemTypeDto extends (0, create_get_dto_factory_1.createGetDto)(PayrollItemTypeDto) {
}
exports.GetPayrollItemTypeDto = GetPayrollItemTypeDto;


/***/ }),
/* 211 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PayrollItemTypesService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const payroll_item_type_entity_1 = __webpack_require__(41);
let PayrollItemTypesService = class PayrollItemTypesService extends base_service_1.BaseService {
    constructor(payrollItemTypesRepository, usersService) {
        super(payrollItemTypesRepository, usersService);
        this.payrollItemTypesRepository = payrollItemTypesRepository;
        this.usersService = usersService;
    }
};
exports.PayrollItemTypesService = PayrollItemTypesService;
exports.PayrollItemTypesService = PayrollItemTypesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payroll_item_type_entity_1.PayrollItemType)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], PayrollItemTypesService);


/***/ }),
/* 212 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PayrollItemsModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const users_module_1 = __webpack_require__(12);
const payroll_items_controller_1 = __webpack_require__(213);
const payroll_items_service_1 = __webpack_require__(215);
const payroll_item_entity_1 = __webpack_require__(40);
let PayrollItemsModule = class PayrollItemsModule {
};
exports.PayrollItemsModule = PayrollItemsModule;
exports.PayrollItemsModule = PayrollItemsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([payroll_item_entity_1.PayrollItem]),
            users_module_1.UsersModule,
        ],
        providers: [payroll_items_service_1.PayrollItemsService],
        exports: [payroll_items_service_1.PayrollItemsService],
        controllers: [payroll_items_controller_1.PayrollItemsController],
    })
], PayrollItemsModule);


/***/ }),
/* 213 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PayrollItemsController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const payroll_item_dto_1 = __webpack_require__(214);
const payroll_items_service_1 = __webpack_require__(215);
class PayrollItemsController extends (0, create_controller_factory_1.createController)('PayrollItems', // Entity name for Swagger documentation
payroll_items_service_1.PayrollItemsService, // The service handling PayrollItem-related operations
payroll_item_dto_1.GetPayrollItemDto, // DTO for retrieving PayrollItems
payroll_item_dto_1.PayrollItemDto, // DTO for creating PayrollItems
payroll_item_dto_1.UpdatePayrollItemDto) {
}
exports.PayrollItemsController = PayrollItemsController;


/***/ }),
/* 214 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetPayrollItemDto = exports.UpdatePayrollItemDto = exports.PayrollItemDto = void 0;
const base_dto_1 = __webpack_require__(92);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
const swagger_2 = __webpack_require__(4);
class PayrollItemDto extends (0, swagger_2.PartialType)(base_dto_1.BaseDto) {
}
exports.PayrollItemDto = PayrollItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the payroll-item' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayrollItemDto.prototype, "name", void 0);
class UpdatePayrollItemDto extends (0, swagger_2.PartialType)(PayrollItemDto) {
}
exports.UpdatePayrollItemDto = UpdatePayrollItemDto;
class GetPayrollItemDto extends (0, create_get_dto_factory_1.createGetDto)(PayrollItemDto) {
}
exports.GetPayrollItemDto = GetPayrollItemDto;


/***/ }),
/* 215 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PayrollItemsService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const payroll_item_entity_1 = __webpack_require__(40);
let PayrollItemsService = class PayrollItemsService extends base_service_1.BaseService {
    constructor(payrollItemsRepository, usersService) {
        super(payrollItemsRepository, usersService);
        this.payrollItemsRepository = payrollItemsRepository;
        this.usersService = usersService;
    }
};
exports.PayrollItemsService = PayrollItemsService;
exports.PayrollItemsService = PayrollItemsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payroll_item_entity_1.PayrollItem)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], PayrollItemsService);


/***/ }),
/* 216 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PayrollsController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const payroll_dto_1 = __webpack_require__(217);
const payrolls_service_1 = __webpack_require__(218);
class PayrollsController extends (0, create_controller_factory_1.createController)('Payrolls', // Entity name for Swagger documentation
payrolls_service_1.PayrollsService, // The service handling Payroll-related operations
payroll_dto_1.GetPayrollDto, // DTO for retrieving Payrolls
payroll_dto_1.PayrollDto, // DTO for creating Payrolls
payroll_dto_1.UpdatePayrollDto) {
}
exports.PayrollsController = PayrollsController;


/***/ }),
/* 217 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetPayrollDto = exports.UpdatePayrollDto = exports.PayrollDto = void 0;
const base_dto_1 = __webpack_require__(92);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
const swagger_2 = __webpack_require__(4);
class PayrollDto extends (0, swagger_2.PartialType)(base_dto_1.BaseDto) {
}
exports.PayrollDto = PayrollDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the payroll' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayrollDto.prototype, "name", void 0);
class UpdatePayrollDto extends (0, swagger_2.PartialType)(PayrollDto) {
}
exports.UpdatePayrollDto = UpdatePayrollDto;
class GetPayrollDto extends (0, create_get_dto_factory_1.createGetDto)(PayrollDto) {
}
exports.GetPayrollDto = GetPayrollDto;


/***/ }),
/* 218 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PayrollsService = void 0;
const payroll_item_category_enum_1 = __webpack_require__(42);
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const mathjs_1 = __webpack_require__(219);
const typeorm_2 = __webpack_require__(17);
const payroll_entity_1 = __webpack_require__(207);
let PayrollsService = class PayrollsService extends base_service_1.BaseService {
    constructor(payrollsRepository, usersService) {
        super(payrollsRepository, usersService);
        this.payrollsRepository = payrollsRepository;
        this.usersService = usersService;
    }
    async evaluateFormula(employee, item, grossPay) {
        const formula = item.payrollItemType.computationFormula;
        const scope = {
            'Employee.MonthlyRate': Number(employee.monthlyRate),
            'Employee.DailyRate': employee.dailyRate,
        };
        if (item.parameters) {
            for (const key in item.parameters) {
                scope[`Parameters.${key}`] = item.parameters[key];
            }
        }
        if (grossPay !== undefined) {
            scope['GrossPay'] = grossPay;
        }
        try {
            const result = (0, mathjs_1.evaluate)(formula, scope);
            return Number(result);
        }
        catch (err) {
            console.error(`Error evaluating formula: ${formula}`, err);
            return 0;
        }
    }
    async processPayroll(employee) {
        const items = employee.payrollItems.filter((i) => i.isActive);
        let totalCompensations = 0;
        let totalBenefits = 0;
        let totalDeductions = 0;
        for (const item of items.filter((i) => i.payrollItemType.category === payroll_item_category_enum_1.PayrollItemCategory.COMPENSATION)) {
            item.amount = await this.evaluateFormula(employee, item);
            totalCompensations += item.amount;
        }
        const grossPay = totalCompensations;
        for (const item of items.filter((i) => i.payrollItemType.category === payroll_item_category_enum_1.PayrollItemCategory.BENEFIT)) {
            item.amount = await this.evaluateFormula(employee, item);
            totalBenefits += item.amount;
        }
        for (const item of items.filter((i) => i.payrollItemType.category === payroll_item_category_enum_1.PayrollItemCategory.DEDUCTION)) {
            item.amount = await this.evaluateFormula(employee, item, grossPay);
            totalDeductions += item.amount;
        }
        const netPay = grossPay + totalBenefits - totalDeductions;
        return {
            employeeId: employee.id,
            grossPay,
            totalBenefits,
            totalDeductions,
            netPay,
            processedItems: items,
        };
    }
};
exports.PayrollsService = PayrollsService;
exports.PayrollsService = PayrollsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payroll_entity_1.Payroll)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], PayrollsService);


/***/ }),
/* 219 */
/***/ ((module) => {

module.exports = require("mathjs");

/***/ }),
/* 220 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleManagementModule = void 0;
const users_module_1 = __webpack_require__(12);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(13);
const schedule_entity_1 = __webpack_require__(21);
const groups_module_1 = __webpack_require__(221);
const holidays_module_1 = __webpack_require__(225);
const schedule_change_requests_module_1 = __webpack_require__(229);
const schedule_change_responses_module_1 = __webpack_require__(233);
const schedules_controller_1 = __webpack_require__(237);
const schedules_service_1 = __webpack_require__(239);
const default_shift_seeder_service_1 = __webpack_require__(240);
const shifts_module_1 = __webpack_require__(243);
let ScheduleManagementModule = class ScheduleManagementModule {
};
exports.ScheduleManagementModule = ScheduleManagementModule;
exports.ScheduleManagementModule = ScheduleManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([schedule_entity_1.Schedule]),
            users_module_1.UsersModule,
            core_1.RouterModule.register([
                {
                    path: 'schedules',
                    module: ScheduleManagementModule,
                    children: [
                        {
                            path: 'groups',
                            module: groups_module_1.GroupsModule
                        },
                        {
                            path: 'shifts',
                            module: shifts_module_1.ShiftsModule
                        },
                        {
                            path: 'holidays',
                            module: holidays_module_1.HolidaysModule
                        },
                        {
                            path: 'schedule-change-requests',
                            module: schedule_change_requests_module_1.ScheduleChangeRequestsModule,
                            children: [
                                {
                                    path: 'schedule-change-responses',
                                    module: schedule_change_responses_module_1.ScheduleChangeResponsesModule,
                                }
                            ]
                        }
                    ]
                }
            ]),
            groups_module_1.GroupsModule,
            shifts_module_1.ShiftsModule,
            holidays_module_1.HolidaysModule,
            schedule_change_requests_module_1.ScheduleChangeRequestsModule,
            schedule_change_responses_module_1.ScheduleChangeResponsesModule,
        ],
        providers: [schedules_service_1.SchedulesService, default_shift_seeder_service_1.DefaultShiftsSeeder],
        exports: [
            schedules_service_1.SchedulesService,
            groups_module_1.GroupsModule,
            shifts_module_1.ShiftsModule,
            holidays_module_1.HolidaysModule,
            schedule_change_requests_module_1.ScheduleChangeRequestsModule,
            schedule_change_responses_module_1.ScheduleChangeResponsesModule,
        ],
        controllers: [schedules_controller_1.SchedulesController],
    })
], ScheduleManagementModule);


/***/ }),
/* 221 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GroupsModule = void 0;
const users_module_1 = __webpack_require__(12);
const employee_management_module_1 = __webpack_require__(89);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const group_entity_1 = __webpack_require__(26);
const groups_controller_1 = __webpack_require__(222);
const groups_service_1 = __webpack_require__(224);
let GroupsModule = class GroupsModule {
};
exports.GroupsModule = GroupsModule;
exports.GroupsModule = GroupsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([group_entity_1.Group]),
            users_module_1.UsersModule,
            employee_management_module_1.EmployeeManagementModule,
        ],
        providers: [groups_service_1.GroupsService],
        exports: [groups_service_1.GroupsService],
        controllers: [groups_controller_1.GroupsController],
    })
], GroupsModule);


/***/ }),
/* 222 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GroupsController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const group_dto_1 = __webpack_require__(223);
const groups_service_1 = __webpack_require__(224);
class GroupsController extends (0, create_controller_factory_1.createController)('Groups', // Entity name for Swagger documentation
groups_service_1.GroupsService, // The service handling Group-related operations
group_dto_1.GetGroupDto, // DTO for retrieving Groups
group_dto_1.GroupDto, // DTO for creating Groups
group_dto_1.UpdateGroupDto) {
}
exports.GroupsController = GroupsController;


/***/ }),
/* 223 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetGroupDto = exports.UpdateGroupDto = exports.GroupDto = void 0;
const base_dto_1 = __webpack_require__(92);
const reference_dto_1 = __webpack_require__(93);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
class GroupDto extends (0, swagger_1.PartialType)(base_dto_1.BaseDto) {
}
exports.GroupDto = GroupDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the group',
        example: 'Morning Shift Team'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the group',
        example: 'Team responsible for morning operations',
        required: false,
        nullable: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the shift this group is assigned to',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GroupDto.prototype, "shiftId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Employees assigned to this group',
        type: [reference_dto_1.ReferenceDto]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => reference_dto_1.ReferenceDto),
    __metadata("design:type", Array)
], GroupDto.prototype, "employees", void 0);
class UpdateGroupDto extends (0, swagger_1.PartialType)(GroupDto) {
}
exports.UpdateGroupDto = UpdateGroupDto;
class GetGroupDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateGroupDto, "group") {
}
exports.GetGroupDto = GetGroupDto;


/***/ }),
/* 224 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GroupsService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const employees_service_1 = __webpack_require__(94);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const group_entity_1 = __webpack_require__(26);
let GroupsService = class GroupsService extends base_service_1.BaseService {
    constructor(groupsRepository, usersService, employeesService) {
        super(groupsRepository, usersService);
        this.groupsRepository = groupsRepository;
        this.usersService = usersService;
        this.employeesService = employeesService;
    }
    async create(createDto, createdBy) {
        // Extract employee references before creating the group
        const employeeRefs = createDto.employees;
        delete createDto.employees; // Remove from the DTO to avoid TypeORM trying to create new employees
        // Create the group first (without employees)
        const group = await super.create(createDto, createdBy);
        // If employee references exist, handle the relationship
        if (employeeRefs && employeeRefs.length > 0) {
            // Find all the employees by their IDs
            const employeeIds = employeeRefs.map(ref => ref.id);
            const employees = await this.employeesService.getRepository().findBy({
                id: (0, typeorm_2.In)(employeeIds)
            });
            // Update each employee with the new group
            if (employees.length > 0) {
                await this.employeesService.getRepository().update({ id: (0, typeorm_2.In)(employeeIds) }, { group: { id: group.id } });
            }
        }
        // Return the created group with employees loaded
        return this.findOneByOrFail({ id: group.id }, { relations: { employees: true } });
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object, typeof (_c = typeof employees_service_1.EmployeesService !== "undefined" && employees_service_1.EmployeesService) === "function" ? _c : Object])
], GroupsService);


/***/ }),
/* 225 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HolidaysModule = void 0;
const users_module_1 = __webpack_require__(12);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const holiday_entity_1 = __webpack_require__(23);
const holidays_controller_1 = __webpack_require__(226);
const holidays_service_1 = __webpack_require__(228);
let HolidaysModule = class HolidaysModule {
};
exports.HolidaysModule = HolidaysModule;
exports.HolidaysModule = HolidaysModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([holiday_entity_1.Holiday]),
            users_module_1.UsersModule,
        ],
        providers: [holidays_service_1.HolidaysService],
        exports: [holidays_service_1.HolidaysService],
        controllers: [holidays_controller_1.HolidaysController],
    })
], HolidaysModule);


/***/ }),
/* 226 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HolidaysController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const holiday_dto_1 = __webpack_require__(227);
const holidays_service_1 = __webpack_require__(228);
class HolidaysController extends (0, create_controller_factory_1.createController)('Holidays', // Entity name for Swagger documentation
holidays_service_1.HolidaysService, // The service handling Holiday-related operations
holiday_dto_1.GetHolidayDto, // DTO for retrieving Holidays
holiday_dto_1.HolidayDto, // DTO for creating Holidays
holiday_dto_1.UpdateHolidayDto) {
}
exports.HolidaysController = HolidaysController;


/***/ }),
/* 227 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetHolidayDto = exports.UpdateHolidayDto = exports.CreateHolidayDto = exports.HolidayDto = void 0;
const base_dto_1 = __webpack_require__(92);
const holiday_type_enum_1 = __webpack_require__(24);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
class HolidayDto extends (0, swagger_1.PartialType)(base_dto_1.BaseDto) {
}
exports.HolidayDto = HolidayDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the holiday',
        example: 'Christmas Day'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HolidayDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the holiday',
        example: 'Annual celebration on December 25th',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HolidayDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of holiday',
        enum: holiday_type_enum_1.HolidayType,
        enumName: 'HolidayType',
        example: Object.values(holiday_type_enum_1.HolidayType)[0]
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(holiday_type_enum_1.HolidayType, { message: 'Type must be a valid holiday type' }),
    __metadata("design:type", typeof (_a = typeof holiday_type_enum_1.HolidayType !== "undefined" && holiday_type_enum_1.HolidayType) === "function" ? _a : Object)
], HolidayDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the associated schedule',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(4, { message: 'Schedule ID must be a valid UUID' }),
    __metadata("design:type", String)
], HolidayDto.prototype, "scheduleId", void 0);
class CreateHolidayDto extends HolidayDto {
}
exports.CreateHolidayDto = CreateHolidayDto;
class UpdateHolidayDto extends (0, swagger_1.PartialType)(HolidayDto) {
}
exports.UpdateHolidayDto = UpdateHolidayDto;
class GetHolidayDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateHolidayDto, 'holiday') {
}
exports.GetHolidayDto = GetHolidayDto;


/***/ }),
/* 228 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HolidaysService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const holiday_entity_1 = __webpack_require__(23);
let HolidaysService = class HolidaysService extends base_service_1.BaseService {
    constructor(holidaysRepository, usersService) {
        super(holidaysRepository, usersService);
        this.holidaysRepository = holidaysRepository;
        this.usersService = usersService;
    }
};
exports.HolidaysService = HolidaysService;
exports.HolidaysService = HolidaysService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(holiday_entity_1.Holiday)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], HolidaysService);


/***/ }),
/* 229 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleChangeRequestsModule = void 0;
const users_module_1 = __webpack_require__(12);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const schedule_change_request_entity_1 = __webpack_require__(18);
const schedule_change_requests_controller_1 = __webpack_require__(230);
const schedule_change_requests_service_1 = __webpack_require__(232);
let ScheduleChangeRequestsModule = class ScheduleChangeRequestsModule {
};
exports.ScheduleChangeRequestsModule = ScheduleChangeRequestsModule;
exports.ScheduleChangeRequestsModule = ScheduleChangeRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([schedule_change_request_entity_1.ScheduleChangeRequest]),
            users_module_1.UsersModule,
        ],
        providers: [schedule_change_requests_service_1.ScheduleChangeRequestsService],
        exports: [
            schedule_change_requests_service_1.ScheduleChangeRequestsService,
        ],
        controllers: [schedule_change_requests_controller_1.ScheduleChangeRequestsController],
    })
], ScheduleChangeRequestsModule);


/***/ }),
/* 230 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleChangeRequestsController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const schedule_change_request_dto_1 = __webpack_require__(231);
const schedule_change_requests_service_1 = __webpack_require__(232);
class ScheduleChangeRequestsController extends (0, create_controller_factory_1.createController)('ScheduleChangeRequests', // Entity name for Swagger documentation
schedule_change_requests_service_1.ScheduleChangeRequestsService, // The service handling ScheduleChangeRequest-related operations
schedule_change_request_dto_1.GetScheduleChangeRequestDto, // DTO for retrieving ScheduleChangeRequests
schedule_change_request_dto_1.ScheduleChangeRequestDto, // DTO for creating ScheduleChangeRequests
schedule_change_request_dto_1.UpdateScheduleChangeRequestDto) {
}
exports.ScheduleChangeRequestsController = ScheduleChangeRequestsController;


/***/ }),
/* 231 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetScheduleChangeRequestDto = exports.UpdateScheduleChangeRequestDto = exports.ScheduleChangeRequestDto = void 0;
const base_dto_1 = __webpack_require__(92);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
const swagger_2 = __webpack_require__(4);
class ScheduleChangeRequestDto extends (0, swagger_2.PartialType)(base_dto_1.BaseDto) {
}
exports.ScheduleChangeRequestDto = ScheduleChangeRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the schedule-change-request' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleChangeRequestDto.prototype, "name", void 0);
class UpdateScheduleChangeRequestDto extends (0, swagger_2.PartialType)(ScheduleChangeRequestDto) {
}
exports.UpdateScheduleChangeRequestDto = UpdateScheduleChangeRequestDto;
class GetScheduleChangeRequestDto extends (0, create_get_dto_factory_1.createGetDto)(ScheduleChangeRequestDto) {
}
exports.GetScheduleChangeRequestDto = GetScheduleChangeRequestDto;


/***/ }),
/* 232 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleChangeRequestsService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const schedule_change_request_entity_1 = __webpack_require__(18);
let ScheduleChangeRequestsService = class ScheduleChangeRequestsService extends base_service_1.BaseService {
    constructor(scheduleChangeRequestsRepository, usersService) {
        super(scheduleChangeRequestsRepository, usersService);
        this.scheduleChangeRequestsRepository = scheduleChangeRequestsRepository;
        this.usersService = usersService;
    }
};
exports.ScheduleChangeRequestsService = ScheduleChangeRequestsService;
exports.ScheduleChangeRequestsService = ScheduleChangeRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(schedule_change_request_entity_1.ScheduleChangeRequest)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], ScheduleChangeRequestsService);


/***/ }),
/* 233 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleChangeResponsesModule = void 0;
const users_module_1 = __webpack_require__(12);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const schedule_change_response_entity_1 = __webpack_require__(43);
const schedule_change_responses_controller_1 = __webpack_require__(234);
const schedule_change_responses_service_1 = __webpack_require__(236);
let ScheduleChangeResponsesModule = class ScheduleChangeResponsesModule {
};
exports.ScheduleChangeResponsesModule = ScheduleChangeResponsesModule;
exports.ScheduleChangeResponsesModule = ScheduleChangeResponsesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([schedule_change_response_entity_1.ScheduleChangeResponse]),
            users_module_1.UsersModule,
        ],
        providers: [schedule_change_responses_service_1.ScheduleChangeResponsesService],
        exports: [schedule_change_responses_service_1.ScheduleChangeResponsesService],
        controllers: [schedule_change_responses_controller_1.ScheduleChangeResponsesController],
    })
], ScheduleChangeResponsesModule);


/***/ }),
/* 234 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleChangeResponsesController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const schedule_change_response_dto_1 = __webpack_require__(235);
const schedule_change_responses_service_1 = __webpack_require__(236);
class ScheduleChangeResponsesController extends (0, create_controller_factory_1.createController)('ScheduleChangeResponses', // Entity name for Swagger documentation
schedule_change_responses_service_1.ScheduleChangeResponsesService, // The service handling ScheduleChangeResponse-related operations
schedule_change_response_dto_1.GetScheduleChangeResponseDto, // DTO for retrieving ScheduleChangeResponses
schedule_change_response_dto_1.ScheduleChangeResponseDto, // DTO for creating ScheduleChangeResponses
schedule_change_response_dto_1.UpdateScheduleChangeResponseDto) {
}
exports.ScheduleChangeResponsesController = ScheduleChangeResponsesController;


/***/ }),
/* 235 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetScheduleChangeResponseDto = exports.UpdateScheduleChangeResponseDto = exports.ScheduleChangeResponseDto = void 0;
const base_dto_1 = __webpack_require__(92);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
class ScheduleChangeResponseDto extends (0, swagger_1.PartialType)(base_dto_1.BaseDto) {
}
exports.ScheduleChangeResponseDto = ScheduleChangeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the schedule change request is approved',
        example: true
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ScheduleChangeResponseDto.prototype, "approved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response message for the schedule change request',
        example: 'Your schedule change has been approved.'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleChangeResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the associated schedule change request',
        example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ScheduleChangeResponseDto.prototype, "scheduleChangeRequestId", void 0);
class UpdateScheduleChangeResponseDto extends (0, swagger_1.PartialType)(ScheduleChangeResponseDto) {
}
exports.UpdateScheduleChangeResponseDto = UpdateScheduleChangeResponseDto;
class GetScheduleChangeResponseDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateScheduleChangeResponseDto, 'schedule change response') {
}
exports.GetScheduleChangeResponseDto = GetScheduleChangeResponseDto;


/***/ }),
/* 236 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleChangeResponsesService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const schedule_change_response_entity_1 = __webpack_require__(43);
let ScheduleChangeResponsesService = class ScheduleChangeResponsesService extends base_service_1.BaseService {
    constructor(scheduleChangeResponsesRepository, usersService) {
        super(scheduleChangeResponsesRepository, usersService);
        this.scheduleChangeResponsesRepository = scheduleChangeResponsesRepository;
        this.usersService = usersService;
    }
};
exports.ScheduleChangeResponsesService = ScheduleChangeResponsesService;
exports.ScheduleChangeResponsesService = ScheduleChangeResponsesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(schedule_change_response_entity_1.ScheduleChangeResponse)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], ScheduleChangeResponsesService);


/***/ }),
/* 237 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SchedulesController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const schedule_dto_1 = __webpack_require__(238);
const schedules_service_1 = __webpack_require__(239);
class SchedulesController extends (0, create_controller_factory_1.createController)('Schedules', // Entity name for Swagger documentation
schedules_service_1.SchedulesService, // The service handling Schedule-related operations
schedule_dto_1.GetScheduleDto, // DTO for retrieving Schedules
schedule_dto_1.ScheduleDto, // DTO for creating Schedules
schedule_dto_1.UpdateScheduleDto) {
}
exports.SchedulesController = SchedulesController;


/***/ }),
/* 238 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetScheduleDto = exports.UpdateScheduleDto = exports.ScheduleDto = void 0;
const base_dto_1 = __webpack_require__(92);
const schedule_status_1 = __webpack_require__(22);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(58);
class ScheduleDto extends (0, swagger_1.PartialType)(base_dto_1.BaseDto) {
}
exports.ScheduleDto = ScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of the schedule', example: '2023-01-01' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], ScheduleDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes about the schedule', required: false, example: 'Special schedule for holiday season' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status of the schedule',
        enum: schedule_status_1.ScheduleStatus,
        default: schedule_status_1.ScheduleStatus.DEFAULT,
        example: schedule_status_1.ScheduleStatus.DEFAULT
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(schedule_status_1.ScheduleStatus),
    __metadata("design:type", typeof (_b = typeof schedule_status_1.ScheduleStatus !== "undefined" && schedule_status_1.ScheduleStatus) === "function" ? _b : Object)
], ScheduleDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the associated shift', required: true, example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "shiftId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the associated holiday', required: false, example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "holidayId", void 0);
class UpdateScheduleDto extends (0, swagger_1.PartialType)(ScheduleDto) {
}
exports.UpdateScheduleDto = UpdateScheduleDto;
class GetScheduleDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateScheduleDto, 'schedule') {
}
exports.GetScheduleDto = GetScheduleDto;


/***/ }),
/* 239 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SchedulesService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const schedule_entity_1 = __webpack_require__(21);
let SchedulesService = class SchedulesService extends base_service_1.BaseService {
    constructor(schedulesRepository, usersService) {
        super(schedulesRepository, usersService);
        this.schedulesRepository = schedulesRepository;
        this.usersService = usersService;
    }
};
exports.SchedulesService = SchedulesService;
exports.SchedulesService = SchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(schedule_entity_1.Schedule)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], SchedulesService);


/***/ }),
/* 240 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DefaultShiftsSeeder_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultShiftsSeeder = void 0;
const day_enum_1 = __webpack_require__(241);
const common_1 = __webpack_require__(1);
const groups_service_1 = __webpack_require__(224);
const shifts_service_1 = __webpack_require__(242);
let DefaultShiftsSeeder = DefaultShiftsSeeder_1 = class DefaultShiftsSeeder {
    constructor(shiftsService, groupsService) {
        this.shiftsService = shiftsService;
        this.groupsService = groupsService;
        this.logger = new common_1.Logger(DefaultShiftsSeeder_1.name);
    }
    async onModuleInit() {
        await this.seed();
    }
    async seed() {
        this.logger.log('Seeding default shifts and groups...');
        // Check if default shift already exists
        const existingShifts = await this.shiftsService.getRepository().find();
        if (existingShifts.length === 0) {
            // Create default shift
            const defaultShift = await this.shiftsService.create({
                startTime: '09:00:00',
                endTime: '17:00:00',
                breakTime: 60, // 1 hour lunch break
                duration: 8, // 8 hour shift
                days: [day_enum_1.Day.MONDAY, day_enum_1.Day.TUESDAY, day_enum_1.Day.WEDNESDAY, day_enum_1.Day.THURSDAY, day_enum_1.Day.FRIDAY],
            });
            this.logger.log(`Created default shift: ${defaultShift.id}`);
            // Create default group associated with the shift
            const defaultGroup = await this.groupsService.create({
                name: 'Standard Shift Group',
                description: 'Default group working standard office hours',
                shift: defaultShift,
            });
            this.logger.log(`Created default group: ${defaultGroup.id}`);
        }
        else {
            this.logger.log('Default shifts already exist, skipping seeder');
        }
    }
};
exports.DefaultShiftsSeeder = DefaultShiftsSeeder;
exports.DefaultShiftsSeeder = DefaultShiftsSeeder = DefaultShiftsSeeder_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof shifts_service_1.ShiftsService !== "undefined" && shifts_service_1.ShiftsService) === "function" ? _a : Object, typeof (_b = typeof groups_service_1.GroupsService !== "undefined" && groups_service_1.GroupsService) === "function" ? _b : Object])
], DefaultShiftsSeeder);


/***/ }),
/* 241 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Day = void 0;
var Day;
(function (Day) {
    Day["MONDAY"] = "MONDAY";
    Day["TUESDAY"] = "TUESDAY";
    Day["WEDNESDAY"] = "WEDNESDAY";
    Day["THURSDAY"] = "THURSDAY";
    Day["FRIDAY"] = "FRIDAY";
    Day["SATURDAY"] = "SATURDAY";
    Day["SUNDAY"] = "SUNDAY";
})(Day || (exports.Day = Day = {}));


/***/ }),
/* 242 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShiftsService = void 0;
const base_service_1 = __webpack_require__(64);
const users_service_1 = __webpack_require__(63);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(17);
const shift_entity_1 = __webpack_require__(25);
let ShiftsService = class ShiftsService extends base_service_1.BaseService {
    constructor(shiftsRepository, usersService) {
        super(shiftsRepository, usersService);
        this.shiftsRepository = shiftsRepository;
        this.usersService = usersService;
    }
};
exports.ShiftsService = ShiftsService;
exports.ShiftsService = ShiftsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shift_entity_1.Shift)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], ShiftsService);


/***/ }),
/* 243 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShiftsModule = void 0;
const users_module_1 = __webpack_require__(12);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(13);
const shift_entity_1 = __webpack_require__(25);
const shifts_controller_1 = __webpack_require__(244);
const shifts_service_1 = __webpack_require__(242);
let ShiftsModule = class ShiftsModule {
};
exports.ShiftsModule = ShiftsModule;
exports.ShiftsModule = ShiftsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([shift_entity_1.Shift]),
            users_module_1.UsersModule,
        ],
        providers: [shifts_service_1.ShiftsService],
        exports: [shifts_service_1.ShiftsService],
        controllers: [shifts_controller_1.ShiftsController],
    })
], ShiftsModule);


/***/ }),
/* 244 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShiftsController = void 0;
const create_controller_factory_1 = __webpack_require__(52);
const shift_dto_1 = __webpack_require__(245);
const shifts_service_1 = __webpack_require__(242);
class ShiftsController extends (0, create_controller_factory_1.createController)('Shifts', // Entity name for Swagger documentation
shifts_service_1.ShiftsService, // The service handling Shift-related operations
shift_dto_1.GetShiftDto, // DTO for retrieving Shifts
shift_dto_1.ShiftDto, // DTO for creating Shifts
shift_dto_1.UpdateShiftDto) {
}
exports.ShiftsController = ShiftsController;


/***/ }),
/* 245 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetShiftDto = exports.UpdateShiftDto = exports.ShiftDto = void 0;
const is_time_string_decorator_1 = __webpack_require__(246);
const base_dto_1 = __webpack_require__(92);
const day_enum_1 = __webpack_require__(241);
const create_get_dto_factory_1 = __webpack_require__(80);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(57);
const class_validator_1 = __webpack_require__(58);
class ShiftDto extends (0, swagger_1.PartialType)(base_dto_1.BaseDto) {
}
exports.ShiftDto = ShiftDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start time of the shift',
        example: '09:00:00',
        type: String
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, is_time_string_decorator_1.IsTimeString)(),
    __metadata("design:type", String)
], ShiftDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End time of the shift',
        example: '17:00:00',
        type: String
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, is_time_string_decorator_1.IsTimeString)(),
    __metadata("design:type", String)
], ShiftDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Break time in minutes',
        example: 60,
        required: false,
        type: Number
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ShiftDto.prototype, "breakTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Duration of the shift in hours',
        example: 480,
        required: false,
        type: Number
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ShiftDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Days when this shift is active',
        enum: day_enum_1.Day,
        isArray: true,
        example: [day_enum_1.Day.MONDAY, day_enum_1.Day.TUESDAY, day_enum_1.Day.WEDNESDAY]
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(day_enum_1.Day, { each: true }),
    __metadata("design:type", Array)
], ShiftDto.prototype, "days", void 0);
class UpdateShiftDto extends (0, swagger_1.PartialType)(ShiftDto) {
}
exports.UpdateShiftDto = UpdateShiftDto;
class GetShiftDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateShiftDto, 'shift') {
}
exports.GetShiftDto = GetShiftDto;


/***/ }),
/* 246 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IsTimeString = IsTimeString;
const class_validator_1 = __webpack_require__(58);
function IsTimeString(validationOptions) {
    return function (target, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isTimeString',
            target: target.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    if (typeof value !== 'string')
                        return false;
                    // Regular expression to match HH:MM:SS format
                    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
                    return timeRegex.test(value);
                },
                defaultMessage(args) {
                    return `${args.property} must be a valid time string in the format HH:MM:SS`;
                }
            }
        });
    };
}


/***/ }),
/* 247 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpExceptionFilter = void 0;
const common_1 = __webpack_require__(1);
const crypto = __importStar(__webpack_require__(176));
/**
 * HttpExceptionFilter is a global filter that handles all exceptions thrown in the application.
 * It logs the error details, sanitizes sensitive information, and sends a user-friendly response to the client.
 */
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
        this.errorCount = new Map();
        this.SENSITIVE_PATTERNS = [
            /(?:confirm)?password/i,
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
        // Get client IP with fallbacks
        const clientIp = request.socket.remoteAddress ||
            request.ip ||
            'unknown';
        // Track error frequency
        this.trackErrorFrequency(clientIp, status);
        // Prepare client response
        const clientResponse = {
            statusCode: status,
            timestamp,
            traceId,
            path: request.url,
            detail: error.name,
            message: exception instanceof common_1.HttpException
                ? exception.getResponse().message || error.message
                : this.getClientMessage(error.message, status),
        };
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
     * Generates a user-friendly message for the client.
     * @param message - The original error message.
     * @param status - The HTTP status code.
     * @returns The user-friendly message.
     */
    getClientMessage(message, status) {
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


/***/ }),
/* 248 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = void 0;
const common_1 = __webpack_require__(1);
const crypto = __importStar(__webpack_require__(176));
const operators_1 = __webpack_require__(154);
/**
 * LoggingInterceptor is a NestJS interceptor that logs HTTP requests and responses.
 * It also sanitizes sensitive data and adds a correlation ID to each request and response.
 */
let LoggingInterceptor = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger('HTTP');
        this.SENSITIVE_FIELDS = ['password', 'confirmPassword', 'token', 'authorization', 'creditCard'];
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
        const method = request.method;
        const url = request.originalUrl || request.url;
        const userAgent = request.get('user-agent') || '';
        const ip = this.getClientIp(request);
        // Skip logging body for streaming endpoints
        if (url.includes('/stream/') || url.includes('/download/')) {
            this.logger.log(`${method} ${url} ${ip} ${userAgent} [STREAMING]`);
            return next.handle(); // Don't try to log response for streaming
        }
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
        });
        return next.handle().pipe((0, operators_1.tap)((responseBody) => {
            this.logResponse(correlationId, startTime, response.statusCode, responseBody);
        }), (0, operators_1.catchError)((error) => {
            this.logError(correlationId, startTime, error);
            throw error;
        }));
    }
    getClientIp(req) {
        var _a, _b;
        return req.ip ||
            ((_a = req.connection) === null || _a === void 0 ? void 0 : _a.remoteAddress) ||
            ((_b = req.headers['x-forwarded-for']) === null || _b === void 0 ? void 0 : _b.split(',')[0]) ||
            'unknown';
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
            stack: error.stack || 'No stack trace available'
        });
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);


/***/ }),
/* 249 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransformInterceptor = void 0;
const common_1 = __webpack_require__(1);
const class_transformer_1 = __webpack_require__(57);
const operators_1 = __webpack_require__(154);
/**
 * A NestJS interceptor that transforms the response data.
 *
 * This interceptor converts class instances in the response to plain JavaScript objects
 * using the `instanceToPlain` function from class-transformer.
 * It's particularly useful when working with class-transformer decorated entities
 * to ensure proper serialization of response data.
 *
 * @implements {NestInterceptor}
 *
 * @example
 * ```typescript
 * @UseInterceptors(TransformInterceptor)
 * @Get()
 * findAll() {
 *   return this.service.findAll();
 * }
 * ```
 */
let TransformInterceptor = class TransformInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => (0, class_transformer_1.instanceToPlain)(data)));
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], TransformInterceptor);


/***/ }),
/* 250 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.swaggerCustomOptions = exports.swaggerConfig = exports.getLocalIpAddress = void 0;
const config_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(4);
const os_1 = __webpack_require__(251);
// Initialize ConfigService
const configService = new config_1.ConfigService();
// Get local IP address
const getLocalIpAddress = () => {
    var _a;
    const nets = (0, os_1.networkInterfaces)();
    for (const name of Object.keys(nets)) {
        for (const net of (_a = nets[name]) !== null && _a !== void 0 ? _a : []) {
            // Skip over non-IPv4 and internal (loopback) addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost'; // Fallback
};
exports.getLocalIpAddress = getLocalIpAddress;
const localIp = (0, exports.getLocalIpAddress)();
const port = configService.get('PORT') || '3000';
exports.swaggerConfig = new swagger_1.DocumentBuilder()
    .setTitle('Dowinn HR Management System API')
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
    .addServer(configService.getOrThrow('APP_URL'), "Local Development Server")
    .addServer(`http://${localIp}:${port}`, "LAN Development Server") // Use ConfigService to get server URL
    .build();
exports.swaggerCustomOptions = {
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
        csp: false, // This disables Content Security Policy
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


/***/ }),
/* 251 */
/***/ ((module) => {

module.exports = require("os");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	
/******/ })()
;