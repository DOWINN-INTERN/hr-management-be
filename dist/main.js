/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.module.ts":
/*!***************************!*\
  !*** ./src/app.module.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const common_module_1 = __webpack_require__(/*! ./common/common.module */ "./src/common/common.module.ts");
const config_schema_1 = __webpack_require__(/*! ./config.schema */ "./src/config.schema.ts");
const database_module_1 = __webpack_require__(/*! ./database/database.module */ "./src/database/database.module.ts");
const account_management_module_1 = __webpack_require__(/*! ./modules/account-management/account-management.module */ "./src/modules/account-management/account-management.module.ts");
const attendance_management_module_1 = __webpack_require__(/*! ./modules/attendance-management/attendance-management.module */ "./src/modules/attendance-management/attendance-management.module.ts");
const documents_module_1 = __webpack_require__(/*! ./modules/documents/documents.module */ "./src/modules/documents/documents.module.ts");
const employee_management_module_1 = __webpack_require__(/*! ./modules/employee-management/employee-management.module */ "./src/modules/employee-management/employee-management.module.ts");
const files_module_1 = __webpack_require__(/*! ./modules/files/files.module */ "./src/modules/files/files.module.ts");
const logs_module_1 = __webpack_require__(/*! ./modules/logs/logs.module */ "./src/modules/logs/logs.module.ts");
const notifications_module_1 = __webpack_require__(/*! ./modules/notifications/notifications.module */ "./src/modules/notifications/notifications.module.ts");
const schedule_management_module_1 = __webpack_require__(/*! ./modules/schedule-management/schedule-management.module */ "./src/modules/schedule-management/schedule-management.module.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [`.env.stage.${process.env.STAGE}`],
                validationSchema: config_schema_1.configValidationSchema,
            }),
            database_module_1.DatabaseModule,
            common_module_1.CommonModule,
            logs_module_1.LogsModule,
            files_module_1.FilesModule,
            notifications_module_1.NotificationsModule,
            documents_module_1.DocumentsModule,
            employee_management_module_1.EmployeeManagementModule,
            account_management_module_1.AccountManagementModule,
            schedule_management_module_1.ScheduleManagementModule,
            attendance_management_module_1.AttendanceManagementModule
        ],
        controllers: [],
    })
], AppModule);


/***/ }),

/***/ "./src/common/common.module.ts":
/*!*************************************!*\
  !*** ./src/common/common.module.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommonModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const users_module_1 = __webpack_require__(/*! ../modules/account-management/users/users.module */ "./src/modules/account-management/users/users.module.ts");
const common_service_1 = __webpack_require__(/*! ./services/common.service */ "./src/common/services/common.service.ts");
const transaction_service_1 = __webpack_require__(/*! ./services/transaction.service */ "./src/common/services/transaction.service.ts");
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

/***/ "./src/common/controllers/base.controller.ts":
/*!***************************************************!*\
  !*** ./src/common/controllers/base.controller.ts ***!
  \***************************************************/
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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseController = void 0;
const pagination_dto_1 = __webpack_require__(/*! @/common/dtos/pagination.dto */ "./src/common/dtos/pagination.dto.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const authorize_decorator_1 = __webpack_require__(/*! ../decorators/authorize.decorator */ "./src/common/decorators/authorize.decorator.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const utility_helper_1 = __webpack_require__(/*! ../helpers/utility.helper */ "./src/common/helpers/utility.helper.ts");
class BaseController {
    constructor(baseService, getDtoClass) {
        this.baseService = baseService;
        this.getDtoClass = getDtoClass;
    }
    async create(entityDto, createdById) {
        const entity = await this.baseService.create(entityDto, createdById);
        return (0, class_transformer_1.plainToInstance)(this.getDtoClass, entity, { excludeExtraneousValues: true, exposeDefaultValues: false });
    }
    async update(id, entityDto, updatedById) {
        const updatedEntity = await this.baseService.update(id, entityDto, updatedById);
        return (0, class_transformer_1.plainToInstance)(this.getDtoClass, updatedEntity);
    }
    async findAllAdvanced(paginationDto) {
        return await this.baseService.findAll(paginationDto);
    }
    async findOne(id, relations) {
        // Parse relations string into relations object if provided
        const relationsObj = relations ?
            utility_helper_1.UtilityHelper.parseRelations(relations) :
            undefined;
        // Use the service with proper typing and relations
        const entity = await this.baseService.findOneByOrFail({ id }, relationsObj);
        return (0, class_transformer_1.plainToInstance)(this.getDtoClass, entity);
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
__decorate([
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
    (0, authorize_decorator_1.Authorize)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update an entity' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Entity ID' }),
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
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an entity by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Entity ID' }),
    (0, swagger_1.ApiQuery)({ name: 'relations', required: false, type: String, description: 'Relations to include' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return the entity' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Entity not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('relations')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], BaseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, authorize_decorator_1.Authorize)(),
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
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], BaseController.prototype, "delete", null);
__decorate([
    (0, common_1.Delete)(),
    (0, authorize_decorator_1.Authorize)(),
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
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], BaseController.prototype, "deleteMany", null);


/***/ }),

/***/ "./src/common/decorators/authorize.decorator.ts":
/*!******************************************************!*\
  !*** ./src/common/decorators/authorize.decorator.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Authorize = Authorize;
const role_enum_1 = __webpack_require__(/*! @/common/enums/role.enum */ "./src/common/enums/role.enum.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! @/common/guards/jwt-auth.guard */ "./src/common/guards/jwt-auth.guard.ts");
const permissions_guard_1 = __webpack_require__(/*! @/common/guards/permissions.guard */ "./src/common/guards/permissions.guard.ts");
const roles_guard_1 = __webpack_require__(/*! @/common/guards/roles.guard */ "./src/common/guards/roles.guard.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const permissions_decorator_1 = __webpack_require__(/*! ./permissions.decorator */ "./src/common/decorators/permissions.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ./roles.decorator */ "./src/common/decorators/roles.decorator.ts");
function Authorize(options) {
    // Create a roles array that always includes SUPER_ADMIN
    const roles = (options === null || options === void 0 ? void 0 : options.roles) ? [...options.roles, role_enum_1.Role.SUPERADMIN] : [role_enum_1.Role.SUPERADMIN];
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard), (0, roles_decorator_1.Roles)(roles), (0, permissions_decorator_1.Permissions)(options === null || options === void 0 ? void 0 : options.permissions), (0, swagger_1.ApiBearerAuth)('access-token'));
}


/***/ }),

/***/ "./src/common/decorators/current-user.decorator.ts":
/*!*********************************************************!*\
  !*** ./src/common/decorators/current-user.decorator.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CurrentUser = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
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
        throw new common_1.UnauthorizedException('User is not authenticated.');
    }
    if (!data) {
        return request.user;
    }
    return request === null || request === void 0 ? void 0 : request.user[data];
});


/***/ }),

/***/ "./src/common/decorators/override.decorator.ts":
/*!*****************************************************!*\
  !*** ./src/common/decorators/override.decorator.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Override = Override;
__webpack_require__(/*! reflect-metadata */ "reflect-metadata");
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

/***/ "./src/common/decorators/permissions.decorator.ts":
/*!********************************************************!*\
  !*** ./src/common/decorators/permissions.decorator.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Permissions = exports.PERMISSIONS_KEY = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
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

/***/ "./src/common/decorators/roles.decorator.ts":
/*!**************************************************!*\
  !*** ./src/common/decorators/roles.decorator.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
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

/***/ "./src/common/dtos/pagination.dto.ts":
/*!*******************************************!*\
  !*** ./src/common/dtos/pagination.dto.ts ***!
  \*******************************************/
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
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
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
        // Add user filter if provided
        const userWhere = this.userId ? { userId: this.userId } : {};
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
            where: Object.assign(Object.assign(Object.assign({}, baseWhere), filterWhere), userWhere),
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
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID for filtering',
        required: false,
        format: 'uuid',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], PaginationDto.prototype, "userId", void 0);


/***/ }),

/***/ "./src/common/enums/action.enum.ts":
/*!*****************************************!*\
  !*** ./src/common/enums/action.enum.ts ***!
  \*****************************************/
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

/***/ "./src/common/enums/employment/employment-condition.enum.ts":
/*!******************************************************************!*\
  !*** ./src/common/enums/employment/employment-condition.enum.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmploymentCondition = void 0;
var EmploymentCondition;
(function (EmploymentCondition) {
    EmploymentCondition["PROBATIONARY"] = "probationary";
    EmploymentCondition["REGULAR"] = "regular";
})(EmploymentCondition || (exports.EmploymentCondition = EmploymentCondition = {}));


/***/ }),

/***/ "./src/common/enums/employment/employment-status.enum.ts":
/*!***************************************************************!*\
  !*** ./src/common/enums/employment/employment-status.enum.ts ***!
  \***************************************************************/
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

/***/ "./src/common/enums/employment/employment-type.enum.ts":
/*!*************************************************************!*\
  !*** ./src/common/enums/employment/employment-type.enum.ts ***!
  \*************************************************************/
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

/***/ "./src/common/enums/log-type.enum.ts":
/*!*******************************************!*\
  !*** ./src/common/enums/log-type.enum.ts ***!
  \*******************************************/
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

/***/ "./src/common/enums/role-scope-type.enum.ts":
/*!**************************************************!*\
  !*** ./src/common/enums/role-scope-type.enum.ts ***!
  \**************************************************/
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

/***/ "./src/common/enums/role.enum.ts":
/*!***************************************!*\
  !*** ./src/common/enums/role.enum.ts ***!
  \***************************************/
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

/***/ "./src/common/filters/http-exception.filter.ts":
/*!*****************************************************!*\
  !*** ./src/common/filters/http-exception.filter.ts ***!
  \*****************************************************/
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
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const crypto = __importStar(__webpack_require__(/*! crypto */ "crypto"));
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

/***/ "./src/common/guards/google-auth.guard.ts":
/*!************************************************!*\
  !*** ./src/common/guards/google-auth.guard.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GoogleAuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
let GoogleAuthGuard = class GoogleAuthGuard extends (0, passport_1.AuthGuard)('google-auth') {
};
exports.GoogleAuthGuard = GoogleAuthGuard;
exports.GoogleAuthGuard = GoogleAuthGuard = __decorate([
    (0, common_1.Injectable)()
], GoogleAuthGuard);


/***/ }),

/***/ "./src/common/guards/jwt-auth.guard.ts":
/*!*********************************************!*\
  !*** ./src/common/guards/jwt-auth.guard.ts ***!
  \*********************************************/
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
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),

