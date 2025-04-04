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
const compression_1 = __importDefault(__webpack_require__(5));
const express_rate_limit_1 = __importDefault(__webpack_require__(6));
const helmet_1 = __importDefault(__webpack_require__(7));
const morgan_1 = __importDefault(__webpack_require__(8));
const app_module_1 = __webpack_require__(9);
const http_exception_filter_1 = __webpack_require__(174);
const logging_interceptor_1 = __webpack_require__(175);
const transform_interceptor_1 = __webpack_require__(177);
const swagger_config_1 = __webpack_require__(178);
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

module.exports = require("compression");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("express-rate-limit");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("morgan");

/***/ }),
/* 9 */
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
const common_module_1 = __webpack_require__(10);
const config_module_1 = __webpack_require__(65);
const database_module_1 = __webpack_require__(68);
const account_management_module_1 = __webpack_require__(69);
const addresses_module_1 = __webpack_require__(109);
const documents_module_1 = __webpack_require__(111);
const employee_management_module_1 = __webpack_require__(70);
const files_module_1 = __webpack_require__(119);
const logs_module_1 = __webpack_require__(136);
const notifications_module_1 = __webpack_require__(138);
const organization_management_module_1 = __webpack_require__(142);
const schedules_module_1 = __webpack_require__(154);
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
            addresses_module_1.AddressesModule,
            documents_module_1.DocumentsModule,
            schedules_module_1.SchedulesModule,
        ],
        controllers: [],
    })
], AppModule);


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
exports.CommonModule = void 0;
const common_1 = __webpack_require__(1);
const users_module_1 = __webpack_require__(11);
const common_service_1 = __webpack_require__(64);
const transaction_service_1 = __webpack_require__(50);
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
/* 11 */
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
const typeorm_1 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(13);
const users_controller_1 = __webpack_require__(34);
const users_service_1 = __webpack_require__(45);
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
/* 12 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 13 */
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
const document_entity_1 = __webpack_require__(14);
const employee_entity_1 = __webpack_require__(18);
const activity_logs_entity_1 = __webpack_require__(31);
const typeorm_1 = __webpack_require__(16);
const base_entity_1 = __webpack_require__(15);
const profile_entity_1 = __webpack_require__(30);
const session_entity_1 = __webpack_require__(33);
let User = class User extends base_entity_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.emailVerified = false;
        this.phoneNumberVerified = false;
        this.accessFailedCount = 0;
        this.lockoutEnabled = false;
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
    (0, typeorm_1.OneToOne)(() => employee_entity_1.Employee, (employee) => employee.user),
    __metadata("design:type", typeof (_e = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _e : Object)
], User.prototype, "employee", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Document = void 0;
const base_entity_1 = __webpack_require__(15);
const user_entity_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(16);
const document_type_entity_1 = __webpack_require__(17);
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
exports.Document = Document = __decorate([
    (0, typeorm_1.Entity)('documents')
], Document);


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
exports.BaseEntity = void 0;
const typeorm_1 = __webpack_require__(16);
class BaseEntity extends typeorm_1.BaseEntity {
    constructor(item) {
        super();
        this.isDeleted = false;
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
/* 16 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 17 */
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
const base_entity_1 = __webpack_require__(15);
const typeorm_1 = __webpack_require__(16);
const document_entity_1 = __webpack_require__(14);
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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Employee = void 0;
const employment_condition_enum_1 = __webpack_require__(19);
const employment_status_enum_1 = __webpack_require__(20);
const employment_type_enum_1 = __webpack_require__(21);
const base_entity_1 = __webpack_require__(15);
const user_entity_1 = __webpack_require__(13);
const role_entity_1 = __webpack_require__(22);
const typeorm_1 = __webpack_require__(16);
let Employee = class Employee extends base_entity_1.BaseEntity {
    constructor() {
        super(...arguments);
        this.employmentStatus = employment_status_enum_1.EmploymentStatus.PENDING;
        this.employmentCondition = employment_condition_enum_1.EmploymentCondition.PROBATIONARY;
        this.employmentType = employment_type_enum_1.EmploymentType.FULL_TIME;
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
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.employee, { cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }) // Foreign key column
    ,
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
exports.Employee = Employee = __decorate([
    (0, typeorm_1.Entity)('employees')
], Employee);


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmploymentCondition = void 0;
var EmploymentCondition;
(function (EmploymentCondition) {
    EmploymentCondition["PROBATIONARY"] = "probationary";
    EmploymentCondition["REGULAR"] = "regular";
})(EmploymentCondition || (exports.EmploymentCondition = EmploymentCondition = {}));


/***/ }),
/* 20 */
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
/* 21 */
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
/* 22 */
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
const role_scope_type_enum_1 = __webpack_require__(23);
const base_entity_1 = __webpack_require__(15);
const permission_entity_1 = __webpack_require__(24);
const department_entity_1 = __webpack_require__(26);
const branch_entity_1 = __webpack_require__(29);
const organization_entity_1 = __webpack_require__(28);
const typeorm_1 = __webpack_require__(16);
const employee_entity_1 = __webpack_require__(18);
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
/* 23 */
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
/* 24 */
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
const typeorm_1 = __webpack_require__(16);
const action_enum_1 = __webpack_require__(25);
const base_entity_1 = __webpack_require__(15);
const role_entity_1 = __webpack_require__(22);
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
/* 25 */
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Department = void 0;
const base_entity_1 = __webpack_require__(15);
const address_entity_1 = __webpack_require__(27);
const role_entity_1 = __webpack_require__(22);
const typeorm_1 = __webpack_require__(16);
const branch_entity_1 = __webpack_require__(29);
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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Address = void 0;
const base_entity_1 = __webpack_require__(15);
const department_entity_1 = __webpack_require__(26);
const organization_entity_1 = __webpack_require__(28);
const typeorm_1 = __webpack_require__(16);
const profile_entity_1 = __webpack_require__(30);
const branch_entity_1 = __webpack_require__(29);
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
/* 28 */
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
const address_entity_1 = __webpack_require__(27);
const role_entity_1 = __webpack_require__(22);
const typeorm_1 = __webpack_require__(16);
const base_entity_1 = __webpack_require__(15);
const branch_entity_1 = __webpack_require__(29);
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
/* 29 */
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
const base_entity_1 = __webpack_require__(15);
const address_entity_1 = __webpack_require__(27);
const role_entity_1 = __webpack_require__(22);
const typeorm_1 = __webpack_require__(16);
const organization_entity_1 = __webpack_require__(28);
const department_entity_1 = __webpack_require__(26);
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
/* 30 */
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
const base_entity_1 = __webpack_require__(15);
const typeorm_1 = __webpack_require__(16);
const address_entity_1 = __webpack_require__(27);
const user_entity_1 = __webpack_require__(13);
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ActivityLog = void 0;
const action_enum_1 = __webpack_require__(25);
const log_type_enum_1 = __webpack_require__(32);
const base_entity_1 = __webpack_require__(15);
const user_entity_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(16);
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
/* 32 */
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Session = void 0;
const typeorm_1 = __webpack_require__(16);
const base_entity_1 = __webpack_require__(15);
const user_entity_1 = __webpack_require__(13);
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
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const user_dto_1 = __webpack_require__(60);
const users_service_1 = __webpack_require__(45);
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createController = createController;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const pluralize_1 = __webpack_require__(36);
const base_controller_1 = __webpack_require__(37);
const current_user_decorator_1 = __webpack_require__(56);
const override_decorator_1 = __webpack_require__(58);
const base_service_1 = __webpack_require__(46);
function createController(entityName, ServiceClass, getDtoClass, createDtoClass, updateDtoClass) {
    var _a, _b, _c;
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
    };
    __decorate([
        (0, override_decorator_1.Override)(),
        (0, swagger_1.ApiBody)({ type: createDtoClass, description: `${(0, pluralize_1.singular)(entityName)} creation data` }),
        __param(0, (0, common_1.Body)()),
        __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, String]),
        __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
    ], DynamicController.prototype, "create", null);
    __decorate([
        (0, override_decorator_1.Override)(),
        (0, swagger_1.ApiParam)({ name: 'id', description: `${(0, pluralize_1.singular)(entityName)} ID` }),
        (0, swagger_1.ApiBody)({ type: updateDtoClass, description: `${(0, pluralize_1.singular)(entityName)} update data` }),
        __param(0, (0, common_1.Param)('id')),
        __param(1, (0, common_1.Body)()),
        __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object, String]),
        __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
    ], DynamicController.prototype, "update", null);
    DynamicController = __decorate([
        (0, swagger_1.ApiTags)(entityName),
        (0, common_1.Controller)(),
        __param(0, (0, common_1.Inject)(ServiceClass)),
        __metadata("design:paramtypes", [typeof (_a = typeof base_service_1.BaseService !== "undefined" && base_service_1.BaseService) === "function" ? _a : Object])
    ], DynamicController);
    return DynamicController;
}


