import { PaginatedResponseDto } from '@/common/dtos/paginated-response.dto';
import { PaginationDto } from '@/common/dtos/pagination.dto';
import { BaseService } from '@/common/services/base.service';
import { BaseEntity } from '@/database/entities/base.entity';
import {
    Body,
    Delete,
    Get,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Post,
    Put,
    Query
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { DeepPartial, FindOptionsOrder, FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { Authorize } from '../decorators/authorize.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Action } from '../enums/action.enum';
import { createPermissions } from '../factories/create-permissions.factory';
import { UtilityHelper } from '../helpers/utility.helper';
import { IPermission } from '../interfaces/permission.interface';

export interface ControllerPermissions {
    Create?: IPermission[];
    Read?: IPermission[];
    Update?: IPermission[];
    Delete?: IPermission[];
    Manage?: IPermission[];
}

// Add this to a types file or at the top of your controller
interface FindEntityOptions<T> {
    relations?: FindOptionsRelations<T>;
    select?: FindOptionsSelect<T>;
    order?: FindOptionsOrder<T>;
    withDeleted?: boolean;
    cache?: boolean | number | { id: any; milliseconds: number };
    loadEagerRelations?: boolean;
    transaction?: boolean;
}

export abstract class BaseController<T extends BaseEntity<T>, GetDto, EntityDto = null, UpdateDto = null> {
    // Static permissions map that all instances share
    public static permissionsMap: Record<string, ControllerPermissions> = {};
    protected permissions: ControllerPermissions = { Create: [], Read: [], Update: [], Delete: [] };
    
    constructor(
        protected readonly baseService: BaseService<T>,
        protected readonly getDtoClass: ClassConstructor<GetDto>,
        protected readonly entityName: string,
        entityNameOrPermissions?: string | ControllerPermissions
    ) { 
        // Initialize static map if not exists
        if (!BaseController.permissionsMap) {
            BaseController.permissionsMap = {};
        }
        
        // If string is passed, it's the entity name - generate permissions
        if (typeof entityNameOrPermissions === 'string') {
            entityName = entityNameOrPermissions;
            const generatedPermissions = createPermissions(entityNameOrPermissions);
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

    @Post()
    @Authorize({ endpointType: Action.CREATE })
    async create(@Body() entityDto: EntityDto, @CurrentUser('sub') createdById: string): Promise<GetDto> {
        const entity = await this.baseService.create(entityDto as DeepPartial<T>, createdById);
        return plainToInstance(this.getDtoClass, entity);
    }

    @Put(':id')
    @Authorize({ endpointType: Action.UPDATE })
    async update(
        @Param('id') id: string,
        @Body() entityDto: UpdateDto,
        @CurrentUser('sub') updatedById: string
    ): Promise<GetDto> {
        const updatedEntity = await this.baseService.update(id, entityDto as DeepPartial<T>, updatedById);
        return plainToInstance(this.getDtoClass, updatedEntity);
    }

    @Get()
    @Authorize({ endpointType: Action.READ })
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
        
        ## Relational Filtering
        Filter by related entity fields: \`?filter={"category.name":"Electronics"}\`
        
        ## Field Selection
        Select specific fields: \`?select=["id","name","email"]\`
        Select fields from relations: \`?select=["id","name","user.id","user.email","category.name"]\`
        
        ## Combining Filters
        You can combine multiple filters: \`?filter={"status":"active","age":{"gte":21}}\`
        
        ## Sorting
        Sort by field: \`?sort={"createdAt":"DESC"}\`
        Multiple fields: \`?sort={"status":"ASC","createdAt":"DESC"}\`
        Sort by relation field: \`?sort={"user.name":"ASC"}\`
        
        ## Pagination
        Page size: \`?take=10\`
        Skip records: \`?skip=10\` (for page 2 with size 10)
        
        ## Relations
        Include related entities: \`?relations=["user","category"]\`
        Include nested relations: \`?relations={"user":true,"category":{"subcategories":true}}\`
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
    ): Promise<PaginatedResponseDto<GetDto>> {
        const entityResult = await this.baseService.findAllComplex(paginationDto);
        
        // Transform using class-transformer
        const dtoResult: PaginatedResponseDto<GetDto> = {
            data: plainToInstance(this.getDtoClass, entityResult.data, {
                enableCircularCheck: true,
                exposeUnsetFields: false,
            }),
            totalCount: entityResult.totalCount,
            meta: entityResult.meta
        };
        
        return dtoResult;
    }

    @Get('find')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({ 
        summary: 'Find an entity by any field',
        description: 'Search for an entity using field-value pairs. Multiple criteria can be combined.'
    })
    @ApiQuery({ 
        name: 'fields', 
        required: true, 
        type: String, 
        description: 'Search fields in format field:value (comma-separated)',
        example: 'id:123,name:example'
    })
    @ApiQuery({ 
        name: 'relations', 
        required: false, 
        type: String, 
        description: 'Relations to include in the response (comma-separated)',
        example: 'user,category,tags'
    })
    @ApiQuery({ 
        name: 'select', 
        required: false, 
        type: String, 
        description: 'Fields to select in the response (comma-separated). Only these fields will be returned.',
        example: 'id,name,createdAt'
    })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Entity found successfully',
        schema: {
            type: 'object',
            example: {
            id: 123,
            name: 'Example Entity',
            createdAt: '2023-01-01T00:00:00Z'
            }
        }
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Entity not found with the specified criteria' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden. User does not have permission to access this resource' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized. Authentication is required' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    async findOne(
        @Query('fields') fieldsString: string,
        @Query('relations') relations?: string,
        @Query('select') select?: string
    ): Promise<GetDto> {
        // Create options object for the service
        const options: FindEntityOptions<T> = {};
        
        // Parse search criteria from query string (format: field1:value1,field2:value2)
        const criteria: Partial<T> = {};
        if (fieldsString) {
            const fieldPairs = fieldsString.split(',');
            for (const pair of fieldPairs) {
                const [key, value] = pair.trim().split(':');
                if (key && value !== undefined) {
                    // Convert value types appropriately
                    if (value === 'true') {
                        criteria[key as keyof T] = true as any;
                    } else if (value === 'false') {
                        criteria[key as keyof T] = false as any;
                    } else if (value === 'null') {
                        criteria[key as keyof T] = null as any;
                    } else if (!isNaN(Number(value))) {
                        criteria[key as keyof T] = Number(value) as any;
                    } else {
                        criteria[key as keyof T] = value as any;
                    }
                }
            }
        }
        
        // Parse relations if provided
        if (relations) {
            options.relations = UtilityHelper.parseRelations(relations);
        }
        
        // Parse select fields if provided
        if (select) {
            options.select = UtilityHelper.parseSelect(select);
        }
        
        try {
            // Use the service with proper typing and options
            const entity = await this.baseService.findOneByOrFail(
                criteria,
                options
            );
            
            return plainToInstance(this.getDtoClass, entity);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new InternalServerErrorException(
                `Error retrieving ${this.entityName} with criteria ${JSON.stringify(criteria)}: ${errorMessage}`
            );
        }
    }
    
    @Get('find/:id')
    @Authorize({ endpointType: Action.READ })
    @ApiOperation({ summary: 'Get an entity by id' })
    @ApiParam({ name: 'id', description: 'Entity ID' })
    @ApiQuery({ name: 'relations', required: false, type: String, description: 'Relations to include (comma-separated)' })
    @ApiQuery({ name: 'select', required: false, type: String, description: 'Fields to select (comma-separated)' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return the entity' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Entity not found' })
    async findById(
        @Param('id') id: string,
        @Query('relations') relations?: string,
        @Query('select') select?: string
    ): Promise<GetDto> {
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

    @Delete('delete/:id')
    @Authorize({ endpointType: Action.DELETE })
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
    @Authorize({ endpointType: Action.DELETE })
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