/***/ "./src/common/guards/permissions.guard.ts":
/*!************************************************!*\
  !*** ./src/common/guards/permissions.guard.ts ***!
  \************************************************/
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
const role_enum_1 = __webpack_require__(/*! @/common/enums/role.enum */ "./src/common/enums/role.enum.ts");
const users_service_1 = __webpack_require__(/*! @/modules/account-management/users/users.service */ "./src/modules/account-management/users/users.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const permissions_decorator_1 = __webpack_require__(/*! ../decorators/permissions.decorator */ "./src/common/decorators/permissions.decorator.ts");
let PermissionsGuard = PermissionsGuard_1 = class PermissionsGuard {
    constructor(reflector, usersService) {
        this.reflector = reflector;
        this.usersService = usersService;
        this.logger = new common_1.Logger(PermissionsGuard_1.name);
    }
    async canActivate(context) {
        var _a, _b;
        try {
            const requiredPermissions = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
            // If no permissions are required, allow access
            if (!requiredPermissions || requiredPermissions.length === 0) {
                return true;
            }
            // Get the user payload from the request
            const request = context.switchToHttp().getRequest();
            const userClaims = request.user;
            if (!userClaims || !userClaims.sub) {
                this.logger.warn('Missing user claims or sub in request');
                throw new common_1.ForbiddenException('Invalid authentication data');
            }
            // get user with their role and role permissions
            let user;
            try {
                user = await this.usersService.findOneByOrFail({ id: userClaims.sub }, { employee: { roles: true } });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`Error fetching user permissions: ${errorMessage}`);
                throw new common_1.ForbiddenException('Error processing permissions');
            }
            if (!user) {
                this.logger.warn(`User with ID ${userClaims.sub} not found`);
                throw new common_1.ForbiddenException('User not found');
            }
            // Validate user has roles
            if (!((_a = user.employee) === null || _a === void 0 ? void 0 : _a.roles) || ((_b = user.employee) === null || _b === void 0 ? void 0 : _b.roles.length) === 0) {
                return false; // No need to throw, just deny access
            }
            // If user has the super admin role, allow access
            const hasSuperAdminRole = user.employee.roles.some(role => role.name === role_enum_1.Role.SUPERADMIN);
            if (hasSuperAdminRole) {
                return true;
            }
            // Check if the user has the required permissions
            const hasRequiredPermissions = requiredPermissions.some(requiredPermission => {
                var _a, _b;
                return (_b = (_a = user.employee) === null || _a === void 0 ? void 0 : _a.roles) === null || _b === void 0 ? void 0 : _b.some(role => {
                    if (!role.permissions || !Array.isArray(role.permissions)) {
                        return false;
                    }
                    return role.permissions.some(permission => permission &&
                        permission.action === requiredPermission.action &&
                        permission.subject === requiredPermission.subject);
                });
            });
            return hasRequiredPermissions;
        }
        catch (error) {
            // Convert any unexpected errors to ForbiddenException instead of letting them become 500s
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

/***/ "./src/common/guards/roles.guard.ts":
/*!******************************************!*\
  !*** ./src/common/guards/roles.guard.ts ***!
  \******************************************/
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
const users_service_1 = __webpack_require__(/*! @/modules/account-management/users/users.service */ "./src/modules/account-management/users/users.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const roles_decorator_1 = __webpack_require__(/*! ../decorators/roles.decorator */ "./src/common/decorators/roles.decorator.ts");
const role_enum_1 = __webpack_require__(/*! ../enums/role.enum */ "./src/common/enums/role.enum.ts");
let RolesGuard = RolesGuard_1 = class RolesGuard {
    constructor(reflector, usersService) {
        this.reflector = reflector;
        this.usersService = usersService;
        this.logger = new common_1.Logger(RolesGuard_1.name);
    }
    async canActivate(context) {
        var _a, _b, _c;
        try {
            const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [context.getHandler(), context.getClass()]);
            // If no roles are required, allow access
            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }
            // If the only role require is super admin role, allow access
            if (requiredRoles.length === 1 && requiredRoles[0] === role_enum_1.Role.SUPERADMIN) {
                return true;
            }
            // Get the user payload from the request
            const request = context.switchToHttp().getRequest();
            const userClaims = request.user;
            if (!userClaims || !userClaims.sub) {
                this.logger.warn('Missing user claims or sub in request');
                throw new common_1.ForbiddenException('Invalid authentication data');
            }
            var user = await this.usersService.findOneBy({ id: userClaims.sub });
            if (!user) {
                this.logger.warn(`User with ID ${userClaims.sub} not found`);
                throw new common_1.ForbiddenException('User not found');
            }
            // Check if the user has the required roles
            const hasRequiredRoles = (_c = (_b = (_a = user === null || user === void 0 ? void 0 : user.employee) === null || _a === void 0 ? void 0 : _a.roles) === null || _b === void 0 ? void 0 : _b.some(role => requiredRoles.includes(role.name))) !== null && _c !== void 0 ? _c : false;
            return hasRequiredRoles;
        }
        catch (error) {
            // Convert any unexpected errors to ForbiddenException instead of letting them become 500s
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Unexpected error in Roles guard: ${errorMessage}`);
            throw new common_1.ForbiddenException('Permission check failed');
        }
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = RolesGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], RolesGuard);


/***/ }),

/***/ "./src/common/helpers/utility.helper.ts":
/*!**********************************************!*\
  !*** ./src/common/helpers/utility.helper.ts ***!
  \**********************************************/
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
            if (relation.trim()) {
                relationsObj[relation.trim()] = true;
            }
        });
        return relationsObj;
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

/***/ "./src/common/interceptors/logging.interceptor.ts":
/*!********************************************************!*\
  !*** ./src/common/interceptors/logging.interceptor.ts ***!
  \********************************************************/
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
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const crypto = __importStar(__webpack_require__(/*! crypto */ "crypto"));
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
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

/***/ "./src/common/interceptors/transform.interceptor.ts":
/*!**********************************************************!*\
  !*** ./src/common/interceptors/transform.interceptor.ts ***!
  \**********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TransformInterceptor = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
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

/***/ "./src/common/interfaces/jwt-payload.interface.ts":
/*!********************************************************!*\
  !*** ./src/common/interfaces/jwt-payload.interface.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./src/common/services/base.service.ts":
/*!*********************************************!*\
  !*** ./src/common/services/base.service.ts ***!
  \*********************************************/
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
const data_source_1 = __importDefault(__webpack_require__(/*! @/database/data-source */ "./src/database/data-source.ts"));
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const pagination_dto_1 = __webpack_require__(/*! ../dtos/pagination.dto */ "./src/common/dtos/pagination.dto.ts");
const utility_helper_1 = __webpack_require__(/*! ../helpers/utility.helper */ "./src/common/helpers/utility.helper.ts");
const transaction_service_1 = __webpack_require__(/*! ./transaction.service */ "./src/common/services/transaction.service.ts");
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
    // DONE
    async findAll(paginationDto) {
        const [data, totalCount] = await this.repository.findAndCount(Object.assign({}, paginationDto.toFindManyOptions()));
        return {
            data,
            totalCount,
            meta: paginationDto,
        };
    }
    // DONE
    async findOneBy(criteria, relations) {
        return await this.repository.findOne({
            relations: relations,
            where: Object.assign(Object.assign({}, ('isDeleted' in criteria ? {} : { isDeleted: false })), criteria)
        });
    }
    // DONE
    async findOneByOrFail(criteria, relations) {
        const entity = await this.findOneBy(criteria, relations);
        if (!entity) {
            throw new common_1.NotFoundException(`${this.entityName} with ${utility_helper_1.UtilityHelper.formatCriteria(criteria)} not found`);
        }
        return entity;
    }
    // DONE
    async create(createDto, createdById) {
        const entity = this.repository.create(Object.assign(Object.assign({}, createDto), { createdById }));
        return await this.repository.save(entity);
    }
    // DONE
    async update(id, updateDto, updatedById) {
        const entity = await this.findOneByOrFail({ id });
        const updatedEntity = await this.repository.save(Object.assign(Object.assign(Object.assign({}, entity), updateDto), { updatedById }));
        return updatedEntity;
    }
    // DONE
    async softDelete(id, deletedById) {
        if (deletedById) {
            await this.repository.update(id, { deletedById });
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
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }
        }
        // Fallback for unrecognized expressions
        return {
            query: '1=1', // Always true
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

/***/ "./src/common/services/common.service.ts":
/*!***********************************************!*\
  !*** ./src/common/services/common.service.ts ***!
  \***********************************************/
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
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
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

/***/ "./src/common/services/transaction.service.ts":
/*!****************************************************!*\
  !*** ./src/common/services/transaction.service.ts ***!
  \****************************************************/
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
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
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

/***/ "./src/common/utils/create-get-dto.ts":
/*!********************************************!*\
  !*** ./src/common/utils/create-get-dto.ts ***!
  \********************************************/
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
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
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

/***/ "./src/config.schema.ts":
/*!******************************!*\
  !*** ./src/config.schema.ts ***!
  \******************************/
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
const Joi = __importStar(__webpack_require__(/*! joi */ "joi"));
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

/***/ "./src/config/swagger.config.ts":
/*!**************************************!*\
  !*** ./src/config/swagger.config.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.swaggerCustomOptions = exports.swaggerConfig = void 0;
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const os_1 = __webpack_require__(/*! os */ "os");
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

/***/ "./src/database/data-source.ts":
/*!*************************************!*\
  !*** ./src/database/data-source.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dataSourceOptions = void 0;
const address_entity_1 = __webpack_require__(/*! @/modules/account-management/profiles/addresses/entities/address.entity */ "./src/modules/account-management/profiles/addresses/entities/address.entity.ts");
const profile_entity_1 = __webpack_require__(/*! @/modules/account-management/profiles/entities/profile.entity */ "./src/modules/account-management/profiles/entities/profile.entity.ts");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const dotenv_1 = __webpack_require__(/*! dotenv */ "dotenv");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
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
    entities: ['dist/**/*.entity{.ts,.js}', address_entity_1.Address, profile_entity_1.Profile],
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

/***/ "./src/database/database.module.ts":
/*!*****************************************!*\
  !*** ./src/database/database.module.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const data_source_1 = __webpack_require__(/*! ./data-source */ "./src/database/data-source.ts");
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

/***/ "./src/database/entities/base.entity.ts":
/*!**********************************************!*\
  !*** ./src/database/entities/base.entity.ts ***!
  \**********************************************/
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
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
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


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const compression_1 = __importDefault(__webpack_require__(/*! compression */ "compression"));
const express_rate_limit_1 = __importDefault(__webpack_require__(/*! express-rate-limit */ "express-rate-limit"));
const helmet_1 = __importDefault(__webpack_require__(/*! helmet */ "helmet"));
const morgan_1 = __importDefault(__webpack_require__(/*! morgan */ "morgan"));
const app_module_1 = __webpack_require__(/*! ./app.module */ "./src/app.module.ts");
const http_exception_filter_1 = __webpack_require__(/*! ./common/filters/http-exception.filter */ "./src/common/filters/http-exception.filter.ts");
const logging_interceptor_1 = __webpack_require__(/*! ./common/interceptors/logging.interceptor */ "./src/common/interceptors/logging.interceptor.ts");
const transform_interceptor_1 = __webpack_require__(/*! ./common/interceptors/transform.interceptor */ "./src/common/interceptors/transform.interceptor.ts");
const swagger_config_1 = __webpack_require__(/*! ./config/swagger.config */ "./src/config/swagger.config.ts");
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

/***/ "./src/modules/account-management/account-management.module.ts":
/*!*********************************************************************!*\
  !*** ./src/modules/account-management/account-management.module.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccountManagementModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const employee_management_module_1 = __webpack_require__(/*! ../employee-management/employee-management.module */ "./src/modules/employee-management/employee-management.module.ts");
const roles_module_1 = __webpack_require__(/*! ../employee-management/roles/roles.module */ "./src/modules/employee-management/roles/roles.module.ts");
const auth_module_1 = __webpack_require__(/*! ./auth/auth.module */ "./src/modules/account-management/auth/auth.module.ts");
const addresses_module_1 = __webpack_require__(/*! ./profiles/addresses/addresses.module */ "./src/modules/account-management/profiles/addresses/addresses.module.ts");
const profiles_module_1 = __webpack_require__(/*! ./profiles/profiles.module */ "./src/modules/account-management/profiles/profiles.module.ts");
const user_seeder_service_1 = __webpack_require__(/*! ./services/user-seeder.service */ "./src/modules/account-management/services/user-seeder.service.ts");
const sessions_module_1 = __webpack_require__(/*! ./sessions/sessions.module */ "./src/modules/account-management/sessions/sessions.module.ts");
const users_module_1 = __webpack_require__(/*! ./users/users.module */ "./src/modules/account-management/users/users.module.ts");
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
                            module: profiles_module_1.ProfilesModule,
                            children: [
                                {
                                    path: 'addresses',
                                    module: addresses_module_1.AddressesModule,
                                }
                            ]
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

/***/ "./src/modules/account-management/auth/auth.controller.ts":
/*!****************************************************************!*\
  !*** ./src/modules/account-management/auth/auth.controller.ts ***!
  \****************************************************************/
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
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const authorize_decorator_1 = __webpack_require__(/*! @/common/decorators/authorize.decorator */ "./src/common/decorators/authorize.decorator.ts");
const current_user_decorator_1 = __webpack_require__(/*! @/common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const jwt_payload_interface_1 = __webpack_require__(/*! @/common/interfaces/jwt-payload.interface */ "./src/common/interfaces/jwt-payload.interface.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const express_1 = __webpack_require__(/*! express */ "express");
const google_auth_guard_1 = __webpack_require__(/*! ../../../common/guards/google-auth.guard */ "./src/common/guards/google-auth.guard.ts");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./src/modules/account-management/auth/auth.service.ts");
const login_user_dto_1 = __webpack_require__(/*! ./dto/login-user.dto */ "./src/modules/account-management/auth/dto/login-user.dto.ts");
const register_user_dto_1 = __webpack_require__(/*! ./dto/register-user.dto */ "./src/modules/account-management/auth/dto/register-user.dto.ts");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async googleOAuth() { }
    async login(loginDto, response) {
        const login = await this.authService.loginUser(loginDto);
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
        return this.authService.registerUser(registerDto);
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
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof login_user_dto_1.LoginUserDto !== "undefined" && login_user_dto_1.LoginUserDto) === "function" ? _b : Object, typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token using refresh token' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                refresh_token: {
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
    __metadata("design:paramtypes", [String, typeof (_d = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _d : Object, typeof (_e = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _e : Object]),
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
                refresh_token: {
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
    __metadata("design:paramtypes", [String, typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object, typeof (_g = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof register_user_dto_1.RegisterUserDto !== "undefined" && register_user_dto_1.RegisterUserDto) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
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
    __metadata("design:paramtypes", [typeof (_j = typeof jwt_payload_interface_1.IJwtPayload !== "undefined" && jwt_payload_interface_1.IJwtPayload) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getCurrentUser", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ }),

/***/ "./src/modules/account-management/auth/auth.module.ts":
/*!************************************************************!*\
  !*** ./src/modules/account-management/auth/auth.module.ts ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const common_module_1 = __webpack_require__(/*! ../../../common/common.module */ "./src/common/common.module.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ../../../common/guards/jwt-auth.guard */ "./src/common/guards/jwt-auth.guard.ts");
const permissions_guard_1 = __webpack_require__(/*! ../../../common/guards/permissions.guard */ "./src/common/guards/permissions.guard.ts");
const roles_guard_1 = __webpack_require__(/*! ../../../common/guards/roles.guard */ "./src/common/guards/roles.guard.ts");
const sessions_module_1 = __webpack_require__(/*! ../sessions/sessions.module */ "./src/modules/account-management/sessions/sessions.module.ts");
const users_module_1 = __webpack_require__(/*! ../users/users.module */ "./src/modules/account-management/users/users.module.ts");
const auth_controller_1 = __webpack_require__(/*! ./auth.controller */ "./src/modules/account-management/auth/auth.controller.ts");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./src/modules/account-management/auth/auth.service.ts");
const jwt_service_1 = __webpack_require__(/*! ./services/jwt.service */ "./src/modules/account-management/auth/services/jwt.service.ts");
const access_token_strategy_1 = __webpack_require__(/*! ./strategies/access-token.strategy */ "./src/modules/account-management/auth/strategies/access-token.strategy.ts");
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

/***/ "./src/modules/account-management/auth/auth.service.ts":
/*!*************************************************************!*\
  !*** ./src/modules/account-management/auth/auth.service.ts ***!
  \*************************************************************/
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
const utility_helper_1 = __webpack_require__(/*! @/common/helpers/utility.helper */ "./src/common/helpers/utility.helper.ts");
const common_service_1 = __webpack_require__(/*! @/common/services/common.service */ "./src/common/services/common.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const bcrypt = __importStar(__webpack_require__(/*! bcrypt */ "bcrypt"));
const sessions_service_1 = __webpack_require__(/*! ../sessions/sessions.service */ "./src/modules/account-management/sessions/sessions.service.ts");
const users_service_1 = __webpack_require__(/*! ../users/users.service */ "./src/modules/account-management/users/users.service.ts");
const jwt_service_1 = __webpack_require__(/*! ./services/jwt.service */ "./src/modules/account-management/auth/services/jwt.service.ts");
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
            user = await this.usersService.findOneBy({ email: model.emailOrUserName.toLowerCase().trim() }, { employee: { roles: true } });
            if (!user) {
                return null;
            }
        }
        else {
            // check if username exists
            this.logger.log(`Validating user name: ${model.emailOrUserName}`);
            user = await this.usersService.findOneBy({ userName: model.emailOrUserName.toLowerCase().trim() }, { employee: { roles: true } });
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
        // Verify refresh token
        try {
            const payload = await this.jwtService.verifyToken(refreshToken);
            // Check if user exists
            const user = await this.usersService.findOneByOrFail({ id: payload.sub }, { employee: { roles: true } });
            // Create new tokens
            const newRefreshToken = await this.jwtService.createRefreshToken();
            const newPayload = this.jwtService.createPayload(user, newRefreshToken);
            const accessToken = await this.jwtService.createToken(newPayload);
            return {
                accessToken,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
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
        expiresAt.setMinutes(expiresAt.getMinutes() + refreshTokenExpirationMinutes);
        // save refresh token to database
        await this.sessionsService.create({
            refreshToken,
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

/***/ "./src/modules/account-management/auth/dto/login-user.dto.ts":
/*!*******************************************************************!*\
  !*** ./src/modules/account-management/auth/dto/login-user.dto.ts ***!
  \*******************************************************************/
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
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
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

/***/ "./src/modules/account-management/auth/dto/register-user.dto.ts":
/*!**********************************************************************!*\
  !*** ./src/modules/account-management/auth/dto/register-user.dto.ts ***!
  \**********************************************************************/
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
exports.RegisterUserDto = void 0;
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
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


/***/ }),

/***/ "./src/modules/account-management/auth/services/jwt.service.ts":
/*!*********************************************************************!*\
  !*** ./src/modules/account-management/auth/services/jwt.service.ts ***!
  \*********************************************************************/
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
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const uuid_1 = __webpack_require__(/*! uuid */ "uuid");
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

/***/ "./src/modules/account-management/auth/strategies/access-token.strategy.ts":
/*!*********************************************************************************!*\
  !*** ./src/modules/account-management/auth/strategies/access-token.strategy.ts ***!
  \*********************************************************************************/
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
const users_service_1 = __webpack_require__(/*! @/modules/account-management/users/users.service */ "./src/modules/account-management/users/users.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const passport_jwt_1 = __webpack_require__(/*! passport-jwt */ "passport-jwt");
const jwt_service_1 = __webpack_require__(/*! ../services/jwt.service */ "./src/modules/account-management/auth/services/jwt.service.ts");
let AccessTokenStrategy = class AccessTokenStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    constructor(configService, jwtService, userService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
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

/***/ "./src/modules/account-management/profiles/addresses/addresses.controller.ts":
/*!***********************************************************************************!*\
  !*** ./src/modules/account-management/profiles/addresses/addresses.controller.ts ***!
  \***********************************************************************************/
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
exports.AddressesController = exports.ProfilePermissions = void 0;
const base_controller_1 = __webpack_require__(/*! @/common/controllers/base.controller */ "./src/common/controllers/base.controller.ts");
const authorize_decorator_1 = __webpack_require__(/*! @/common/decorators/authorize.decorator */ "./src/common/decorators/authorize.decorator.ts");
const current_user_decorator_1 = __webpack_require__(/*! @/common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const override_decorator_1 = __webpack_require__(/*! @/common/decorators/override.decorator */ "./src/common/decorators/override.decorator.ts");
const create_permissions_utils_1 = __webpack_require__(/*! @/modules/employee-management/roles/permissions/utils/create-permissions.utils */ "./src/modules/employee-management/roles/permissions/utils/create-permissions.utils.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const addresses_service_1 = __webpack_require__(/*! ./addresses.service */ "./src/modules/account-management/profiles/addresses/addresses.service.ts");
const address_dto_1 = __webpack_require__(/*! ./dtos/address.dto */ "./src/modules/account-management/profiles/addresses/dtos/address.dto.ts");
// Controller permissions
exports.ProfilePermissions = (0, create_permissions_utils_1.createPermissions)('profiles');
const { Read, Create, Update, Delete } = exports.ProfilePermissions;
let AddressesController = class AddressesController extends base_controller_1.BaseController {
    constructor(AddressesService) {
        super(AddressesService, address_dto_1.GetAddressDto);
        this.AddressesService = AddressesService;
    }
    async create(createDto, createdById) {
        return super.create(createDto, createdById);
    }
};
exports.AddressesController = AddressesController;
__decorate([
    (0, common_1.Post)(),
    (0, authorize_decorator_1.Authorize)(),
    (0, override_decorator_1.Override)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof addresses_service_1.AddressesService !== "undefined" && addresses_service_1.AddressesService) === "function" ? _b : Object, String]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AddressesController.prototype, "create", null);
exports.AddressesController = AddressesController = __decorate([
    (0, swagger_1.ApiTags)('Addresses'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof addresses_service_1.AddressesService !== "undefined" && addresses_service_1.AddressesService) === "function" ? _a : Object])
], AddressesController);


/***/ }),

/***/ "./src/modules/account-management/profiles/addresses/addresses.module.ts":
/*!*******************************************************************************!*\
  !*** ./src/modules/account-management/profiles/addresses/addresses.module.ts ***!
  \*******************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AddressesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const users_module_1 = __webpack_require__(/*! ../../users/users.module */ "./src/modules/account-management/users/users.module.ts");
const addresses_controller_1 = __webpack_require__(/*! ./addresses.controller */ "./src/modules/account-management/profiles/addresses/addresses.controller.ts");
const addresses_service_1 = __webpack_require__(/*! ./addresses.service */ "./src/modules/account-management/profiles/addresses/addresses.service.ts");
const address_entity_1 = __webpack_require__(/*! ./entities/address.entity */ "./src/modules/account-management/profiles/addresses/entities/address.entity.ts");
let AddressesModule = class AddressesModule {
};
exports.AddressesModule = AddressesModule;
exports.AddressesModule = AddressesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([address_entity_1.Address]), users_module_1.UsersModule],
        controllers: [addresses_controller_1.AddressesController],
        providers: [addresses_service_1.AddressesService],
        exports: [addresses_service_1.AddressesService],
    })
], AddressesModule);


/***/ }),

/***/ "./src/modules/account-management/profiles/addresses/addresses.service.ts":
/*!********************************************************************************!*\
  !*** ./src/modules/account-management/profiles/addresses/addresses.service.ts ***!
  \********************************************************************************/
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
const base_service_1 = __webpack_require__(/*! @/common/services/base.service */ "./src/common/services/base.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const users_service_1 = __webpack_require__(/*! ../../users/users.service */ "./src/modules/account-management/users/users.service.ts");
const address_entity_1 = __webpack_require__(/*! ./entities/address.entity */ "./src/modules/account-management/profiles/addresses/entities/address.entity.ts");
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

/***/ "./src/modules/account-management/profiles/addresses/dtos/address.dto.ts":
/*!*******************************************************************************!*\
  !*** ./src/modules/account-management/profiles/addresses/dtos/address.dto.ts ***!
  \*******************************************************************************/
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
const create_get_dto_1 = __webpack_require__(/*! @/common/utils/create-get-dto */ "./src/common/utils/create-get-dto.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
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
class GetAddressDto extends (0, create_get_dto_1.createGetDto)(AddressDto) {
}
exports.GetAddressDto = GetAddressDto;


/***/ }),

/***/ "./src/modules/account-management/profiles/addresses/entities/address.entity.ts":
/*!**************************************************************************************!*\
  !*** ./src/modules/account-management/profiles/addresses/entities/address.entity.ts ***!
  \**************************************************************************************/
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
exports.Address = void 0;
const base_entity_1 = __webpack_require__(/*! @/database/entities/base.entity */ "./src/database/entities/base.entity.ts");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const profile_entity_1 = __webpack_require__(/*! ../../entities/profile.entity */ "./src/modules/account-management/profiles/entities/profile.entity.ts");
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
    (0, typeorm_1.OneToOne)(() => profile_entity_1.Profile, (profile) => profile.address),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", typeof (_a = typeof profile_entity_1.Profile !== "undefined" && profile_entity_1.Profile) === "function" ? _a : Object)
], Address.prototype, "profile", void 0);
exports.Address = Address = __decorate([
    (0, typeorm_1.Entity)()
], Address);


/***/ }),

/***/ "./src/modules/account-management/profiles/dtos/profile.dto.ts":
/*!*********************************************************************!*\
  !*** ./src/modules/account-management/profiles/dtos/profile.dto.ts ***!
  \*********************************************************************/
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
const create_get_dto_1 = __webpack_require__(/*! @/common/utils/create-get-dto */ "./src/common/utils/create-get-dto.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const address_dto_1 = __webpack_require__(/*! ../addresses/dtos/address.dto */ "./src/modules/account-management/profiles/addresses/dtos/address.dto.ts");
class ProfileDto {
}
exports.ProfileDto = ProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name of the profile' }),
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
    (0, swagger_1.ApiProperty)({ description: 'Birth date of the profile', required: false, type: Date }),
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
    (0, swagger_1.ApiProperty)({ description: 'Citizenships of the profile', required: false, type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProfileDto.prototype, "citizenships", void 0);
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
    (0, swagger_1.ApiProperty)({ description: 'User ID associated with the profile' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProfileDto.prototype, "userId", void 0);
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
class GetProfileDto extends (0, create_get_dto_1.createGetDto)(ProfileDto) {
}
exports.GetProfileDto = GetProfileDto;


/***/ }),

/***/ "./src/modules/account-management/profiles/entities/profile.entity.ts":
/*!****************************************************************************!*\
  !*** ./src/modules/account-management/profiles/entities/profile.entity.ts ***!
  \****************************************************************************/
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
const base_entity_1 = __webpack_require__(/*! @/database/entities/base.entity */ "./src/database/entities/base.entity.ts");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const user_entity_1 = __webpack_require__(/*! ../../users/entities/user.entity */ "./src/modules/account-management/users/entities/user.entity.ts");
const address_entity_1 = __webpack_require__(/*! ../addresses/entities/address.entity */ "./src/modules/account-management/profiles/addresses/entities/address.entity.ts");
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
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", typeof (_b = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _b : Object)
], Profile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => address_entity_1.Address, (address) => address.profile),
    __metadata("design:type", typeof (_c = typeof address_entity_1.Address !== "undefined" && address_entity_1.Address) === "function" ? _c : Object)
], Profile.prototype, "address", void 0);
exports.Profile = Profile = __decorate([
    (0, typeorm_1.Entity)()
], Profile);


/***/ }),

/***/ "./src/modules/account-management/profiles/profiles.controller.ts":
/*!************************************************************************!*\
  !*** ./src/modules/account-management/profiles/profiles.controller.ts ***!
  \************************************************************************/
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
exports.ProfilesController = exports.ProfilePermissions = void 0;
const base_controller_1 = __webpack_require__(/*! @/common/controllers/base.controller */ "./src/common/controllers/base.controller.ts");
const authorize_decorator_1 = __webpack_require__(/*! @/common/decorators/authorize.decorator */ "./src/common/decorators/authorize.decorator.ts");
const current_user_decorator_1 = __webpack_require__(/*! @/common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const override_decorator_1 = __webpack_require__(/*! @/common/decorators/override.decorator */ "./src/common/decorators/override.decorator.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const create_permissions_utils_1 = __webpack_require__(/*! ../../employee-management/roles/permissions/utils/create-permissions.utils */ "./src/modules/employee-management/roles/permissions/utils/create-permissions.utils.ts");
const profile_dto_1 = __webpack_require__(/*! ./dtos/profile.dto */ "./src/modules/account-management/profiles/dtos/profile.dto.ts");
const profiles_service_1 = __webpack_require__(/*! ./profiles.service */ "./src/modules/account-management/profiles/profiles.service.ts");
// Controller permissions
exports.ProfilePermissions = (0, create_permissions_utils_1.createPermissions)('profiles');
const { Read, Create, Update, Delete } = exports.ProfilePermissions;
let ProfilesController = class ProfilesController extends base_controller_1.BaseController {
    constructor(profilesService) {
        super(profilesService, profile_dto_1.GetProfileDto);
        this.profilesService = profilesService;
    }
    async create(createDto, createdById) {
        return super.create(createDto, createdById);
    }
};
exports.ProfilesController = ProfilesController;
__decorate([
    (0, common_1.Post)(),
    (0, authorize_decorator_1.Authorize)(),
    (0, override_decorator_1.Override)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof profile_dto_1.ProfileDto !== "undefined" && profile_dto_1.ProfileDto) === "function" ? _b : Object, String]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], ProfilesController.prototype, "create", null);
exports.ProfilesController = ProfilesController = __decorate([
    (0, swagger_1.ApiTags)('Profiles'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof profiles_service_1.ProfilesService !== "undefined" && profiles_service_1.ProfilesService) === "function" ? _a : Object])
], ProfilesController);


/***/ }),

/***/ "./src/modules/account-management/profiles/profiles.module.ts":
/*!********************************************************************!*\
  !*** ./src/modules/account-management/profiles/profiles.module.ts ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProfilesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const users_module_1 = __webpack_require__(/*! ../users/users.module */ "./src/modules/account-management/users/users.module.ts");
const profile_entity_1 = __webpack_require__(/*! ./entities/profile.entity */ "./src/modules/account-management/profiles/entities/profile.entity.ts");
const profiles_controller_1 = __webpack_require__(/*! ./profiles.controller */ "./src/modules/account-management/profiles/profiles.controller.ts");
const profiles_service_1 = __webpack_require__(/*! ./profiles.service */ "./src/modules/account-management/profiles/profiles.service.ts");
const addresses_module_1 = __webpack_require__(/*! ./addresses/addresses.module */ "./src/modules/account-management/profiles/addresses/addresses.module.ts");
let ProfilesModule = class ProfilesModule {
};
exports.ProfilesModule = ProfilesModule;
exports.ProfilesModule = ProfilesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([profile_entity_1.Profile]), users_module_1.UsersModule, addresses_module_1.AddressesModule],
        controllers: [profiles_controller_1.ProfilesController],
        providers: [profiles_service_1.ProfilesService],
        exports: [profiles_service_1.ProfilesService],
    })
], ProfilesModule);


/***/ }),

/***/ "./src/modules/account-management/profiles/profiles.service.ts":
/*!*********************************************************************!*\
  !*** ./src/modules/account-management/profiles/profiles.service.ts ***!
  \*********************************************************************/
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
const base_service_1 = __webpack_require__(/*! @/common/services/base.service */ "./src/common/services/base.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const users_service_1 = __webpack_require__(/*! ../users/users.service */ "./src/modules/account-management/users/users.service.ts");
const profile_entity_1 = __webpack_require__(/*! ./entities/profile.entity */ "./src/modules/account-management/profiles/entities/profile.entity.ts");
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

/***/ "./src/modules/account-management/services/user-seeder.service.ts":
/*!************************************************************************!*\
  !*** ./src/modules/account-management/services/user-seeder.service.ts ***!
  \************************************************************************/
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
const employment_condition_enum_1 = __webpack_require__(/*! @/common/enums/employment/employment-condition.enum */ "./src/common/enums/employment/employment-condition.enum.ts");
const employment_status_enum_1 = __webpack_require__(/*! @/common/enums/employment/employment-status.enum */ "./src/common/enums/employment/employment-status.enum.ts");
const employment_type_enum_1 = __webpack_require__(/*! @/common/enums/employment/employment-type.enum */ "./src/common/enums/employment/employment-type.enum.ts");
const role_scope_type_enum_1 = __webpack_require__(/*! @/common/enums/role-scope-type.enum */ "./src/common/enums/role-scope-type.enum.ts");
const role_enum_1 = __webpack_require__(/*! @/common/enums/role.enum */ "./src/common/enums/role.enum.ts");
const auth_service_1 = __webpack_require__(/*! @/modules/account-management/auth/auth.service */ "./src/modules/account-management/auth/auth.service.ts");
const employees_service_1 = __webpack_require__(/*! @/modules/employee-management/employees.service */ "./src/modules/employee-management/employees.service.ts");
const roles_service_1 = __webpack_require__(/*! @/modules/employee-management/roles/roles.service */ "./src/modules/employee-management/roles/roles.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const bcrypt = __importStar(__webpack_require__(/*! bcrypt */ "bcrypt"));
const users_service_1 = __webpack_require__(/*! ../users/users.service */ "./src/modules/account-management/users/users.service.ts");
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
        var _a;
        const superAdminEmail = this.configService.getOrThrow('SUPER_ADMIN_EMAIL');
        const superAdminPassword = this.configService.getOrThrow('SUPER_ADMIN_PASSWORD');
        this.logger.log('Checking if super admin role exists...');
        // Check if super admin role exists
        let superAdminRole = await this.rolesService.findOneBy({ name: role_enum_1.Role.SUPERADMIN });
        // Check if employee role exists
        let employeeRole = await this.rolesService.findOneBy({ name: role_enum_1.Role.EMPLOYEE });
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
        // find the employee with the super admin role
        let superAdminEmployee = await this.employeesService.include(e => e.roles).where(e => { var _a, _b; return (_b = (_a = e.roles) === null || _a === void 0 ? void 0 : _a.some(r => r.id === superAdminRole.id)) !== null && _b !== void 0 ? _b : false; }).firstOrDefault();
        // log super admin employee
        console.log(JSON.stringify(superAdminEmployee, null, 2));
        if (superAdminEmployee) {
            this.logger.log('Super admin employee already exists');
        }
        else {
            // find the user with the employee number SA-001
            superAdminEmployee = await this.employeesService.findOneBy({ employeeNumber: 'SA-001' });
            if (superAdminEmployee) {
                this.logger.warn('Super admin employee exists but is not associated with the super admin role');
                superAdminEmployee.roles = [superAdminRole, employeeRole];
                await this.employeesService.update(superAdminEmployee.id, superAdminEmployee);
                this.logger.log('Super admin employee associated with the super admin role successfully');
            }
            else {
                this.logger.log('Creating super admin employee...');
                superAdminEmployee = await this.employeesService.create({
                    employeeNumber: 'SA-001',
                    employmentStatus: employment_status_enum_1.EmploymentStatus.ACTIVE,
                    employmentCondition: employment_condition_enum_1.EmploymentCondition.REGULAR,
                    employmentType: employment_type_enum_1.EmploymentType.FULL_TIME,
                    commencementDate: new Date(),
                    roles: [superAdminRole, employeeRole],
                });
                this.logger.log('Super admin employee created successfully');
            }
        }
        // Check if super admin user exists
        let superAdminExists = await this.usersService.include(u => u.employee).where(u => { var _a; return ((_a = u.employee) === null || _a === void 0 ? void 0 : _a.id) === superAdminEmployee.id; }).firstOrDefault();
        if (!superAdminExists) {
            // Check if super admin user exists with the super admin email
            superAdminExists = await this.usersService.findOneBy({ email: superAdminEmail });
            if (superAdminExists) {
                this.logger.warn('Super admin user exists but is not associated with the super admin employee');
                superAdminExists.employee = superAdminEmployee;
                await this.usersService.update(superAdminExists.id, superAdminExists);
                this.logger.log('Super admin user associated with the super admin employee successfully');
            }
            else {
                this.logger.log('Creating super admin user...');
                // create super admin user
                superAdminExists = await this.usersService.create({
                    email: superAdminEmail,
                    password: await bcrypt.hash(superAdminPassword, 10),
                    userName: superAdminEmail,
                    employee: superAdminEmployee
                });
                // update super admin employee with the super admin user
                superAdminEmployee.user = superAdminExists;
                await this.employeesService.update(superAdminEmployee.id, superAdminEmployee);
                this.logger.log('Super admin user created successfully');
            }
        }
        else {
            this.logger.log('Super admin user already exists');
            // Check if super admin email is the same as the one in the config
            if (superAdminExists.email !== superAdminEmail) {
                this.logger.warn('Super admin email is different from the one in the config');
                // Update super admin email to the one in the config
                superAdminExists.email = superAdminEmail;
                await this.usersService.update(superAdminExists.id, superAdminExists);
                this.logger.log('Super admin email updated successfully');
            }
            // check if password is the same as the one in the config
            var loginCredentials = {
                emailOrUserName: (_a = superAdminExists.email) !== null && _a !== void 0 ? _a : "",
                password: superAdminPassword
            };
            if (await this.authService.validateUser(loginCredentials)) {
                this.logger.log('Super admin password is the same as the one in the config');
            }
            else {
                this.logger.warn('Super admin password is different from the one in the config');
                // Update super admin password to the one in the config
                superAdminExists.password = await bcrypt.hash(superAdminPassword, 10);
                await this.usersService.update(superAdminExists.id, superAdminExists);
                this.logger.log('Super admin password updated successfully');
            }
        }
    }
};
exports.UserSeederService = UserSeederService;
exports.UserSeederService = UserSeederService = UserSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object, typeof (_b = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _b : Object, typeof (_c = typeof roles_service_1.RolesService !== "undefined" && roles_service_1.RolesService) === "function" ? _c : Object, typeof (_d = typeof employees_service_1.EmployeesService !== "undefined" && employees_service_1.EmployeesService) === "function" ? _d : Object, typeof (_e = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _e : Object])
], UserSeederService);


/***/ }),

/***/ "./src/modules/account-management/sessions/dtos/session.dto.ts":
/*!*********************************************************************!*\
  !*** ./src/modules/account-management/sessions/dtos/session.dto.ts ***!
  \*********************************************************************/
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
const create_get_dto_1 = __webpack_require__(/*! @/common/utils/create-get-dto */ "./src/common/utils/create-get-dto.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class SessionDto {
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
class GetSessionDto extends (0, create_get_dto_1.createGetDto)(SessionDto) {
}
exports.GetSessionDto = GetSessionDto;


/***/ }),

/***/ "./src/modules/account-management/sessions/entities/session.entity.ts":
/*!****************************************************************************!*\
  !*** ./src/modules/account-management/sessions/entities/session.entity.ts ***!
  \****************************************************************************/
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
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! ../../../../database/entities/base.entity */ "./src/database/entities/base.entity.ts");
const user_entity_1 = __webpack_require__(/*! ../../users/entities/user.entity */ "./src/modules/account-management/users/entities/user.entity.ts");
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
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)(),
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
    (0, typeorm_1.Entity)()
], Session);


/***/ }),

/***/ "./src/modules/account-management/sessions/sessions.controller.ts":
/*!************************************************************************!*\
  !*** ./src/modules/account-management/sessions/sessions.controller.ts ***!
  \************************************************************************/
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
exports.SessionsController = void 0;
const base_controller_1 = __webpack_require__(/*! @/common/controllers/base.controller */ "./src/common/controllers/base.controller.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const session_dto_1 = __webpack_require__(/*! ./dtos/session.dto */ "./src/modules/account-management/sessions/dtos/session.dto.ts");
const sessions_service_1 = __webpack_require__(/*! ./sessions.service */ "./src/modules/account-management/sessions/sessions.service.ts");
let SessionsController = class SessionsController extends base_controller_1.BaseController {
    constructor(sessionsService) {
        super(sessionsService, session_dto_1.GetSessionDto);
        this.sessionsService = sessionsService;
    }
};
exports.SessionsController = SessionsController;
exports.SessionsController = SessionsController = __decorate([
    (0, swagger_1.ApiTags)('Sessions'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof sessions_service_1.SessionsService !== "undefined" && sessions_service_1.SessionsService) === "function" ? _a : Object])
], SessionsController);


/***/ }),

/***/ "./src/modules/account-management/sessions/sessions.module.ts":
/*!********************************************************************!*\
  !*** ./src/modules/account-management/sessions/sessions.module.ts ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const users_module_1 = __webpack_require__(/*! ../users/users.module */ "./src/modules/account-management/users/users.module.ts");
const session_entity_1 = __webpack_require__(/*! ./entities/session.entity */ "./src/modules/account-management/sessions/entities/session.entity.ts");
const sessions_controller_1 = __webpack_require__(/*! ./sessions.controller */ "./src/modules/account-management/sessions/sessions.controller.ts");
const sessions_service_1 = __webpack_require__(/*! ./sessions.service */ "./src/modules/account-management/sessions/sessions.service.ts");
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

/***/ "./src/modules/account-management/sessions/sessions.service.ts":
/*!*********************************************************************!*\
  !*** ./src/modules/account-management/sessions/sessions.service.ts ***!
  \*********************************************************************/
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
const base_service_1 = __webpack_require__(/*! @/common/services/base.service */ "./src/common/services/base.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const users_service_1 = __webpack_require__(/*! ../users/users.service */ "./src/modules/account-management/users/users.service.ts");
const session_entity_1 = __webpack_require__(/*! ./entities/session.entity */ "./src/modules/account-management/sessions/entities/session.entity.ts");
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

/***/ "./src/modules/account-management/users/dtos/suspend-user.dto.ts":
/*!***********************************************************************!*\
  !*** ./src/modules/account-management/users/dtos/suspend-user.dto.ts ***!
  \***********************************************************************/
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
exports.SuspendUserDto = void 0;
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class SuspendUserDto {
}
exports.SuspendUserDto = SuspendUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com', description: 'The email of the user' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], SuspendUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Indicates if the user account is active' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], SuspendUserDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-01T00:00:00Z', description: 'The start time of account suspension', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], SuspendUserDto.prototype, "suspensionStart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-02T00:00:00Z', description: 'The end time of account suspension', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], SuspendUserDto.prototype, "suspensionEnd", void 0);


/***/ }),

/***/ "./src/modules/account-management/users/dtos/update-user.dto.ts":
/*!**********************************************************************!*\
  !*** ./src/modules/account-management/users/dtos/update-user.dto.ts ***!
  \**********************************************************************/
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
exports.UpdateUserDto = void 0;
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const suspend_user_dto_1 = __webpack_require__(/*! ./suspend-user.dto */ "./src/modules/account-management/users/dtos/suspend-user.dto.ts");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
class UpdateUserDto extends suspend_user_dto_1.SuspendUserDto {
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The unique identifier of the user' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John', description: 'The first name of the user' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe', description: 'The last name of the user' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+1234567890', description: 'The phone number of the user', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Main St, Anytown, USA', description: 'The address of the user', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'male', description: 'The gender of the user', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/profile.jpg', description: 'The URL of the user\'s profile picture', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "profilePicture", void 0);


/***/ }),

/***/ "./src/modules/account-management/users/dtos/user.dto.ts":
/*!***************************************************************!*\
  !*** ./src/modules/account-management/users/dtos/user.dto.ts ***!
  \***************************************************************/
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
exports.GetUserDto = void 0;
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const update_user_dto_1 = __webpack_require__(/*! ./update-user.dto */ "./src/modules/account-management/users/dtos/update-user.dto.ts");
class GetUserDto extends update_user_dto_1.UpdateUserDto {
    constructor(partial) {
        super();
        Object.assign(this, partial);
    }
}
exports.GetUserDto = GetUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'google', description: 'The provider of the user', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], GetUserDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'googleId', description: 'The provider ID of the user', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], GetUserDto.prototype, "providerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-01T00:00:00Z', description: 'The last login time of the user', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], GetUserDto.prototype, "lastLogin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, description: 'The number of failed login attempts' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], GetUserDto.prototype, "accessFailedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        description: 'The refresh token of the user',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], GetUserDto.prototype, "refreshToken", void 0);


/***/ }),

/***/ "./src/modules/account-management/users/entities/user.entity.ts":
/*!**********************************************************************!*\
  !*** ./src/modules/account-management/users/entities/user.entity.ts ***!
  \**********************************************************************/
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
const employee_entity_1 = __webpack_require__(/*! @/modules/employee-management/entities/employee.entity */ "./src/modules/employee-management/entities/employee.entity.ts");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const base_entity_1 = __webpack_require__(/*! ../../../../database/entities/base.entity */ "./src/database/entities/base.entity.ts");
const profile_entity_1 = __webpack_require__(/*! ../../profiles/entities/profile.entity */ "./src/modules/account-management/profiles/entities/profile.entity.ts");
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
    (0, typeorm_1.OneToOne)(() => employee_entity_1.Employee, (employee) => employee.user),
    __metadata("design:type", typeof (_e = typeof employee_entity_1.Employee !== "undefined" && employee_entity_1.Employee) === "function" ? _e : Object)
], User.prototype, "employee", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);


/***/ }),

/***/ "./src/modules/account-management/users/users.controller.ts":
/*!******************************************************************!*\
  !*** ./src/modules/account-management/users/users.controller.ts ***!
  \******************************************************************/
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
exports.UsersController = void 0;
const base_controller_1 = __webpack_require__(/*! @/common/controllers/base.controller */ "./src/common/controllers/base.controller.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const user_dto_1 = __webpack_require__(/*! ./dtos/user.dto */ "./src/modules/account-management/users/dtos/user.dto.ts");
const users_service_1 = __webpack_require__(/*! ./users.service */ "./src/modules/account-management/users/users.service.ts");
let UsersController = class UsersController extends base_controller_1.BaseController {
    constructor(usersService) {
        super(usersService, user_dto_1.GetUserDto);
        this.usersService = usersService;
    }
};
exports.UsersController = UsersController;
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object])
], UsersController);


/***/ }),

/***/ "./src/modules/account-management/users/users.module.ts":
/*!**************************************************************!*\
  !*** ./src/modules/account-management/users/users.module.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const user_entity_1 = __webpack_require__(/*! ./entities/user.entity */ "./src/modules/account-management/users/entities/user.entity.ts");
const users_controller_1 = __webpack_require__(/*! ./users.controller */ "./src/modules/account-management/users/users.controller.ts");
const users_service_1 = __webpack_require__(/*! ./users.service */ "./src/modules/account-management/users/users.service.ts");
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

/***/ "./src/modules/account-management/users/users.service.ts":
/*!***************************************************************!*\
  !*** ./src/modules/account-management/users/users.service.ts ***!
  \***************************************************************/
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
const base_service_1 = __webpack_require__(/*! @/common/services/base.service */ "./src/common/services/base.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const bcrypt = __importStar(__webpack_require__(/*! bcryptjs */ "bcryptjs"));
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const user_dto_1 = __webpack_require__(/*! ./dtos/user.dto */ "./src/modules/account-management/users/dtos/user.dto.ts");
const user_entity_1 = __webpack_require__(/*! ./entities/user.entity */ "./src/modules/account-management/users/entities/user.entity.ts");
let UsersService = class UsersService extends base_service_1.BaseService {
    constructor(userRepository) {
        super(userRepository, null);
        this.userRepository = userRepository;
    }
    async signUpUser(model) {
        const hashedPassword = await bcrypt.hash(model.password, 10);
        const user = this.create(Object.assign(Object.assign({}, model), { password: hashedPassword, userName: model.userName.toLowerCase().trim(), email: model.email.toLowerCase().trim() }));
        const userDto = (0, class_transformer_1.plainToInstance)(user_dto_1.GetUserDto, user);
        return { message: 'Account created successfully!', data: userDto };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], UsersService);


/***/ }),

/***/ "./src/modules/attendance-management/attendance-management.module.ts":
/*!***************************************************************************!*\
  !*** ./src/modules/attendance-management/attendance-management.module.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttendanceManagementModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const attendances_module_1 = __webpack_require__(/*! ./attendances/attendances.module */ "./src/modules/attendance-management/attendances/attendances.module.ts");
const work_hours_module_1 = __webpack_require__(/*! ./work-hours/work-hours.module */ "./src/modules/attendance-management/work-hours/work-hours.module.ts");
let AttendanceManagementModule = class AttendanceManagementModule {
};
exports.AttendanceManagementModule = AttendanceManagementModule;
exports.AttendanceManagementModule = AttendanceManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [attendances_module_1.AttendancesModule, work_hours_module_1.WorkHoursModule]
    })
], AttendanceManagementModule);


/***/ }),

/***/ "./src/modules/attendance-management/attendances/attendances.module.ts":
/*!*****************************************************************************!*\
  !*** ./src/modules/attendance-management/attendances/attendances.module.ts ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AttendancesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let AttendancesModule = class AttendancesModule {
};
exports.AttendancesModule = AttendancesModule;
exports.AttendancesModule = AttendancesModule = __decorate([
    (0, common_1.Module)({})
], AttendancesModule);


/***/ }),

/***/ "./src/modules/attendance-management/work-hours/work-hours.module.ts":
/*!***************************************************************************!*\
  !*** ./src/modules/attendance-management/work-hours/work-hours.module.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkHoursModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let WorkHoursModule = class WorkHoursModule {
};
exports.WorkHoursModule = WorkHoursModule;
exports.WorkHoursModule = WorkHoursModule = __decorate([
    (0, common_1.Module)({})
], WorkHoursModule);


/***/ }),

/***/ "./src/modules/documents/documents.module.ts":
/*!***************************************************!*\
  !*** ./src/modules/documents/documents.module.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let DocumentsModule = class DocumentsModule {
};
exports.DocumentsModule = DocumentsModule;
exports.DocumentsModule = DocumentsModule = __decorate([
    (0, common_1.Module)({})
], DocumentsModule);


/***/ }),

/***/ "./src/modules/employee-management/dtos/employee.dto.ts":
/*!**************************************************************!*\
  !*** ./src/modules/employee-management/dtos/employee.dto.ts ***!
  \**************************************************************/
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
const employment_condition_enum_1 = __webpack_require__(/*! @/common/enums/employment/employment-condition.enum */ "./src/common/enums/employment/employment-condition.enum.ts");
const employment_status_enum_1 = __webpack_require__(/*! @/common/enums/employment/employment-status.enum */ "./src/common/enums/employment/employment-status.enum.ts");
const employment_type_enum_1 = __webpack_require__(/*! @/common/enums/employment/employment-type.enum */ "./src/common/enums/employment/employment-type.enum.ts");
const create_get_dto_1 = __webpack_require__(/*! @/common/utils/create-get-dto */ "./src/common/utils/create-get-dto.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class EmployeeDto {
}
exports.EmployeeDto = EmployeeDto;
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
        description: 'IDs of roles assigned to the employee',
        type: [String],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], EmployeeDto.prototype, "roleIds", void 0);
class UpdateEmployeeDto extends (0, swagger_1.PartialType)(EmployeeDto) {
}
exports.UpdateEmployeeDto = UpdateEmployeeDto;
class GetEmployeeDto extends (0, create_get_dto_1.createGetDto)(EmployeeDto) {
}
exports.GetEmployeeDto = GetEmployeeDto;


/***/ }),

/***/ "./src/modules/employee-management/employee-management.module.ts":
/*!***********************************************************************!*\
  !*** ./src/modules/employee-management/employee-management.module.ts ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmployeeManagementModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const users_module_1 = __webpack_require__(/*! ../account-management/users/users.module */ "./src/modules/account-management/users/users.module.ts");
const employees_controller_1 = __webpack_require__(/*! ./employees.controller */ "./src/modules/employee-management/employees.controller.ts");
const employees_service_1 = __webpack_require__(/*! ./employees.service */ "./src/modules/employee-management/employees.service.ts");
const employee_entity_1 = __webpack_require__(/*! ./entities/employee.entity */ "./src/modules/employee-management/entities/employee.entity.ts");
const permissions_module_1 = __webpack_require__(/*! ./roles/permissions/permissions.module */ "./src/modules/employee-management/roles/permissions/permissions.module.ts");
const roles_module_1 = __webpack_require__(/*! ./roles/roles.module */ "./src/modules/employee-management/roles/roles.module.ts");
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
                    path: 'employee',
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

/***/ "./src/modules/employee-management/employees.controller.ts":
/*!*****************************************************************!*\
  !*** ./src/modules/employee-management/employees.controller.ts ***!
  \*****************************************************************/
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
exports.EmployeesController = exports.EmployeesPermission = void 0;
const base_controller_1 = __webpack_require__(/*! @/common/controllers/base.controller */ "./src/common/controllers/base.controller.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const employee_dto_1 = __webpack_require__(/*! ./dtos/employee.dto */ "./src/modules/employee-management/dtos/employee.dto.ts");
const employees_service_1 = __webpack_require__(/*! ./employees.service */ "./src/modules/employee-management/employees.service.ts");
const create_permissions_utils_1 = __webpack_require__(/*! ./roles/permissions/utils/create-permissions.utils */ "./src/modules/employee-management/roles/permissions/utils/create-permissions.utils.ts");
// Controller permissions
exports.EmployeesPermission = (0, create_permissions_utils_1.createPermissions)('employees');
const { Read, Create, Update, Delete } = exports.EmployeesPermission;
let EmployeesController = class EmployeesController extends base_controller_1.BaseController {
    constructor(employeesService) {
        super(employeesService, employee_dto_1.GetEmployeeDto);
        this.employeesService = employeesService;
    }
};
exports.EmployeesController = EmployeesController;
exports.EmployeesController = EmployeesController = __decorate([
    (0, swagger_1.ApiTags)('Employees'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof employees_service_1.EmployeesService !== "undefined" && employees_service_1.EmployeesService) === "function" ? _a : Object])
], EmployeesController);


/***/ }),

/***/ "./src/modules/employee-management/employees.service.ts":
/*!**************************************************************!*\
  !*** ./src/modules/employee-management/employees.service.ts ***!
  \**************************************************************/
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
exports.EmployeesService = void 0;
const base_service_1 = __webpack_require__(/*! @/common/services/base.service */ "./src/common/services/base.service.ts");
const users_service_1 = __webpack_require__(/*! @/modules/account-management/users/users.service */ "./src/modules/account-management/users/users.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const employee_entity_1 = __webpack_require__(/*! ./entities/employee.entity */ "./src/modules/employee-management/entities/employee.entity.ts");
let EmployeesService = class EmployeesService extends base_service_1.BaseService {
    constructor(employeesRepository, usersService) {
        super(employeesRepository, usersService);
        this.employeesRepository = employeesRepository;
        this.usersService = usersService;
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], EmployeesService);


/***/ }),

/***/ "./src/modules/employee-management/entities/employee.entity.ts":
/*!*********************************************************************!*\
  !*** ./src/modules/employee-management/entities/employee.entity.ts ***!
  \*********************************************************************/
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
const employment_condition_enum_1 = __webpack_require__(/*! @/common/enums/employment/employment-condition.enum */ "./src/common/enums/employment/employment-condition.enum.ts");
const employment_status_enum_1 = __webpack_require__(/*! @/common/enums/employment/employment-status.enum */ "./src/common/enums/employment/employment-status.enum.ts");
const employment_type_enum_1 = __webpack_require__(/*! @/common/enums/employment/employment-type.enum */ "./src/common/enums/employment/employment-type.enum.ts");
const base_entity_1 = __webpack_require__(/*! @/database/entities/base.entity */ "./src/database/entities/base.entity.ts");
const user_entity_1 = __webpack_require__(/*! @/modules/account-management/users/entities/user.entity */ "./src/modules/account-management/users/entities/user.entity.ts");
const role_entity_1 = __webpack_require__(/*! @/modules/employee-management/roles/entities/role.entity */ "./src/modules/employee-management/roles/entities/role.entity.ts");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
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
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.employee),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }) // Foreign key column
    ,
    __metadata("design:type", typeof (_e = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _e : Object)
], Employee.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => role_entity_1.Role, (role) => role.employees),
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

/***/ "./src/modules/employee-management/roles/dtos/role.dto.ts":
/*!****************************************************************!*\
  !*** ./src/modules/employee-management/roles/dtos/role.dto.ts ***!
  \****************************************************************/
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
const role_scope_type_enum_1 = __webpack_require__(/*! @/common/enums/role-scope-type.enum */ "./src/common/enums/role-scope-type.enum.ts");
const create_get_dto_1 = __webpack_require__(/*! @/common/utils/create-get-dto */ "./src/common/utils/create-get-dto.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class RoleDto {
    constructor() {
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
    (0, swagger_1.ApiPropertyOptional)({
        description: 'List of permission IDs to associate with this role',
        type: [String],
        example: ['uuid1', 'uuid2'],
    }),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], RoleDto.prototype, "permissionIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'List of user IDs to assign this role to',
        type: [String],
        example: ['uuid1', 'uuid2'],
    }),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], RoleDto.prototype, "userIds", void 0);
class UpdateRoleDto extends (0, swagger_1.PartialType)(RoleDto) {
}
exports.UpdateRoleDto = UpdateRoleDto;
class GetRoleDto extends (0, create_get_dto_1.createGetDto)(RoleDto) {
}
exports.GetRoleDto = GetRoleDto;


/***/ }),

/***/ "./src/modules/employee-management/roles/entities/role.entity.ts":
/*!***********************************************************************!*\
  !*** ./src/modules/employee-management/roles/entities/role.entity.ts ***!
  \***********************************************************************/
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
const role_scope_type_enum_1 = __webpack_require__(/*! @/common/enums/role-scope-type.enum */ "./src/common/enums/role-scope-type.enum.ts");
const base_entity_1 = __webpack_require__(/*! @/database/entities/base.entity */ "./src/database/entities/base.entity.ts");
const permission_entity_1 = __webpack_require__(/*! @/modules/employee-management/roles/permissions/entities/permission.entity */ "./src/modules/employee-management/roles/permissions/entities/permission.entity.ts");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const employee_entity_1 = __webpack_require__(/*! ../../entities/employee.entity */ "./src/modules/employee-management/entities/employee.entity.ts");
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
    (0, typeorm_1.ManyToMany)(() => permission_entity_1.Permission, (permission) => permission.roles, { nullable: true }),
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
exports.Role = Role = __decorate([
    (0, typeorm_1.Entity)('roles')
], Role);


/***/ }),

/***/ "./src/modules/employee-management/roles/permissions/dtos/get-permission.dto.ts":
/*!**************************************************************************************!*\
  !*** ./src/modules/employee-management/roles/permissions/dtos/get-permission.dto.ts ***!
  \**************************************************************************************/
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
exports.GetPermissionDto = exports.PermissionDto = void 0;
const action_enum_1 = __webpack_require__(/*! @/common/enums/action.enum */ "./src/common/enums/action.enum.ts");
const create_get_dto_1 = __webpack_require__(/*! @/common/utils/create-get-dto */ "./src/common/utils/create-get-dto.ts");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
let PermissionDto = class PermissionDto {
};
exports.PermissionDto = PermissionDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ description: 'Permission name', required: false }),
    __metadata("design:type", String)
], PermissionDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ description: 'Permission description', required: false }),
    __metadata("design:type", String)
], PermissionDto.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({
        description: 'The action this permission grants',
        enum: action_enum_1.Action,
        enumName: 'Action'
    }),
    __metadata("design:type", typeof (_a = typeof action_enum_1.Action !== "undefined" && action_enum_1.Action) === "function" ? _a : Object)
], PermissionDto.prototype, "action", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ description: 'The subject this permission applies to' }),
    __metadata("design:type", String)
], PermissionDto.prototype, "subject", void 0);
exports.PermissionDto = PermissionDto = __decorate([
    (0, class_transformer_1.Exclude)()
], PermissionDto);
class GetPermissionDto extends (0, create_get_dto_1.createGetDto)(PermissionDto) {
}
exports.GetPermissionDto = GetPermissionDto;


/***/ }),

/***/ "./src/modules/employee-management/roles/permissions/entities/permission.entity.ts":
/*!*****************************************************************************************!*\
  !*** ./src/modules/employee-management/roles/permissions/entities/permission.entity.ts ***!
  \*****************************************************************************************/
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
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const action_enum_1 = __webpack_require__(/*! ../../../../../common/enums/action.enum */ "./src/common/enums/action.enum.ts");
const base_entity_1 = __webpack_require__(/*! ../../../../../database/entities/base.entity */ "./src/database/entities/base.entity.ts");
const role_entity_1 = __webpack_require__(/*! ../../entities/role.entity */ "./src/modules/employee-management/roles/entities/role.entity.ts");
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
    (0, typeorm_1.Entity)()
], Permission);


/***/ }),

/***/ "./src/modules/employee-management/roles/permissions/permissions.controller.ts":
/*!*************************************************************************************!*\
  !*** ./src/modules/employee-management/roles/permissions/permissions.controller.ts ***!
  \*************************************************************************************/
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
exports.PermissionsController = exports.PermissionPermissions = void 0;
const base_controller_1 = __webpack_require__(/*! @/common/controllers/base.controller */ "./src/common/controllers/base.controller.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const get_permission_dto_1 = __webpack_require__(/*! ./dtos/get-permission.dto */ "./src/modules/employee-management/roles/permissions/dtos/get-permission.dto.ts");
const permissions_service_1 = __webpack_require__(/*! ./permissions.service */ "./src/modules/employee-management/roles/permissions/permissions.service.ts");
const create_permissions_utils_1 = __webpack_require__(/*! ./utils/create-permissions.utils */ "./src/modules/employee-management/roles/permissions/utils/create-permissions.utils.ts");
// Controller permissions
exports.PermissionPermissions = (0, create_permissions_utils_1.createPermissions)('permissions');
const { Read, Create, Update, Delete } = exports.PermissionPermissions;
let PermissionsController = class PermissionsController extends base_controller_1.BaseController {
    constructor(permissionsService) {
        super(permissionsService, get_permission_dto_1.GetPermissionDto);
        this.permissionsService = permissionsService;
    }
    async delete(id) {
        await super.delete(id);
    }
    async deleteMany(ids, hardDelete) {
        await super.deleteMany(ids, hardDelete);
    }
};
exports.PermissionsController = PermissionsController;
exports.PermissionsController = PermissionsController = __decorate([
    (0, swagger_1.ApiTags)('Permissions'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof permissions_service_1.PermissionsService !== "undefined" && permissions_service_1.PermissionsService) === "function" ? _a : Object])
], PermissionsController);


/***/ }),

/***/ "./src/modules/employee-management/roles/permissions/permissions.module.ts":
/*!*********************************************************************************!*\
  !*** ./src/modules/employee-management/roles/permissions/permissions.module.ts ***!
  \*********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const users_module_1 = __webpack_require__(/*! ../../../account-management/users/users.module */ "./src/modules/account-management/users/users.module.ts");
const roles_module_1 = __webpack_require__(/*! ../roles.module */ "./src/modules/employee-management/roles/roles.module.ts");
const permission_entity_1 = __webpack_require__(/*! ./entities/permission.entity */ "./src/modules/employee-management/roles/permissions/entities/permission.entity.ts");
const permissions_controller_1 = __webpack_require__(/*! ./permissions.controller */ "./src/modules/employee-management/roles/permissions/permissions.controller.ts");
const permissions_service_1 = __webpack_require__(/*! ./permissions.service */ "./src/modules/employee-management/roles/permissions/permissions.service.ts");
const permission_seeder_service_1 = __webpack_require__(/*! ./services/permission-seeder.service */ "./src/modules/employee-management/roles/permissions/services/permission-seeder.service.ts");
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

/***/ "./src/modules/employee-management/roles/permissions/permissions.service.ts":
/*!**********************************************************************************!*\
  !*** ./src/modules/employee-management/roles/permissions/permissions.service.ts ***!
  \**********************************************************************************/
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
const base_service_1 = __webpack_require__(/*! @/common/services/base.service */ "./src/common/services/base.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const users_service_1 = __webpack_require__(/*! ../../../account-management/users/users.service */ "./src/modules/account-management/users/users.service.ts");
const roles_service_1 = __webpack_require__(/*! ../roles.service */ "./src/modules/employee-management/roles/roles.service.ts");
const permission_entity_1 = __webpack_require__(/*! ./entities/permission.entity */ "./src/modules/employee-management/roles/permissions/entities/permission.entity.ts");
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

/***/ "./src/modules/employee-management/roles/permissions/services/permission-seeder.service.ts":
/*!*************************************************************************************************!*\
  !*** ./src/modules/employee-management/roles/permissions/services/permission-seeder.service.ts ***!
  \*************************************************************************************************/
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
const action_enum_1 = __webpack_require__(/*! @/common/enums/action.enum */ "./src/common/enums/action.enum.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
const glob_1 = __webpack_require__(/*! glob */ "glob");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const permission_entity_1 = __webpack_require__(/*! ../entities/permission.entity */ "./src/modules/employee-management/roles/permissions/entities/permission.entity.ts");
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
            // Find createPermissions calls
            const permissionsMatches = fileContent.match(/const\s+Permissions\s*=\s*createPermissions\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
            if (permissionsMatches) {
                for (const permMatch of permissionsMatches) {
                    // Extract resource name
                    const resourceMatch = permMatch.match(/createPermissions\s*\(\s*['"]([^'"]+)['"]\s*\)/);
                    if (resourceMatch && resourceMatch[1]) {
                        const subject = resourceMatch[1];
                        // Find all @Authorize decorators
                        const authorizeRegex = /@Authorize\s*\(\s*\{[^}]*permissions\s*:\s*\[\s*([\s\S]*?)\s*\]/g;
                        const authorizeMatches = [...fileContent.matchAll(authorizeRegex)];
                        if (authorizeMatches.length) {
                            for (const authMatch of authorizeMatches) {
                                if (authMatch[1]) {
                                    // Extract permission references
                                    const permRefs = authMatch[1].split(',').map(p => p.trim());
                                    for (const permRef of permRefs) {
                                        // Match Permissions.Action pattern
                                        const actionMatch = permRef.match(/Permissions\.(\w+)/);
                                        if (actionMatch && actionMatch[1]) {
                                            const action = this.mapActionNameToEnum(actionMatch[1]);
                                            permissions.push({
                                                action,
                                                subject,
                                                name: `${actionMatch[1]} ${subject}`,
                                                description: `Permission to ${actionMatch[1].toLowerCase()} ${subject}`
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return this.removeDuplicates(permissions);
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

/***/ "./src/modules/employee-management/roles/permissions/utils/create-permissions.utils.ts":
/*!*********************************************************************************************!*\
  !*** ./src/modules/employee-management/roles/permissions/utils/create-permissions.utils.ts ***!
  \*********************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createPermissions = void 0;
const action_enum_1 = __webpack_require__(/*! @/common/enums/action.enum */ "./src/common/enums/action.enum.ts");
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

/***/ "./src/modules/employee-management/roles/roles.controller.ts":
/*!*******************************************************************!*\
  !*** ./src/modules/employee-management/roles/roles.controller.ts ***!
  \*******************************************************************/
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
const base_controller_1 = __webpack_require__(/*! @/common/controllers/base.controller */ "./src/common/controllers/base.controller.ts");
const current_user_decorator_1 = __webpack_require__(/*! @/common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const override_decorator_1 = __webpack_require__(/*! @/common/decorators/override.decorator */ "./src/common/decorators/override.decorator.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const role_dto_1 = __webpack_require__(/*! ./dtos/role.dto */ "./src/modules/employee-management/roles/dtos/role.dto.ts");
const create_permissions_utils_1 = __webpack_require__(/*! ./permissions/utils/create-permissions.utils */ "./src/modules/employee-management/roles/permissions/utils/create-permissions.utils.ts");
const roles_service_1 = __webpack_require__(/*! ./roles.service */ "./src/modules/employee-management/roles/roles.service.ts");
// Controller permissions
const Permissions = (0, create_permissions_utils_1.createPermissions)('roles');
let RolesController = class RolesController extends base_controller_1.BaseController {
    constructor(rolesService) {
        super(rolesService, role_dto_1.GetRoleDto);
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

/***/ "./src/modules/employee-management/roles/roles.module.ts":
/*!***************************************************************!*\
  !*** ./src/modules/employee-management/roles/roles.module.ts ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const users_module_1 = __webpack_require__(/*! ../../account-management/users/users.module */ "./src/modules/account-management/users/users.module.ts");
const role_entity_1 = __webpack_require__(/*! ./entities/role.entity */ "./src/modules/employee-management/roles/entities/role.entity.ts");
const roles_controller_1 = __webpack_require__(/*! ./roles.controller */ "./src/modules/employee-management/roles/roles.controller.ts");
const roles_service_1 = __webpack_require__(/*! ./roles.service */ "./src/modules/employee-management/roles/roles.service.ts");
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

/***/ "./src/modules/employee-management/roles/roles.service.ts":
/*!****************************************************************!*\
  !*** ./src/modules/employee-management/roles/roles.service.ts ***!
  \****************************************************************/
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
const base_service_1 = __webpack_require__(/*! @/common/services/base.service */ "./src/common/services/base.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const users_service_1 = __webpack_require__(/*! ../../account-management/users/users.service */ "./src/modules/account-management/users/users.service.ts");
const role_entity_1 = __webpack_require__(/*! ./entities/role.entity */ "./src/modules/employee-management/roles/entities/role.entity.ts");
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

/***/ "./src/modules/files/config/file-provider.config.ts":
/*!**********************************************************!*\
  !*** ./src/modules/files/config/file-provider.config.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fileProviders = exports.fileProviderConfig = exports.FILE_SERVICE = void 0;
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const local_file_service_1 = __webpack_require__(/*! ../services/local-file.service */ "./src/modules/files/services/local-file.service.ts");
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

/***/ "./src/modules/files/files.module.ts":
/*!*******************************************!*\
  !*** ./src/modules/files/files.module.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FilesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const file_provider_config_1 = __webpack_require__(/*! ./config/file-provider.config */ "./src/modules/files/config/file-provider.config.ts");
let FilesModule = class FilesModule {
};
exports.FilesModule = FilesModule;
exports.FilesModule = FilesModule = __decorate([
    (0, common_1.Module)({
        providers: [...file_provider_config_1.fileProviders],
    })
], FilesModule);


/***/ }),

/***/ "./src/modules/files/services/base-file.service.ts":
/*!*********************************************************!*\
  !*** ./src/modules/files/services/base-file.service.ts ***!
  \*********************************************************/
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseFileService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const crypto = __importStar(__webpack_require__(/*! crypto */ "crypto"));
const csv_writer_1 = __webpack_require__(/*! csv-writer */ "csv-writer");
const ExcelJS = __importStar(__webpack_require__(/*! exceljs */ "exceljs"));
const path = __importStar(__webpack_require__(/*! path */ "path"));
const pdfkit_1 = __importDefault(__webpack_require__(/*! pdfkit */ "pdfkit"));
let BaseFileService = class BaseFileService {
    constructor() {
        this.logger = new common_1.Logger(this.constructor.name);
    }
    // Common implementable methods
    async streamFile(fileKey, res, inline = false) {
        try {
            const contentType = await this.getContentType(fileKey);
            const metadata = await this.getFileMetadata(fileKey);
            const filename = path.basename(fileKey);
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', metadata.size);
            res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(filename)}"`);
            const stream = await this.getFileStream(fileKey);
            return new Promise((resolve, reject) => {
                stream.pipe(res)
                    .on('finish', () => resolve())
                    .on('error', (err) => reject(err));
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`Error streaming file: ${err.message}`, err.stack);
            throw error;
        }
    }
    async downloadFile(fileKey, res, filename) {
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
    (0, common_1.Injectable)()
], BaseFileService);


/***/ }),

