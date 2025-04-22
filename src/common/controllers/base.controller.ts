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
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { DeepPartial, FindOptionsOrder, FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { Authorize } from '../decorators/authorize.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { GeneralResponseDto } from '../dtos/generalresponse.dto';
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
        public readonly entityName: string,
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
            relation: {
                summary: 'Sort by relation field',
                value: '{"user.firstName":"ASC"}',
            },
        },
    })
    @ApiQuery({
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
    })
    @ApiQuery({
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
    })
    @ApiQuery({ name: 'skip', required: false, type: Number })
    @ApiQuery({ name: 'take', required: false, type: Number })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieved entities',
        type: PaginatedResponseDto<GetDto>,
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

    @Delete('delete/soft/:id')
    @Authorize({ endpointType: Action.DELETE })
    async softDelete(@Param('id') id: string, @CurrentUser('sub') deletedBy: string): Promise<GeneralResponseDto> {
        return await this.baseService.softDelete(id, deletedBy);
    }

    @Delete('delete/:id')
    @Authorize({ endpointType: Action.DELETE })
    async delete(@Param('id') id: string): Promise<GeneralResponseDto> {
        return await this.baseService.delete(id);
    }

    // @Delete()
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