/***/ }),
/* 36 */
/***/ ((module) => {

module.exports = require("pluralize");

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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseController = void 0;
const pagination_dto_1 = __webpack_require__(38);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(39);
const authorize_decorator_1 = __webpack_require__(41);
const current_user_decorator_1 = __webpack_require__(56);
const action_enum_1 = __webpack_require__(25);
const create_permissions_factory_1 = __webpack_require__(57);
const utility_helper_1 = __webpack_require__(49);
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
        return await this.baseService.findAllComplex(paginationDto);
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
        await this.baseService.delete(id);
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
    (0, swagger_1.ApiOperation)({ summary: 'Create an entity' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input data.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Entity already exists.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Entity not found.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'The entity has been successfully created.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", typeof (_a = typeof Promise !== "undefined" && Promise) === "function" ? _a : Object)
], BaseController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, authorize_decorator_1.Authorize)({ endpointType: action_enum_1.Action.UPDATE }),
    (0, swagger_1.ApiOperation)({ summary: 'Update an entity' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'The entity has been successfully updated.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input data.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Entity not found.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.' }),
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
        
        ## Combining Filters
        You can combine multiple filters: \`?filter={"status":"active","age":{"gte":21}}\`
        
        ## Sorting
        Sort by field: \`?sort={"createdAt":"DESC"}\`
        Multiple fields: \`?sort={"status":"ASC","createdAt":"DESC"}\`
        
        ## Pagination
        Page size: \`?take=10\`
        Skip records: \`?skip=10\` (for page 2 with size 10)
        
        ## Relations
        Include related entities: \`?relations=["user","category"]\`
        
        ## Field Selection
        Select specific fields: \`?select=["id","name","email"]\`
        
        ## User Filtering
        Filter by user: \`?userId=123e4567-e89b-12d3-a456-426614174000\`
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
            complex: {
                summary: 'Complex Combined Filter',
                value: '{"status":{"in":["active","pending"]},"age":{"gte":21},"name":{"ilike":"smith"}}',
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
        },
    }),
    (0, swagger_1.ApiQuery)({
        name: 'relations',
        required: false,
        type: String,
        example: '["user","category"]',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'select',
        required: false,
        type: String,
        example: '["id","name","email"]',
    }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, type: String, format: 'uuid' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Successfully retrieved entities',
        schema: {
            allOf: [
                {
                    properties: {
                        data: {
                            type: 'array',
                        },
                        totalCount: { type: 'number' },
                        meta: { type: 'object' },
                    },
                },
            ],
        },
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
    (0, swagger_1.ApiOperation)({ summary: 'Delete an entity' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Entity ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT, description: 'The entity has been successfully deleted.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Entity not found.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input data.' }),
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
exports.PaginationDto = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(39);
const class_validator_1 = __webpack_require__(40);
const typeorm_1 = __webpack_require__(16);
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
/* 39 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 40 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PERMISSION_ENDPOINT_TYPE = exports.PERMISSIONS_FUNCTION_KEY = void 0;
exports.Authorize = Authorize;
const jwt_auth_guard_1 = __webpack_require__(42);
const permissions_guard_1 = __webpack_require__(44);
const roles_guard_1 = __webpack_require__(54);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const permissions_decorator_1 = __webpack_require__(52);
const roles_decorator_1 = __webpack_require__(55);
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
/* 42 */
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
const passport_1 = __webpack_require__(43);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 43 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

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
var PermissionsGuard_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionsGuard = void 0;
const users_service_1 = __webpack_require__(45);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const base_controller_1 = __webpack_require__(37);
const authorize_decorator_1 = __webpack_require__(41);
const permissions_decorator_1 = __webpack_require__(52);
const action_enum_1 = __webpack_require__(25);
const role_enum_1 = __webpack_require__(53);
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
/* 45 */
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
const base_service_1 = __webpack_require__(46);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const bcrypt = __importStar(__webpack_require__(51));
const typeorm_2 = __webpack_require__(16);
const user_entity_1 = __webpack_require__(13);
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
/* 46 */
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
const data_source_1 = __importDefault(__webpack_require__(47));
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(16);
const pagination_dto_1 = __webpack_require__(38);
const utility_helper_1 = __webpack_require__(49);
const transaction_service_1 = __webpack_require__(50);
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
            // For complex filtering that requires JOIN operations or custom SQL
            if (Object.keys(findOptions.where || {}).length > 3) {
                // Use QueryBuilder for more complex queries
                const queryBuilder = this.repository.createQueryBuilder('entity');
                // Apply where conditions from findOptions
                Object.entries(findOptions.where || {}).forEach(([key, value]) => {
                    if (typeof value === 'object' && value !== null) {
                        // Handle TypeORM operators
                        queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
                    }
                    else {
                        queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
                    }
                });
                // Apply ordering
                if (findOptions.order) {
                    Object.entries(findOptions.order).forEach(([key, direction]) => {
                        queryBuilder.addOrderBy(`entity.${key}`, direction);
                    });
                }
                // Apply relations
                if (findOptions.relations) {
                    Object.keys(findOptions.relations).forEach(relation => {
                        queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
                    });
                }
                // Apply pagination
                queryBuilder.skip(findOptions.skip).take(findOptions.take);
                const [data, totalCount] = await queryBuilder.getManyAndCount();
                this.logger.debug(`Found ${totalCount} items using QueryBuilder`);
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
            else {
                // For simple queries, use findAndCount
                const [data, totalCount] = await this.repository.findAndCount(findOptions);
                this.logger.debug(`Found ${totalCount} items using findAndCount`);
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
                this.logger.error(`Error in findAll method: ${error.message}`, error.stack);
                throw new common_1.InternalServerErrorException(`Failed to retrieve ${this.entityName} records: ${error.message}`);
            }
            else {
                this.logger.error(`Error in findAll method: ${String(error)}`);
                throw new common_1.InternalServerErrorException(`Failed to retrieve ${this.entityName} records: ${String(error)}`);
            }
        }
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
/* 47 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dataSourceOptions = void 0;
const profile_entity_1 = __webpack_require__(30);
const address_entity_1 = __webpack_require__(27);
const document_type_entity_1 = __webpack_require__(17);
const config_1 = __webpack_require__(2);
const dotenv_1 = __webpack_require__(48);
const typeorm_1 = __webpack_require__(16);
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
/* 48 */
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),
/* 49 */
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransactionService = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(16);
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
/* 51 */
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),
/* 52 */
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
/* 53 */
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
var RolesGuard_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const users_service_1 = __webpack_require__(45);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const roles_decorator_1 = __webpack_require__(55);
const role_enum_1 = __webpack_require__(53);
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
/* 55 */
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
/* 56 */
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
/* 57 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createPermissions = void 0;
const action_enum_1 = __webpack_require__(25);
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
/* 58 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Override = Override;
__webpack_require__(59);
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
/* 59 */
/***/ ((module) => {

module.exports = require("reflect-metadata");

/***/ }),
/* 60 */
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
const create_get_dto_factory_1 = __webpack_require__(61);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(39);
const class_validator_1 = __webpack_require__(40);
const profile_dto_1 = __webpack_require__(62);
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
class GetUserDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateUserDto) {
}
exports.GetUserDto = GetUserDto;


/***/ }),
/* 61 */
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
function createGetDto(dto) {
    var _a, _b, _c;
    class GetDto {
        constructor(partial) {
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
            description: 'Date when the entity was created',
            example: '2023-01-01T00:00:00Z',
            type: Date
        }),
        __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
    ], GetDto.prototype, "createdAt", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Date when the entity was last updated',
            example: '2023-01-02T00:00:00Z',
            type: Date,
            nullable: true
        }),
        __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
    ], GetDto.prototype, "updatedAt", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'ID of the user who created this entity',
            example: '123e4567-e89b-12d3-a456-426614174000',
            nullable: true
        }),
        __metadata("design:type", String)
    ], GetDto.prototype, "createdBy", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'ID of the user who last updated this entity',
            example: '123e4567-e89b-12d3-a456-426614174000',
            nullable: true
        }),
        __metadata("design:type", String)
    ], GetDto.prototype, "updatedBy", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Whether this entity is marked as deleted',
            example: false,
            default: false
        }),
        __metadata("design:type", Boolean)
    ], GetDto.prototype, "isDeleted", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'ID of the user who deleted this entity',
            example: '123e4567-e89b-12d3-a456-426614174000',
            nullable: true
        }),
        __metadata("design:type", String)
    ], GetDto.prototype, "deletedBy", void 0);
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Date when the entity was deleted',
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetProfileDto = exports.UpdateProfileDto = exports.ProfileDto = void 0;
const create_get_dto_factory_1 = __webpack_require__(61);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(39);
const class_validator_1 = __webpack_require__(40);
const address_dto_1 = __webpack_require__(63);
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
/* 63 */
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
const create_get_dto_factory_1 = __webpack_require__(61);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(40);
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
/* 65 */
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
const config_schema_1 = __webpack_require__(66);
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
/* 66 */
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
const Joi = __importStar(__webpack_require__(67));
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
/* 67 */
/***/ ((module) => {

module.exports = require("joi");

/***/ }),
/* 68 */
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
const typeorm_1 = __webpack_require__(12);
const config_1 = __webpack_require__(2);
const data_source_1 = __webpack_require__(47);
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
/* 69 */
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
const employee_management_module_1 = __webpack_require__(70);
const roles_module_1 = __webpack_require__(78);
const auth_module_1 = __webpack_require__(87);
const profiles_module_1 = __webpack_require__(105);
const user_seeder_service_1 = __webpack_require__(108);
const sessions_module_1 = __webpack_require__(89);
const users_module_1 = __webpack_require__(11);
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
/* 70 */
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
const typeorm_1 = __webpack_require__(12);
const users_module_1 = __webpack_require__(11);
const employees_controller_1 = __webpack_require__(71);
const employees_service_1 = __webpack_require__(75);
const employee_entity_1 = __webpack_require__(18);
const permissions_module_1 = __webpack_require__(77);
const roles_module_1 = __webpack_require__(78);
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
/* 71 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmployeesController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const employee_dto_1 = __webpack_require__(72);
const employees_service_1 = __webpack_require__(75);
class EmployeesController extends (0, create_controller_factory_1.createController)('Employees', // Entity name for Swagger documentation
employees_service_1.EmployeesService, // The service handling Employee-related operations
employee_dto_1.GetEmployeeDto, // DTO for retrieving Employees
employee_dto_1.EmployeeDto, // DTO for creating Employees
employee_dto_1.UpdateEmployeeDto) {
}
exports.EmployeesController = EmployeesController;


/***/ }),
/* 72 */
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
exports.GetEmployeeDto = exports.UpdateEmployeeDto = exports.EmployeeDto = void 0;
const base_dto_1 = __webpack_require__(73);
const reference_dto_1 = __webpack_require__(74);
const employment_condition_enum_1 = __webpack_require__(19);
const employment_status_enum_1 = __webpack_require__(20);
const employment_type_enum_1 = __webpack_require__(21);
const create_get_dto_factory_1 = __webpack_require__(61);
const user_dto_1 = __webpack_require__(60);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(39);
const class_validator_1 = __webpack_require__(40);
class EmployeeDto extends (0, swagger_1.PartialType)(base_dto_1.BaseDto) {
}
exports.EmployeeDto = EmployeeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Account information', required: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => user_dto_1.UserDto),
    __metadata("design:type", typeof (_a = typeof user_dto_1.UserDto !== "undefined" && user_dto_1.UserDto) === "function" ? _a : Object)
], EmployeeDto.prototype, "user", void 0);
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
    __metadata("design:type", typeof (_b = typeof employment_status_enum_1.EmploymentStatus !== "undefined" && employment_status_enum_1.EmploymentStatus) === "function" ? _b : Object)
], EmployeeDto.prototype, "employmentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Employment condition of the employee',
        enum: employment_condition_enum_1.EmploymentCondition,
        default: employment_condition_enum_1.EmploymentCondition.PROBATIONARY,
    }),
    (0, class_validator_1.IsEnum)(employment_condition_enum_1.EmploymentCondition),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_c = typeof employment_condition_enum_1.EmploymentCondition !== "undefined" && employment_condition_enum_1.EmploymentCondition) === "function" ? _c : Object)
], EmployeeDto.prototype, "employmentCondition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Employment type of the employee',
        enum: employment_type_enum_1.EmploymentType,
        default: employment_type_enum_1.EmploymentType.FULL_TIME,
    }),
    (0, class_validator_1.IsEnum)(employment_type_enum_1.EmploymentType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_d = typeof employment_type_enum_1.EmploymentType !== "undefined" && employment_type_enum_1.EmploymentType) === "function" ? _d : Object)
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
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
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
class GetEmployeeDto extends (0, create_get_dto_factory_1.createGetDto)(EmployeeDto) {
}
exports.GetEmployeeDto = GetEmployeeDto;


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(40);
class BaseDto {
}
exports.BaseDto = BaseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Organization ID',
        required: false,
        type: String,
        example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BaseDto.prototype, "organizationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Branch ID',
        required: false,
        type: String,
        example: '123e4567-e89b-12d3-a456-426614174001'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BaseDto.prototype, "branchId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Department ID',
        required: false,
        type: String,
        example: '123e4567-e89b-12d3-a456-426614174002'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BaseDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID',
        required: false,
        type: String,
        example: '123e4567-e89b-12d3-a456-426614174003'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BaseDto.prototype, "userId", void 0);


/***/ }),
/* 74 */
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
const class_validator_1 = __webpack_require__(40);
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
/* 75 */
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
const role_enum_1 = __webpack_require__(53);
const base_service_1 = __webpack_require__(46);
const users_service_1 = __webpack_require__(45);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const employee_entity_1 = __webpack_require__(18);
const roles_service_1 = __webpack_require__(76);
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
/* 76 */
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
const base_service_1 = __webpack_require__(46);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const users_service_1 = __webpack_require__(45);
const role_entity_1 = __webpack_require__(22);
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
/* 77 */
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
const typeorm_1 = __webpack_require__(12);
const users_module_1 = __webpack_require__(11);
const roles_module_1 = __webpack_require__(78);
const permission_entity_1 = __webpack_require__(24);
const permissions_controller_1 = __webpack_require__(81);
const permissions_service_1 = __webpack_require__(83);
const permission_seeder_service_1 = __webpack_require__(84);
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
/* 78 */
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
const typeorm_1 = __webpack_require__(12);
const users_module_1 = __webpack_require__(11);
const role_entity_1 = __webpack_require__(22);
const roles_controller_1 = __webpack_require__(79);
const roles_service_1 = __webpack_require__(76);
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesController = void 0;
const base_controller_1 = __webpack_require__(37);
const authorize_decorator_1 = __webpack_require__(41);
const current_user_decorator_1 = __webpack_require__(56);
const override_decorator_1 = __webpack_require__(58);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const create_permissions_factory_1 = __webpack_require__(57);
const role_dto_1 = __webpack_require__(80);
const roles_service_1 = __webpack_require__(76);
// Controller permissions
const Permissions = (0, create_permissions_factory_1.createPermissions)('roles');
let RolesController = class RolesController extends base_controller_1.BaseController {
    constructor(rolesService) {
        super(rolesService, role_dto_1.GetRoleDto, 'Roles');
        this.rolesService = rolesService;
    }
    async create(createRoleDto, createdById) {
        return super.create(createRoleDto, createdById);
    }
    async update(id, updateRoleDto, updatedById) {
        return super.update(id, updateRoleDto, updatedById);
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, common_1.Post)(),
    (0, override_decorator_1.Override)(),
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiBody)({ type: role_dto_1.RoleDto, description: 'Role data' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'The role has been successfully created.',
        type: role_dto_1.GetRoleDto
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof role_dto_1.RoleDto !== "undefined" && role_dto_1.RoleDto) === "function" ? _b : Object, String]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], RolesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, override_decorator_1.Override)(),
    (0, swagger_1.ApiBody)({ type: role_dto_1.UpdateRoleDto, description: 'Role data' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'The role has been successfully updated.',
        type: role_dto_1.GetRoleDto
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof role_dto_1.UpdateRoleDto !== "undefined" && role_dto_1.UpdateRoleDto) === "function" ? _d : Object, String]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], RolesController.prototype, "update", null);
exports.RolesController = RolesController = __decorate([
    (0, swagger_1.ApiTags)('Roles'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof roles_service_1.RolesService !== "undefined" && roles_service_1.RolesService) === "function" ? _a : Object])
], RolesController);


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetRoleDto = exports.UpdateRoleDto = exports.RoleDto = void 0;
const base_dto_1 = __webpack_require__(73);
const reference_dto_1 = __webpack_require__(74);
const role_scope_type_enum_1 = __webpack_require__(23);
const create_get_dto_factory_1 = __webpack_require__(61);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(39);
const class_validator_1 = __webpack_require__(40);
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
class GetRoleDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateRoleDto) {
}
exports.GetRoleDto = GetRoleDto;


/***/ }),
/* 81 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionsController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const permission_dto_1 = __webpack_require__(82);
const permissions_service_1 = __webpack_require__(83);
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetPermissionDto = exports.UpdatePermissionDto = exports.PermissionDto = void 0;
const action_enum_1 = __webpack_require__(25);
const create_get_dto_factory_1 = __webpack_require__(61);
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
class GetPermissionDto extends (0, create_get_dto_factory_1.createGetDto)(UpdatePermissionDto) {
}
exports.GetPermissionDto = GetPermissionDto;


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionsService = void 0;
const base_service_1 = __webpack_require__(46);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const users_service_1 = __webpack_require__(45);
const roles_service_1 = __webpack_require__(76);
const permission_entity_1 = __webpack_require__(24);
let PermissionsService = class PermissionsService extends base_service_1.BaseService {
    constructor(permissionsRepository, usersService, rolesService) {
        super(permissionsRepository, usersService);
        this.permissionsRepository = permissionsRepository;
        this.usersService = usersService;
        this.rolesService = rolesService;
    }
    async getAllPermissions() {
        return this.permissionsRepository.find();
    }
    async userHasPermissions(userId, permissions) {
        return true;
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object, typeof (_c = typeof roles_service_1.RolesService !== "undefined" && roles_service_1.RolesService) === "function" ? _c : Object])
], PermissionsService);


/***/ }),
/* 84 */
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
const action_enum_1 = __webpack_require__(25);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const fs = __importStar(__webpack_require__(85));
const glob_1 = __webpack_require__(86);
const typeorm_2 = __webpack_require__(16);
const permission_entity_1 = __webpack_require__(24);
let PermissionSeederService = PermissionSeederService_1 = class PermissionSeederService {
    constructor(permissionRepository) {
        this.permissionRepository = permissionRepository;
        this.logger = new common_1.Logger(PermissionSeederService_1.name);
    }
    // Automatically run on module initialization
    async onModuleInit() {
        if (process.env.NODE_ENV !== 'test') {
            await this.seedPermissions();
        }
    }
    async seedPermissions() {
        this.logger.log('🔍 Scanning controllers for permissions...');
        const permissions = await this.scanForPermissions();
        this.logger.log(`Found ${permissions.length} permissions in controllers`);
        let created = 0;
        let updated = 0;
        for (const permDef of permissions) {
            const result = await this.createOrUpdatePermission(permDef);
            if (result.isNew)
                created++;
            else
                updated++;
        }
        this.logger.log(`Permission seeding completed: ${created} created, ${updated} updated`);
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
    async scanForPermissions() {
        const permissions = [];
        const controllers = await this.findControllerFiles();
        for (const file of controllers) {
            const fileContent = fs.readFileSync(file, 'utf8');
            // Find all permission definitions using various patterns
            this.extractNamedPermissions(fileContent, permissions);
            // Get all @Authorize decorator usages with their permission references
            this.extractAuthorizationRules(fileContent, permissions);
        }
        return this.removeDuplicates(permissions);
    }
    extractNamedPermissions(fileContent, permissions) {
        // Find both ProfilePermissions and other similar patterns
        const permissionDefRegex = /export\s+const\s+(\w+)Permissions\s*=\s*createPermissions\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        let permMatch;
        while ((permMatch = permissionDefRegex.exec(fileContent)) !== null) {
            const prefix = permMatch[1]; // e.g., "Profile"
            const subject = permMatch[2]; // e.g., "profiles"
            // Extract destructured permission variables
            const destructureRegex = new RegExp(`const\\s*{\\s*([^}]+)\\s*}\\s*=\\s*${prefix}Permissions`, 'g');
            let destructureMatch;
            while ((destructureMatch = destructureRegex.exec(fileContent)) !== null) {
                if (destructureMatch[1]) {
                    // Split and process each permission action
                    const actionNames = destructureMatch[1].split(',').map(a => a.trim());
                    for (const actionName of actionNames) {
                        const action = this.mapActionNameToEnum(actionName);
                        permissions.push({
                            action,
                            subject,
                            name: `${actionName} ${subject}`,
                            description: `Permission to ${actionName.toLowerCase()} ${subject}`
                        });
                    }
                }
            }
        }
    }
    extractAuthorizationRules(fileContent, permissions) {
        // First identify all subject names from createPermissions calls
        const subjectMap = new Map();
        const permDefRegex = /export\s+const\s+(\w+)Permissions\s*=\s*createPermissions\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        let permDefMatch;
        while ((permDefMatch = permDefRegex.exec(fileContent)) !== null) {
            const prefix = permDefMatch[1]; // e.g., "Profile"
            const subject = permDefMatch[2]; // e.g., "profiles"
            subjectMap.set(prefix, subject);
        }
        // Find all @Authorize decorators with permission arrays
        const authorizeRegex = /@Authorize\s*\(\s*\{[^}]*permissions\s*:\s*\[([\s\S]*?)\]\s*\}/g;
        let authorizeMatch;
        while ((authorizeMatch = authorizeRegex.exec(fileContent)) !== null) {
            if (authorizeMatch[1]) {
                // Extract permission references
                const permRefs = authorizeMatch[1].split(',').map(p => p.trim());
                for (const permRef of permRefs) {
                    // Handle both formats: direct reference and prefix.Action pattern
                    if (permRef.includes('.')) {
                        // Format: PrefixPermissions.Action (e.g., ProfilePermissions.Read)
                        const parts = permRef.split('.');
                        if (parts.length === 2) {
                            // Get subject from the map if available
                            for (const [prefix, subject] of subjectMap.entries()) {
                                if (permRef.startsWith(prefix)) {
                                    const actionName = parts[1].trim();
                                    const action = this.mapActionNameToEnum(actionName);
                                    permissions.push({
                                        action,
                                        subject,
                                        name: `${actionName} ${subject}`,
                                        description: `Permission to ${actionName.toLowerCase()} ${subject}`
                                    });
                                }
                            }
                        }
                    }
                    else {
                        // Direct reference (e.g., Read, Manage)
                        // Find the subject from context (in this case we need to infer it from the file)
                        for (const subject of subjectMap.values()) {
                            const action = this.mapActionNameToEnum(permRef);
                            permissions.push({
                                action,
                                subject,
                                name: `${permRef} ${subject}`,
                                description: `Permission to ${permRef.toLowerCase()} ${subject}`
                            });
                        }
                    }
                }
            }
        }
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
/* 85 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 86 */
/***/ ((module) => {

module.exports = require("glob");

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
exports.AuthModule = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(88);
const passport_1 = __webpack_require__(43);
const common_module_1 = __webpack_require__(10);
const jwt_auth_guard_1 = __webpack_require__(42);
const permissions_guard_1 = __webpack_require__(44);
const roles_guard_1 = __webpack_require__(54);
const sessions_module_1 = __webpack_require__(89);
const users_module_1 = __webpack_require__(11);
const auth_controller_1 = __webpack_require__(93);
const auth_service_1 = __webpack_require__(97);
const jwt_service_1 = __webpack_require__(99);
const access_token_strategy_1 = __webpack_require__(103);
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
        exports: [auth_service_1.AuthService],
    })
], AuthModule);


/***/ }),
/* 88 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

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
exports.SessionsModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const users_module_1 = __webpack_require__(11);
const session_entity_1 = __webpack_require__(33);
const sessions_controller_1 = __webpack_require__(90);
const sessions_service_1 = __webpack_require__(92);
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
/* 90 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionsController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const session_dto_1 = __webpack_require__(91);
const sessions_service_1 = __webpack_require__(92);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetSessionDto = exports.UpdateSessionDto = exports.SessionDto = void 0;
const base_dto_1 = __webpack_require__(73);
const create_get_dto_factory_1 = __webpack_require__(61);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(40);
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
class GetSessionDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateSessionDto) {
}
exports.GetSessionDto = GetSessionDto;


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionsService = void 0;
const base_service_1 = __webpack_require__(46);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const users_service_1 = __webpack_require__(45);
const session_entity_1 = __webpack_require__(33);
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const authorize_decorator_1 = __webpack_require__(41);
const current_user_decorator_1 = __webpack_require__(56);
const jwt_payload_interface_1 = __webpack_require__(94);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(39);
const express_1 = __webpack_require__(95);
const google_auth_guard_1 = __webpack_require__(96);
const user_dto_1 = __webpack_require__(60);
const auth_service_1 = __webpack_require__(97);
const login_user_dto_1 = __webpack_require__(101);
const register_user_dto_1 = __webpack_require__(102);
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
/* 94 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 95 */
/***/ ((module) => {

module.exports = require("express");

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
exports.GoogleAuthGuard = void 0;
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(43);
let GoogleAuthGuard = class GoogleAuthGuard extends (0, passport_1.AuthGuard)('google-auth') {
};
exports.GoogleAuthGuard = GoogleAuthGuard;
exports.GoogleAuthGuard = GoogleAuthGuard = __decorate([
    (0, common_1.Injectable)()
], GoogleAuthGuard);


/***/ }),
/* 97 */
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
const utility_helper_1 = __webpack_require__(49);
const common_service_1 = __webpack_require__(64);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const bcrypt = __importStar(__webpack_require__(98));
const sessions_service_1 = __webpack_require__(92);
const users_service_1 = __webpack_require__(45);
const jwt_service_1 = __webpack_require__(99);
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
/* 98 */
/***/ ((module) => {

module.exports = require("bcrypt");

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
var JwtService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtService = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(88);
const uuid_1 = __webpack_require__(100);
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
/* 100 */
/***/ ((module) => {

module.exports = require("uuid");

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoginUserDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(39);
const class_validator_1 = __webpack_require__(40);
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegisterUserDto = void 0;
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(39);
const class_validator_1 = __webpack_require__(40);
const profile_dto_1 = __webpack_require__(62);
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
/* 103 */
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
const users_service_1 = __webpack_require__(45);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(43);
const passport_jwt_1 = __webpack_require__(104);
const jwt_service_1 = __webpack_require__(99);
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
/* 104 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 105 */
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
const typeorm_1 = __webpack_require__(12);
const users_module_1 = __webpack_require__(11);
const profile_entity_1 = __webpack_require__(30);
const profiles_controller_1 = __webpack_require__(106);
const profiles_service_1 = __webpack_require__(107);
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
/* 106 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProfilesController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const profile_dto_1 = __webpack_require__(62);
const profiles_service_1 = __webpack_require__(107);
class ProfilesController extends (0, create_controller_factory_1.createController)('Profiles', // Entity name for Swagger documentation
profiles_service_1.ProfilesService, // The service handling Profile-related operations
profile_dto_1.GetProfileDto, // DTO for retrieving profiles
profile_dto_1.ProfileDto, // DTO for creating profiles
profile_dto_1.UpdateProfileDto) {
    async findAllAdvanced(paginationDto) {
        return await super.findAllAdvanced(paginationDto);
    }
    async findOne(id) {
        return await super.findOne(id);
    }
    async delete(id) {
        return await super.delete(id);
    }
    deleteMany(ids, hardDelete) {
        return super.deleteMany(ids, hardDelete);
    }
}
exports.ProfilesController = ProfilesController;


/***/ }),
/* 107 */
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
const base_service_1 = __webpack_require__(46);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const users_service_1 = __webpack_require__(45);
const profile_entity_1 = __webpack_require__(30);
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
/* 108 */
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
const employment_condition_enum_1 = __webpack_require__(19);
const employment_status_enum_1 = __webpack_require__(20);
const employment_type_enum_1 = __webpack_require__(21);
const role_scope_type_enum_1 = __webpack_require__(23);
const role_enum_1 = __webpack_require__(53);
const auth_service_1 = __webpack_require__(97);
const employees_service_1 = __webpack_require__(75);
const roles_service_1 = __webpack_require__(76);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const bcrypt = __importStar(__webpack_require__(98));
const users_service_1 = __webpack_require__(45);
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
/* 109 */
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
const typeorm_1 = __webpack_require__(12);
const users_module_1 = __webpack_require__(11);
const addresses_service_1 = __webpack_require__(110);
const address_entity_1 = __webpack_require__(27);
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
/* 110 */
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
const base_service_1 = __webpack_require__(46);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const users_service_1 = __webpack_require__(45);
const address_entity_1 = __webpack_require__(27);
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
/* 111 */
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
const typeorm_1 = __webpack_require__(12);
const users_module_1 = __webpack_require__(11);
const document_types_module_1 = __webpack_require__(112);
const documents_controller_1 = __webpack_require__(116);
const documents_service_1 = __webpack_require__(117);
const document_entity_1 = __webpack_require__(14);
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
/* 112 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentTypesModule = void 0;
const users_module_1 = __webpack_require__(11);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const document_types_controller_1 = __webpack_require__(113);
const document_types_service_1 = __webpack_require__(114);
const document_type_entity_1 = __webpack_require__(17);
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
/* 113 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentTypesController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const document_types_service_1 = __webpack_require__(114);
const document_type_dto_1 = __webpack_require__(115);
class DocumentTypesController extends (0, create_controller_factory_1.createController)('Document Types', // Entity name for Swagger documentation
document_types_service_1.DocumentTypesService, // The service handling DocumentType-related operations
document_type_dto_1.GetDocumentTypeDto, // DTO for retrieving DocumentTypes
document_type_dto_1.DocumentTypeDto, // DTO for creating DocumentTypes
document_type_dto_1.UpdateDocumentTypeDto) {
}
exports.DocumentTypesController = DocumentTypesController;


/***/ }),
/* 114 */
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
const base_service_1 = __webpack_require__(46);
const users_service_1 = __webpack_require__(45);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const document_type_entity_1 = __webpack_require__(17);
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
/* 115 */
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
const base_dto_1 = __webpack_require__(73);
const create_get_dto_factory_1 = __webpack_require__(61);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(40);
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
class GetDocumentTypeDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateDocumentTypeDto) {
}
exports.GetDocumentTypeDto = GetDocumentTypeDto;


/***/ }),
/* 116 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentsController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const documents_service_1 = __webpack_require__(117);
const document_dto_1 = __webpack_require__(118);
class DocumentsController extends (0, create_controller_factory_1.createController)('Documents', // Entity name for Swagger documentation
documents_service_1.DocumentsService, // The service handling Document-related operations
document_dto_1.GetDocumentDto, // DTO for retrieving Documents
document_dto_1.DocumentDto, // DTO for creating Documents
document_dto_1.UpdateDocumentDto // DTO for updating Documents
) {
}
exports.DocumentsController = DocumentsController;


/***/ }),
/* 117 */
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
const base_service_1 = __webpack_require__(46);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const users_service_1 = __webpack_require__(45);
const document_entity_1 = __webpack_require__(14);
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
/* 118 */
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
const base_dto_1 = __webpack_require__(73);
const create_get_dto_factory_1 = __webpack_require__(61);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(40);
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
class GetDocumentDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateDocumentDto) {
}
exports.GetDocumentDto = GetDocumentDto;


/***/ }),
/* 119 */
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
const users_module_1 = __webpack_require__(11);
const file_provider_config_1 = __webpack_require__(120);
const files_controller_1 = __webpack_require__(130);
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
/* 120 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fileProviders = exports.fileProviderConfig = exports.FILE_SERVICE = void 0;
const config_1 = __webpack_require__(2);
const local_file_service_1 = __webpack_require__(121);
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
/* 121 */
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
const fs = __importStar(__webpack_require__(85));
const fs_1 = __webpack_require__(85);
const mime = __importStar(__webpack_require__(122));
const path_1 = __importDefault(__webpack_require__(123));
const file_list_options_dto_1 = __webpack_require__(124);
const base_file_service_1 = __webpack_require__(125);
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
/* 122 */
/***/ ((module) => {

module.exports = require("mime-types");

/***/ }),
/* 123 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 124 */
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
const class_transformer_1 = __webpack_require__(39);
const class_validator_1 = __webpack_require__(40);
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
/* 125 */
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
const crypto = __importStar(__webpack_require__(126));
const csv_writer_1 = __webpack_require__(127);
const ExcelJS = __importStar(__webpack_require__(128));
const fs = __importStar(__webpack_require__(85));
const path = __importStar(__webpack_require__(123));
const pdfkit_1 = __importDefault(__webpack_require__(129));
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
/* 126 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 127 */
/***/ ((module) => {

module.exports = require("csv-writer");

/***/ }),
/* 128 */
/***/ ((module) => {

module.exports = require("exceljs");

/***/ }),
/* 129 */
/***/ ((module) => {

module.exports = require("pdfkit");

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
var FilesController_1;
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FilesController = void 0;
const authorize_decorator_1 = __webpack_require__(41);
const current_user_decorator_1 = __webpack_require__(56);
const common_1 = __webpack_require__(1);
const platform_express_1 = __webpack_require__(131);
const swagger_1 = __webpack_require__(4);
const express_1 = __webpack_require__(95);
const file_provider_config_1 = __webpack_require__(120);
const directory_metadata_dto_1 = __webpack_require__(132);
const file_list_response_dto_1 = __webpack_require__(133);
const file_meta_data_dto_1 = __webpack_require__(134);
const file_service_interface_1 = __webpack_require__(135);
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
/* 131 */
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),
/* 132 */
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileListResponseDto = void 0;
const swagger_1 = __webpack_require__(4);
const directory_metadata_dto_1 = __webpack_require__(132);
const file_meta_data_dto_1 = __webpack_require__(134);
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
/* 134 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileMetadata = void 0;
class FileMetadata {
}
exports.FileMetadata = FileMetadata;


/***/ }),
/* 135 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


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
exports.LogsModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const activity_logs_entity_1 = __webpack_require__(31);
const logs_service_1 = __webpack_require__(137);
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
/* 137 */
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
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const activity_logs_entity_1 = __webpack_require__(31);
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
/* 138 */
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
const notifications_gateway_1 = __webpack_require__(139);
const notifications_service_1 = __webpack_require__(141);
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        providers: [notifications_service_1.NotificationsService, notifications_gateway_1.NotificationsGateway]
    })
], NotificationsModule);


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationsGateway = void 0;
const websockets_1 = __webpack_require__(140);
let NotificationsGateway = class NotificationsGateway {
    handleMessage(client, payload) {
        return 'Hello world!';
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", String)
], NotificationsGateway.prototype, "handleMessage", null);
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)()
], NotificationsGateway);


/***/ }),
/* 140 */
/***/ ((module) => {

module.exports = require("@nestjs/websockets");

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
exports.NotificationsService = void 0;
const common_1 = __webpack_require__(1);
let NotificationsService = class NotificationsService {
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)()
], NotificationsService);


/***/ }),
/* 142 */
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
const typeorm_1 = __webpack_require__(12);
const users_module_1 = __webpack_require__(11);
const branches_module_1 = __webpack_require__(143);
const departments_module_1 = __webpack_require__(147);
const organization_entity_1 = __webpack_require__(28);
const organizations_controller_1 = __webpack_require__(151);
const organizations_service_1 = __webpack_require__(153);
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
/* 143 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BranchesModule = void 0;
const users_module_1 = __webpack_require__(11);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const branches_controller_1 = __webpack_require__(144);
const branches_service_1 = __webpack_require__(145);
const departments_module_1 = __webpack_require__(147);
const branch_entity_1 = __webpack_require__(29);
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
/* 144 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BranchesController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const branches_service_1 = __webpack_require__(145);
const branch_dto_1 = __webpack_require__(146);
class BranchesController extends (0, create_controller_factory_1.createController)('Branches', branches_service_1.BranchesService, branch_dto_1.GetBranchDto, branch_dto_1.BranchDto, branch_dto_1.UpdateBranchDto) {
}
exports.BranchesController = BranchesController;


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BranchesService = void 0;
const base_service_1 = __webpack_require__(46);
const users_service_1 = __webpack_require__(45);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const branch_entity_1 = __webpack_require__(29);
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
/* 146 */
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
const create_get_dto_factory_1 = __webpack_require__(61);
const address_dto_1 = __webpack_require__(63);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(39);
const class_validator_1 = __webpack_require__(40);
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
class GetBranchDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateBranchDto) {
}
exports.GetBranchDto = GetBranchDto;


/***/ }),
/* 147 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DepartmentsModule = void 0;
const users_module_1 = __webpack_require__(11);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const departments_controller_1 = __webpack_require__(148);
const departments_service_1 = __webpack_require__(149);
const department_entity_1 = __webpack_require__(26);
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
/* 148 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DepartmentsController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const departments_service_1 = __webpack_require__(149);
const department_dto_1 = __webpack_require__(150);
class DepartmentsController extends (0, create_controller_factory_1.createController)('Departments', // Entity name for Swagger documentation
departments_service_1.DepartmentsService, // The service handling Department-related operations
department_dto_1.GetDepartmentDto, // DTO for retrieving departments
department_dto_1.DepartmentDto, // DTO for creating departments
department_dto_1.UpdateDepartmentDto // DTO for updating departments
) {
}
exports.DepartmentsController = DepartmentsController;


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DepartmentsService = void 0;
const base_service_1 = __webpack_require__(46);
const users_service_1 = __webpack_require__(45);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const department_entity_1 = __webpack_require__(26);
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetDepartmentDto = exports.UpdateDepartmentDto = exports.DepartmentDto = void 0;
const create_get_dto_factory_1 = __webpack_require__(61);
const address_dto_1 = __webpack_require__(63);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(39);
const class_validator_1 = __webpack_require__(40);
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
class GetDepartmentDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateDepartmentDto) {
}
exports.GetDepartmentDto = GetDepartmentDto;


/***/ }),
/* 151 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationsController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const organization_dto_1 = __webpack_require__(152);
const organizations_service_1 = __webpack_require__(153);
class OrganizationsController extends (0, create_controller_factory_1.createController)('Organizations', organizations_service_1.OrganizationsService, organization_dto_1.GetOrganizationDto, organization_dto_1.OrganizationDto, organization_dto_1.UpdateOrganizationDto) {
}
exports.OrganizationsController = OrganizationsController;


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetOrganizationDto = exports.UpdateOrganizationDto = exports.OrganizationDto = void 0;
const create_get_dto_factory_1 = __webpack_require__(61);
const address_dto_1 = __webpack_require__(63);
const swagger_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(39);
const class_validator_1 = __webpack_require__(40);
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
class GetOrganizationDto extends (0, create_get_dto_factory_1.createGetDto)(UpdateOrganizationDto) {
}
exports.GetOrganizationDto = GetOrganizationDto;


/***/ }),
/* 153 */
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
const base_service_1 = __webpack_require__(46);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const users_service_1 = __webpack_require__(45);
const organization_entity_1 = __webpack_require__(28);
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
/* 154 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SchedulesModule = void 0;
const users_module_1 = __webpack_require__(11);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(12);
const schedule_entity_1 = __webpack_require__(155);
const schedules_controller_1 = __webpack_require__(156);
const schedules_service_1 = __webpack_require__(158);
const groups_module_1 = __webpack_require__(159);
const shifts_module_1 = __webpack_require__(164);
const holidays_module_1 = __webpack_require__(169);
let SchedulesModule = class SchedulesModule {
};
exports.SchedulesModule = SchedulesModule;
exports.SchedulesModule = SchedulesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([schedule_entity_1.Schedule]),
            users_module_1.UsersModule,
            core_1.RouterModule.register([
                {
                    path: 'schedules',
                    module: SchedulesModule,
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
                        }
                    ]
                }
            ]),
            groups_module_1.GroupsModule,
            shifts_module_1.ShiftsModule,
            holidays_module_1.HolidaysModule,
        ],
        providers: [schedules_service_1.SchedulesService],
        exports: [
            schedules_service_1.SchedulesService,
            groups_module_1.GroupsModule,
            shifts_module_1.ShiftsModule,
            holidays_module_1.HolidaysModule,
        ],
        controllers: [schedules_controller_1.SchedulesController],
    })
], SchedulesModule);


/***/ }),
/* 155 */
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
exports.Schedule = void 0;
const base_entity_1 = __webpack_require__(15);
const typeorm_1 = __webpack_require__(16);
let Schedule = class Schedule extends base_entity_1.BaseEntity {
};
exports.Schedule = Schedule;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Schedule.prototype, "name", void 0);
exports.Schedule = Schedule = __decorate([
    (0, typeorm_1.Entity)('schedules')
], Schedule);


/***/ }),
/* 156 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SchedulesController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const schedule_dto_1 = __webpack_require__(157);
const schedules_service_1 = __webpack_require__(158);
class SchedulesController extends (0, create_controller_factory_1.createController)('Schedules', // Entity name for Swagger documentation
schedules_service_1.SchedulesService, // The service handling Schedule-related operations
schedule_dto_1.GetScheduleDto, // DTO for retrieving Schedules
schedule_dto_1.ScheduleDto, // DTO for creating Schedules
schedule_dto_1.UpdateScheduleDto) {
}
exports.SchedulesController = SchedulesController;


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GetScheduleDto = exports.UpdateScheduleDto = exports.ScheduleDto = void 0;
const base_dto_1 = __webpack_require__(73);
const create_get_dto_factory_1 = __webpack_require__(61);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(40);
const swagger_2 = __webpack_require__(4);
class ScheduleDto extends (0, swagger_2.PartialType)(base_dto_1.BaseDto) {
}
exports.ScheduleDto = ScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the schedule' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleDto.prototype, "name", void 0);
class UpdateScheduleDto extends (0, swagger_2.PartialType)(ScheduleDto) {
}
exports.UpdateScheduleDto = UpdateScheduleDto;
class GetScheduleDto extends (0, create_get_dto_factory_1.createGetDto)(ScheduleDto) {
}
exports.GetScheduleDto = GetScheduleDto;


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SchedulesService = void 0;
const base_service_1 = __webpack_require__(46);
const users_service_1 = __webpack_require__(45);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const schedule_entity_1 = __webpack_require__(155);
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
/* 159 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GroupsModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const users_module_1 = __webpack_require__(11);
const groups_controller_1 = __webpack_require__(160);
const groups_service_1 = __webpack_require__(162);
const group_entity_1 = __webpack_require__(163);
let GroupsModule = class GroupsModule {
};
exports.GroupsModule = GroupsModule;
exports.GroupsModule = GroupsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([group_entity_1.Group]),
            users_module_1.UsersModule,
        ],
        providers: [groups_service_1.GroupsService],
        exports: [groups_service_1.GroupsService],
        controllers: [groups_controller_1.GroupsController],
    })
], GroupsModule);


/***/ }),
/* 160 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GroupsController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const group_dto_1 = __webpack_require__(161);
const groups_service_1 = __webpack_require__(162);
class GroupsController extends (0, create_controller_factory_1.createController)('Groups', // Entity name for Swagger documentation
groups_service_1.GroupsService, // The service handling Group-related operations
group_dto_1.GetGroupDto, // DTO for retrieving Groups
group_dto_1.GroupDto, // DTO for creating Groups
group_dto_1.UpdateGroupDto) {
}
exports.GroupsController = GroupsController;


/***/ }),
/* 161 */
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
const base_dto_1 = __webpack_require__(73);
const create_get_dto_factory_1 = __webpack_require__(61);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(40);
const swagger_2 = __webpack_require__(4);
class GroupDto extends (0, swagger_2.PartialType)(base_dto_1.BaseDto) {
}
exports.GroupDto = GroupDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the group' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupDto.prototype, "name", void 0);
class UpdateGroupDto extends (0, swagger_2.PartialType)(GroupDto) {
}
exports.UpdateGroupDto = UpdateGroupDto;
class GetGroupDto extends (0, create_get_dto_factory_1.createGetDto)(GroupDto) {
}
exports.GetGroupDto = GetGroupDto;


/***/ }),
/* 162 */
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
exports.GroupsService = void 0;
const base_service_1 = __webpack_require__(46);
const users_service_1 = __webpack_require__(45);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const group_entity_1 = __webpack_require__(163);
let GroupsService = class GroupsService extends base_service_1.BaseService {
    constructor(groupsRepository, usersService) {
        super(groupsRepository, usersService);
        this.groupsRepository = groupsRepository;
        this.usersService = usersService;
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], GroupsService);


/***/ }),
/* 163 */
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
exports.Group = void 0;
const base_entity_1 = __webpack_require__(15);
const typeorm_1 = __webpack_require__(16);
let Group = class Group extends base_entity_1.BaseEntity {
};
exports.Group = Group;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Group.prototype, "name", void 0);
exports.Group = Group = __decorate([
    (0, typeorm_1.Entity)('groups')
], Group);


/***/ }),
/* 164 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShiftsModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const users_module_1 = __webpack_require__(11);
const shifts_controller_1 = __webpack_require__(165);
const shifts_service_1 = __webpack_require__(167);
const shift_entity_1 = __webpack_require__(168);
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
/* 165 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShiftsController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const shift_dto_1 = __webpack_require__(166);
const shifts_service_1 = __webpack_require__(167);
class ShiftsController extends (0, create_controller_factory_1.createController)('Shifts', // Entity name for Swagger documentation
shifts_service_1.ShiftsService, // The service handling Shift-related operations
shift_dto_1.GetShiftDto, // DTO for retrieving Shifts
shift_dto_1.ShiftDto, // DTO for creating Shifts
shift_dto_1.UpdateShiftDto) {
}
exports.ShiftsController = ShiftsController;


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
exports.GetShiftDto = exports.UpdateShiftDto = exports.ShiftDto = void 0;
const base_dto_1 = __webpack_require__(73);
const create_get_dto_factory_1 = __webpack_require__(61);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(40);
const swagger_2 = __webpack_require__(4);
class ShiftDto extends (0, swagger_2.PartialType)(base_dto_1.BaseDto) {
}
exports.ShiftDto = ShiftDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the shift' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShiftDto.prototype, "name", void 0);
class UpdateShiftDto extends (0, swagger_2.PartialType)(ShiftDto) {
}
exports.UpdateShiftDto = UpdateShiftDto;
class GetShiftDto extends (0, create_get_dto_factory_1.createGetDto)(ShiftDto) {
}
exports.GetShiftDto = GetShiftDto;


/***/ }),
/* 167 */
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
const base_service_1 = __webpack_require__(46);
const users_service_1 = __webpack_require__(45);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const shift_entity_1 = __webpack_require__(168);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Shift = void 0;
const base_entity_1 = __webpack_require__(15);
const typeorm_1 = __webpack_require__(16);
let Shift = class Shift extends base_entity_1.BaseEntity {
};
exports.Shift = Shift;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Shift.prototype, "name", void 0);
exports.Shift = Shift = __decorate([
    (0, typeorm_1.Entity)('shifts')
], Shift);


/***/ }),
/* 169 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HolidaysModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const users_module_1 = __webpack_require__(11);
const holidays_controller_1 = __webpack_require__(170);
const holidays_service_1 = __webpack_require__(172);
const holiday_entity_1 = __webpack_require__(173);
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
/* 170 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HolidaysController = void 0;
const create_controller_factory_1 = __webpack_require__(35);
const holiday_dto_1 = __webpack_require__(171);
const holidays_service_1 = __webpack_require__(172);
class HolidaysController extends (0, create_controller_factory_1.createController)('Holidays', // Entity name for Swagger documentation
holidays_service_1.HolidaysService, // The service handling Holiday-related operations
holiday_dto_1.GetHolidayDto, // DTO for retrieving Holidays
holiday_dto_1.HolidayDto, // DTO for creating Holidays
holiday_dto_1.UpdateHolidayDto) {
}
exports.HolidaysController = HolidaysController;


/***/ }),
/* 171 */
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
exports.GetHolidayDto = exports.UpdateHolidayDto = exports.HolidayDto = void 0;
const base_dto_1 = __webpack_require__(73);
const create_get_dto_factory_1 = __webpack_require__(61);
const swagger_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(40);
const swagger_2 = __webpack_require__(4);
class HolidayDto extends (0, swagger_2.PartialType)(base_dto_1.BaseDto) {
}
exports.HolidayDto = HolidayDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the holiday' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HolidayDto.prototype, "name", void 0);
class UpdateHolidayDto extends (0, swagger_2.PartialType)(HolidayDto) {
}
exports.UpdateHolidayDto = UpdateHolidayDto;
class GetHolidayDto extends (0, create_get_dto_factory_1.createGetDto)(HolidayDto) {
}
exports.GetHolidayDto = GetHolidayDto;


/***/ }),
/* 172 */
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
const base_service_1 = __webpack_require__(46);
const users_service_1 = __webpack_require__(45);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(12);
const typeorm_2 = __webpack_require__(16);
const holiday_entity_1 = __webpack_require__(173);
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
/* 173 */
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
exports.Holiday = void 0;
const base_entity_1 = __webpack_require__(15);
const typeorm_1 = __webpack_require__(16);
let Holiday = class Holiday extends base_entity_1.BaseEntity {
};
exports.Holiday = Holiday;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Holiday.prototype, "name", void 0);
exports.Holiday = Holiday = __decorate([
    (0, typeorm_1.Entity)('holidays')
], Holiday);


/***/ }),
/* 174 */
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
const crypto = __importStar(__webpack_require__(126));
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = void 0;
const common_1 = __webpack_require__(1);
const crypto = __importStar(__webpack_require__(126));
const operators_1 = __webpack_require__(176);
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
/* 176 */
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),
/* 177 */
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
const class_transformer_1 = __webpack_require__(39);
const operators_1 = __webpack_require__(176);
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
/* 178 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.swaggerCustomOptions = exports.swaggerConfig = void 0;
const config_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(4);
const os_1 = __webpack_require__(179);
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
const localIp = getLocalIpAddress();
const port = configService.get('PORT') || '3000';
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
    .addServer(configService.getOrThrow('APP_URL'))
    .addServer(`http://${localIp}:${port}`) // Use ConfigService to get server URL
    // .addTag('Auth', 'Endpoints related to authentication') // Add tags for better organization
    // .addTag('Users', 'Endpoints related to user management')
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
        csp: false // This disables Content Security Policy
    },
};


/***/ }),
/* 179 */
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