/***/ "./src/modules/files/services/local-file.service.ts":
/*!**********************************************************!*\
  !*** ./src/modules/files/services/local-file.service.ts ***!
  \**********************************************************/
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
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const fs = __importStar(__webpack_require__(/*! fs */ "fs"));
const fs_1 = __webpack_require__(/*! fs */ "fs");
const mime = __importStar(__webpack_require__(/*! mime-types */ "mime-types"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const base_file_service_1 = __webpack_require__(/*! ./base-file.service */ "./src/modules/files/services/base-file.service.ts");
let LocalFileService = class LocalFileService extends base_file_service_1.BaseFileService {
    constructor(configService) {
        super();
        this.configService = configService;
        this.chunkUploads = new Map();
        this.uploadDir = configService.getOrThrow('FILE_DIRECTORY');
        this.baseUrl = configService.getOrThrow('FILE_BASE_URL');
        this.tempDir = path_1.default.join(this.uploadDir, 'temp');
        // Ensure upload directories exist
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
        // Ensure temp directory exists
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }
    async initiateChunkedUpload(fileInfo) {
        try {
            // Generate a unique ID for this upload
            const uploadId = crypto.randomUUID();
            // Store upload info in memory
            // In a production app, this should be stored in a database
            this.chunkUploads.set(uploadId, {
                info: fileInfo,
                chunks: new Set(),
                chunkPaths: Array(fileInfo.totalChunks).fill('')
            });
            this.logger.log(`Initiated chunked upload ${uploadId} for ${fileInfo.filename} (${fileInfo.totalChunks} chunks)`);
            return uploadId;
        }
        catch (error) {
            const err = error;
            this.logger.error(`Error initiating chunked upload: ${err.message}`, err.stack);
            throw error;
        }
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
        const fileName = (options === null || options === void 0 ? void 0 : options.customFileName) || this.generateUniqueFileName(file.originalname);
        const filePath = path_1.default.join(finalDir, fileName);
        const fileKey = folder ? `${folder}/${fileName}` : fileName;
        // Write file
        await fs_1.promises.writeFile(filePath, file.buffer);
        // Get file stats
        const stats = await fs_1.promises.stat(filePath);
        const metadata = {
            key: fileKey,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            url: `${this.baseUrl}/${fileKey}`,
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
    async getFileMetadata(fileKey) {
        const filePath = path_1.default.join(this.uploadDir, fileKey);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File ${fileKey} not found`);
        }
        const stats = await fs_1.promises.stat(filePath);
        const mimeType = mime.lookup(filePath) || 'application/octet-stream';
        const originalName = path_1.default.basename(fileKey);
        return {
            key: fileKey,
            originalName,
            size: stats.size,
            mimeType,
            url: `${this.baseUrl}/${fileKey}`,
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
        const filePath = path_1.default.join(this.uploadDir, fileKey);
        return fs.existsSync(filePath);
    }
    async listFiles(options) {
        const dir = (options === null || options === void 0 ? void 0 : options.prefix)
            ? path_1.default.join(this.uploadDir, options.prefix)
            : this.uploadDir;
        if (!fs.existsSync(dir)) {
            return [];
        }
        const files = await fs_1.promises.readdir(dir);
        const results = [];
        for (const file of files) {
            const filePath = path_1.default.join(dir, file);
            const stats = await fs_1.promises.stat(filePath);
            if (stats.isFile()) {
                const fileKey = (options === null || options === void 0 ? void 0 : options.prefix) ? `${options.prefix}/${file}` : file;
                results.push({
                    key: fileKey,
                    originalName: file,
                    size: stats.size,
                    mimeType: mime.lookup(filePath) || 'application/octet-stream',
                    url: (options === null || options === void 0 ? void 0 : options.includeUrls) ? `${this.baseUrl}/${fileKey}` : undefined,
                    createdAt: stats.birthtime,
                    lastModified: stats.mtime,
                });
            }
        }
        // Sort if needed
        if (options === null || options === void 0 ? void 0 : options.sortBy) {
            results.sort((a, b) => {
                const direction = options.sortDirection === 'desc' ? -1 : 1;
                if (options.sortBy === 'name') {
                    return a.originalName.localeCompare(b.originalName) * direction;
                }
                else {
                    return (a.createdAt.getTime() - b.createdAt.getTime()) * direction;
                }
            });
        }
        return (options === null || options === void 0 ? void 0 : options.limit) ? results.slice(0, options.limit) : results;
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
    async getFileUrl(fileKey, expiresIn) {
        // Local storage doesn't support presigned URLs with expiration
        // Just return a direct URL
        return `${this.baseUrl}/${fileKey}`;
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

/***/ "./src/modules/logs/entities/activity-logs.entity.ts":
/*!***********************************************************!*\
  !*** ./src/modules/logs/entities/activity-logs.entity.ts ***!
  \***********************************************************/
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
exports.ActivityLog = void 0;
const action_enum_1 = __webpack_require__(/*! @/common/enums/action.enum */ "./src/common/enums/action.enum.ts");
const log_type_enum_1 = __webpack_require__(/*! @/common/enums/log-type.enum */ "./src/common/enums/log-type.enum.ts");
const base_entity_1 = __webpack_require__(/*! @/database/entities/base.entity */ "./src/database/entities/base.entity.ts");
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
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

/***/ "./src/modules/logs/logs.module.ts":
/*!*****************************************!*\
  !*** ./src/modules/logs/logs.module.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const activity_logs_entity_1 = __webpack_require__(/*! ./entities/activity-logs.entity */ "./src/modules/logs/entities/activity-logs.entity.ts");
const logs_service_1 = __webpack_require__(/*! ./logs.service */ "./src/modules/logs/logs.service.ts");
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

/***/ "./src/modules/logs/logs.service.ts":
/*!******************************************!*\
  !*** ./src/modules/logs/logs.service.ts ***!
  \******************************************/
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
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const activity_logs_entity_1 = __webpack_require__(/*! ./entities/activity-logs.entity */ "./src/modules/logs/entities/activity-logs.entity.ts");
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

/***/ "./src/modules/notifications/gateways/notifications.gateway.ts":
/*!*********************************************************************!*\
  !*** ./src/modules/notifications/gateways/notifications.gateway.ts ***!
  \*********************************************************************/
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
const websockets_1 = __webpack_require__(/*! @nestjs/websockets */ "@nestjs/websockets");
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

/***/ "./src/modules/notifications/notifications.module.ts":
/*!***********************************************************!*\
  !*** ./src/modules/notifications/notifications.module.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const notifications_gateway_1 = __webpack_require__(/*! ./gateways/notifications.gateway */ "./src/modules/notifications/gateways/notifications.gateway.ts");
const notifications_service_1 = __webpack_require__(/*! ./notifications.service */ "./src/modules/notifications/notifications.service.ts");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        providers: [notifications_service_1.NotificationsService, notifications_gateway_1.NotificationsGateway]
    })
], NotificationsModule);


/***/ }),

/***/ "./src/modules/notifications/notifications.service.ts":
/*!************************************************************!*\
  !*** ./src/modules/notifications/notifications.service.ts ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let NotificationsService = class NotificationsService {
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)()
], NotificationsService);


/***/ }),

/***/ "./src/modules/schedule-management/groups/groups.module.ts":
/*!*****************************************************************!*\
  !*** ./src/modules/schedule-management/groups/groups.module.ts ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GroupsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let GroupsModule = class GroupsModule {
};
exports.GroupsModule = GroupsModule;
exports.GroupsModule = GroupsModule = __decorate([
    (0, common_1.Module)({})
], GroupsModule);


/***/ }),

/***/ "./src/modules/schedule-management/holidays/holidays.module.ts":
/*!*********************************************************************!*\
  !*** ./src/modules/schedule-management/holidays/holidays.module.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HolidaysModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let HolidaysModule = class HolidaysModule {
};
exports.HolidaysModule = HolidaysModule;
exports.HolidaysModule = HolidaysModule = __decorate([
    (0, common_1.Module)({})
], HolidaysModule);


/***/ }),

/***/ "./src/modules/schedule-management/schedule-management.module.ts":
/*!***********************************************************************!*\
  !*** ./src/modules/schedule-management/schedule-management.module.ts ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleManagementModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const schedules_module_1 = __webpack_require__(/*! ./schedules/schedules.module */ "./src/modules/schedule-management/schedules/schedules.module.ts");
const shifts_module_1 = __webpack_require__(/*! ./shifts/shifts.module */ "./src/modules/schedule-management/shifts/shifts.module.ts");
const groups_module_1 = __webpack_require__(/*! ./groups/groups.module */ "./src/modules/schedule-management/groups/groups.module.ts");
const holidays_module_1 = __webpack_require__(/*! ./holidays/holidays.module */ "./src/modules/schedule-management/holidays/holidays.module.ts");
let ScheduleManagementModule = class ScheduleManagementModule {
};
exports.ScheduleManagementModule = ScheduleManagementModule;
exports.ScheduleManagementModule = ScheduleManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [schedules_module_1.SchedulesModule, shifts_module_1.ShiftsModule, groups_module_1.GroupsModule, holidays_module_1.HolidaysModule]
    })
], ScheduleManagementModule);


/***/ }),

/***/ "./src/modules/schedule-management/schedules/schedules.module.ts":
/*!***********************************************************************!*\
  !*** ./src/modules/schedule-management/schedules/schedules.module.ts ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SchedulesModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let SchedulesModule = class SchedulesModule {
};
exports.SchedulesModule = SchedulesModule;
exports.SchedulesModule = SchedulesModule = __decorate([
    (0, common_1.Module)({})
], SchedulesModule);


/***/ }),

/***/ "./src/modules/schedule-management/shifts/shifts.module.ts":
/*!*****************************************************************!*\
  !*** ./src/modules/schedule-management/shifts/shifts.module.ts ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShiftsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let ShiftsModule = class ShiftsModule {
};
exports.ShiftsModule = ShiftsModule;
exports.ShiftsModule = ShiftsModule = __decorate([
    (0, common_1.Module)({})
], ShiftsModule);


/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/jwt":
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),

/***/ "@nestjs/passport":
/*!***********************************!*\
  !*** external "@nestjs/passport" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),

/***/ "@nestjs/swagger":
/*!**********************************!*\
  !*** external "@nestjs/swagger" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),

/***/ "@nestjs/typeorm":
/*!**********************************!*\
  !*** external "@nestjs/typeorm" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),

/***/ "@nestjs/websockets":
/*!*************************************!*\
  !*** external "@nestjs/websockets" ***!
  \*************************************/
/***/ ((module) => {

module.exports = require("@nestjs/websockets");

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),

/***/ "class-transformer":
/*!************************************!*\
  !*** external "class-transformer" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "compression":
/*!******************************!*\
  !*** external "compression" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("compression");

/***/ }),

/***/ "csv-writer":
/*!*****************************!*\
  !*** external "csv-writer" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("csv-writer");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),

/***/ "exceljs":
/*!**************************!*\
  !*** external "exceljs" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("exceljs");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "express-rate-limit":
/*!*************************************!*\
  !*** external "express-rate-limit" ***!
  \*************************************/
/***/ ((module) => {

module.exports = require("express-rate-limit");

/***/ }),

/***/ "glob":
/*!***********************!*\
  !*** external "glob" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("glob");

/***/ }),

/***/ "helmet":
/*!*************************!*\
  !*** external "helmet" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),

/***/ "joi":
/*!**********************!*\
  !*** external "joi" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("joi");

/***/ }),

/***/ "mime-types":
/*!*****************************!*\
  !*** external "mime-types" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("mime-types");

/***/ }),

/***/ "morgan":
/*!*************************!*\
  !*** external "morgan" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("morgan");

/***/ }),

/***/ "passport-jwt":
/*!*******************************!*\
  !*** external "passport-jwt" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),

/***/ "pdfkit":
/*!*************************!*\
  !*** external "pdfkit" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("pdfkit");

/***/ }),

/***/ "reflect-metadata":
/*!***********************************!*\
  !*** external "reflect-metadata" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("reflect-metadata");

/***/ }),

/***/ "rxjs/operators":
/*!*********************************!*\
  !*** external "rxjs/operators" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),

/***/ "typeorm":
/*!**************************!*\
  !*** external "typeorm" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.ts");
/******/ 	
/******/ })()
;