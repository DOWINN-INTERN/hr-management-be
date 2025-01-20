"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const base_service_1 = require("../services/base.service");
let BaseController = class BaseController {
    constructor(baseService) {
        this.baseService = baseService;
    }
    findAll() {
        return this.baseService.findAll();
    }
    findOne(id) {
        return this.baseService.findOne(id);
    }
    create(createDto) {
        return this.baseService.create(createDto);
    }
    update(id, updateDto) {
        return this.baseService.update(id, updateDto);
    }
    remove(id) {
        return this.baseService.remove(id);
    }
};
exports.BaseController = BaseController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiTags)('Base'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all entities' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all entities.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BaseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiTags)('Base'),
    (0, swagger_1.ApiOperation)({ summary: 'Get entity by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return entity by ID.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BaseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiTags)('Base'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new entity' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The entity has been successfully created.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BaseController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiTags)('Base'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an entity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The entity has been successfully updated.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BaseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiTags)('Base'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an entity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The entity has been successfully deleted.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BaseController.prototype, "remove", null);
exports.BaseController = BaseController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [base_service_1.BaseService])
], BaseController);
