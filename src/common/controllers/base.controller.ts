import { PaginatedResponseDto } from '@/common/dtos/paginated-response.dto';
import { PaginationDto } from '@/common/dtos/pagination.dto';
import { BaseService } from '@/common/services/base.service';
import { BaseEntity } from '@/database/entities/base.entity';
import {
    Body,
    Delete,
    Get,
    HttpStatus,
    Param,
    Query
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { DeepPartial } from 'typeorm';
import { Authorize } from '../decorators/authorize.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UtilityHelper } from '../helpers/utility.helper';

export abstract class BaseController<T extends BaseEntity<T>, GetDto, EntityDto = null, UpdateDto = null> {
    constructor(
        protected readonly baseService: BaseService<T>,
        protected readonly getDtoClass: ClassConstructor<GetDto>
    ) {}

    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Entity already exists.' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Entity not found.' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'The entity has been successfully created.' })
    async create(@Body() entityDto: EntityDto, @CurrentUser('sub') createdById: string): Promise<GetDto> {
        const entity = await this.baseService.create(entityDto as DeepPartial<T>, createdById);
        return plainToInstance(this.getDtoClass, entity, { excludeExtraneousValues: true, exposeDefaultValues: false });
    }

    @Authorize()
    @ApiOperation({ summary: 'Update an entity' })
    @ApiParam({ name: 'id', description: 'Entity ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The entity has been successfully updated.' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Entity not found.' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    async update(
        @Param('id') id: string,
        @Body() entityDto: UpdateDto,
        @CurrentUser('sub') updatedById: string
    ): Promise<GetDto> {
        const updatedEntity = await this.baseService.update(id, entityDto as DeepPartial<T>, updatedById);
        return plainToInstance(this.getDtoClass, updatedEntity);
    }

    @Get()
    @ApiOperation({
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
    })
    @ApiQuery({
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
    })
    @ApiQuery({
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
    })
    @ApiQuery({
        name: 'relations',
        required: false,
        type: String,
        example: '["user","category"]',
    })
    @ApiQuery({
        name: 'select',
        required: false,
        type: String,
        example: '["id","name","email"]',
    })
    @ApiQuery({ name: 'skip', required: false, type: Number })
    @ApiQuery({ name: 'take', required: false, type: Number })
    @ApiQuery({ name: 'userId', required: false, type: String, format: 'uuid' })
    @ApiResponse({
        status: HttpStatus.OK,
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
    })
    async findAllAdvanced(
        @Query() paginationDto: PaginationDto<T>,
    ): Promise<PaginatedResponseDto<T>> {
        return await this.baseService.findAll(paginationDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an entity by id' })
    @ApiParam({ name: 'id', description: 'Entity ID' })
    @ApiQuery({ name: 'relations', required: false, type: String, description: 'Relations to include' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return the entity' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Entity not found' })
    async findOne(
        @Param('id') id: string,
        @Query('relations') relations?: string
    ): Promise<GetDto> {
        // Parse relations string into relations object if provided
        const relationsObj = relations ? 
            UtilityHelper.parseRelations(relations) : 
            undefined;
            
        // Use the service with proper typing and relations
        const entity = await this.baseService.findOneByOrFail(
            { id } as Partial<T>,
            relationsObj
        );
        
        return plainToInstance(this.getDtoClass, entity);
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

    @Delete(':id')
    @Authorize()
    @ApiOperation({ summary: 'Delete an entity' })
    @ApiParam({ name: 'id', description: 'Entity ID' })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The entity has been successfully deleted.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Entity not found.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
    async delete(@Param('id') id: string): Promise<void> {
        await this.baseService.delete(id);
    }

    @Delete()
    @Authorize()
    @ApiOperation({ summary: 'Delete multiple entities' })
    @ApiBody({
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
    })
    @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The entities have been successfully deleted.' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Entity not found.' })
    async deleteMany(@Body('ids') ids: string[], @Body('hardDelete') hardDelete: boolean = false): Promise<void> {
        await this.baseService.deleteMany(ids, hardDelete);
    }
}