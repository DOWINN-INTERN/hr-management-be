import { BaseEntity } from '@/database/entities/base.entity';
import { Body, Controller, HttpStatus, Inject, Param, Query, Type } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { singular } from 'pluralize';
import { BaseController } from '../controllers/base.controller';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Override } from '../decorators/override.decorator';
import { GeneralResponseDto } from '../dtos/generalresponse.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { PaginationDto } from '../dtos/pagination.dto';
import { BaseService } from '../services/base.service';

export function createController<TEntity extends BaseEntity<TEntity>, GetDto, CreateDto = null, UpdateDto = null>(
  entityName: string,
  ServiceClass: Type<BaseService<TEntity>>,
  getDtoClass: any,
  createDtoClass?: any,
  updateDtoClass?: any
) {
  @ApiTags(entityName)
  @Controller()
  class DynamicController extends BaseController<TEntity, GetDto, CreateDto, UpdateDto> {
    constructor(
      @Inject(ServiceClass) baseService: BaseService<TEntity>,
    ) {
      super(baseService, getDtoClass, entityName);
    }

    @Override()
    @ApiOperation({ 
      summary: `Create a new ${singular(entityName)}`,
      description: `Creates a new ${singular(entityName)} record in the database with the provided data.`
    })
    @ApiBody({ 
      type: createDtoClass, 
      description: `${singular(entityName)} creation data`,
      required: true
    })
    @ApiResponse({ 
      status: HttpStatus.CREATED, 
      description: `The ${singular(entityName)} has been successfully created.`,
      type: getDtoClass
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.UNPROCESSABLE_ENTITY, description: 'Unprocessable entity.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: `${singular(entityName)} already exists.`, type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Related entity not found.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.', type: GeneralResponseDto })
    override async create(
      @Body() entityDto: CreateDto,
      @CurrentUser('sub') createdById: string
    ): Promise<GetDto> {
      return await super.create(entityDto, createdById);
    }

    @Override()
    @ApiOperation({ 
      summary: `Update an existing ${singular(entityName)}`,
      description: `Updates an existing ${singular(entityName)} record in the database with the provided data.`
    })
    @ApiParam({ 
      name: 'id', 
      description: `The unique identifier of the ${singular(entityName)} to update`,
      required: true 
    })
    @ApiBody({ 
      type: updateDtoClass, 
      description: `${singular(entityName)} update data`,
      required: true
    })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: `The ${singular(entityName)} has been successfully updated.`,
      type: getDtoClass
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.UNPROCESSABLE_ENTITY, description: 'Unprocessable entity.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: `${singular(entityName)} not found.`, type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Data conflict during update.', type: GeneralResponseDto })
    override async update(
        @Param('id') id: string,
        @Body() entityDto: UpdateDto,
        @CurrentUser('sub') updatedById: string
    ): Promise<GetDto> {
      return await super.update(id, entityDto, updatedById);
    }

    @Override()
    @ApiOperation({ 
      summary: `Hard delete a specific ${singular(entityName)}`,
      description: `Removes a ${singular(entityName)} record from the database by its unique identifier.`
    })
    @ApiParam({ 
      name: 'id', 
      description: `The unique identifier of the ${singular(entityName)} to delete`,
      required: true 
    })
    @ApiResponse({ 
      status: HttpStatus.NO_CONTENT, 
      description: `The ${singular(entityName)} has been successfully deleted.`,
      type: GeneralResponseDto
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid ID format.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: `${singular(entityName)} not found.`, type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Cannot delete due to existing references.', type: GeneralResponseDto })
    override async delete(@Param('id') id: string): Promise<GeneralResponseDto> {
      return await super.delete(id);
    }

    @Override()
    @ApiOperation({ 
      summary: `Soft delete a specific ${singular(entityName)}`,
      description: `Marks a ${singular(entityName)} record as deleted without removing it from the database.`
    })
    @ApiParam({ 
      name: 'id', 
      description: `The unique identifier of the ${singular(entityName)} to soft delete`,
      required: true 
    })
    @ApiResponse({ 
      status: HttpStatus.NO_CONTENT, 
      description: `The ${singular(entityName)} has been successfully soft-deleted.`,
      type: GeneralResponseDto
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid ID format.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: `${singular(entityName)} not found.`, type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.', type: GeneralResponseDto })
    override async softDelete(
      @Param('id') id: string, 
      @CurrentUser('sub') deletedBy: string
    ): Promise<GeneralResponseDto> {
      return await super.softDelete(id, deletedBy);
    }

    @Override()
    @ApiOperation({
      summary: `Find a specific ${singular(entityName)} by ID`,
      description: `Retrieve a single ${singular(entityName)} from the database using its unique identifier.`
    })
    @ApiParam({
      name: 'id',
      description: `The unique identifier of the ${singular(entityName)} to retrieve`,
      required: true
    })
    @ApiQuery({
      name: 'relations',
      required: false,
      type: String,
      description: 'Relations to include (comma-separated)',
      example: 'user,profile,permissions'
    })
    @ApiQuery({
      name: 'select',
      required: false,
      type: String,
      description: 'Fields to select (comma-separated)',
      example: 'id,name,email,createdAt'
    })
    @ApiResponse({
      status: HttpStatus.OK,
      description: `The ${singular(entityName)} was successfully retrieved.`,
      type: getDtoClass
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid ID format.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: `${singular(entityName)} not found.`, type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.', type: GeneralResponseDto })
    override async findById(
      @Param('id') id: string,
      @Query('relations') relations?: string,
      @Query('select') select?: string
    ): Promise<GetDto> {
      return await super.findById(id, relations, select);
    }

    @Override()
    @ApiOperation({
      summary: `Find ${singular(entityName)} by any field`,
      description: `Search for ${singular(entityName)} using field-value pairs. Multiple criteria can be combined.`
    })
    @ApiQuery({
      name: 'fields',
      required: true,
      type: String,
      description: 'Search fields in format field:value (comma-separated)',
      example: `id:123,name:example${singular(entityName)}`
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
      description: `${singular(entityName)} found successfully`,
      type: getDtoClass
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: `${singular(entityName)} not found with the specified criteria`, type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden. User does not have permission to access this resource', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized. Authentication is required', type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: GeneralResponseDto })
    override async findOne(
      @Query('fields') fieldsString: string,
      @Query('relations') relations?: string,
      @Query('select') select?: string
    ): Promise<GetDto> {
      return await super.findOne(fieldsString, relations, select);
    }

    @Override()
    @ApiOperation({
        summary: `Find all ${singular(entityName)} with advanced filtering`,
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
    })
    override findAllAdvanced(paginationDto: PaginationDto<TEntity>): Promise<PaginatedResponseDto<GetDto>> {
      return super.findAllAdvanced(paginationDto);
    }
  }
    
  return DynamicController;
}