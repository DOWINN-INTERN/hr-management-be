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
var BaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let BaseService = BaseService_1 = class BaseService {
    constructor(repository) {
        this.repository = repository;
        this.logger = new common_1.Logger(BaseService_1.name);
    }
    async findAll(options) {
        try {
            return await this.repository.find(options);
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to find all entities: ${err.message}`, err.stack);
            throw error;
        }
    }
    async findOne(id, options) {
        try {
            const entity = await this.repository.findOne(Object.assign({ where: { id: id } }, options));
            if (!entity) {
                throw new Error(`Entity with id ${id} not found`);
            }
            return entity;
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to find entity with id ${id}: ${err.message}`, err.stack);
            throw error;
        }
    }
    async create(createDto) {
        try {
            const entity = this.repository.create(createDto);
            return await this.repository.save(entity);
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to create entity: ${err.message}`, err.stack);
            throw error;
        }
    }
    async update(id, updateDto) {
        try {
            await this.repository.update(id, updateDto);
            return await this.findOne(id);
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to update entity with id ${id}: ${err.message}`, err.stack);
            throw error;
        }
    }
    async remove(id) {
        try {
            await this.repository.delete(id);
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to remove entity with id ${id}: ${err.message}`, err.stack);
            throw error;
        }
    }
};
exports.BaseService = BaseService;
exports.BaseService = BaseService = BaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], BaseService);
