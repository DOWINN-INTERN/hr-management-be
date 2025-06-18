import { BaseEntity } from '@/database/entities/base.entity';
import { ExportOptionsDto } from '@/modules/files/dtos/export-options.dto';
import { ImportOptionsDto } from '@/modules/files/dtos/import-options.dto';
import { ImportResult } from '@/modules/files/dtos/import-result.dto';
import { ImportExportService } from '@/modules/files/services/import-export.service';
import { Body, Controller, HttpStatus, Inject, Param, Query, Type } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import pluralize, { singular } from 'pluralize';
import { BaseController } from '../controllers/base.controller';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ApiCreateResponses, ApiGenericResponses, ApiUpdateResponses } from '../decorators/generic-api-responses.decorator';
import { Override } from '../decorators/override.decorator';
import { AllowEmployee, OnlyAllowRoles } from '../decorators/roles.decorator';
import { GeneralResponseDto } from '../dtos/generalresponse.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { PaginationDto } from '../dtos/pagination.dto';
import { BaseService } from '../services/base.service';

export function createController<TEntity extends BaseEntity<TEntity>, Service extends BaseService<TEntity>, GetDto, CreateDto = null, UpdateDto = null>(
  EntityClass: Type<TEntity>,
  ServiceClass: Type<Service>,
  getDtoClass: Type<GetDto>,
  createDtoClass?: Type<CreateDto>,
  updateDtoClass?: Type<UpdateDto>
) {

  // Extract entity name from class (removing "Entity" suffix if present)
  const entityName = EntityClass.name.replace(/Entity$/, '');

  // Add spaces before capital letters (except the first letter)
  const spacedEntityName = entityName.replace(/([A-Z])/g, ' $1').trim();
  // For the first character, ensure it's capitalized without a preceding space
  const formattedEntityName = spacedEntityName.charAt(0).toUpperCase() + spacedEntityName.slice(1);

  // Determine plural name for controller routes (used in swagger docs)
  const pluralName = pluralize(formattedEntityName);

  @ApiTags(pluralName)
  @Controller()
  @OnlyAllowRoles(true) // Only allow users with roles to access this controller
  @AllowEmployee(false) // Do not allow access to users with only employee role
  class DynamicController extends BaseController<TEntity, Service, GetDto, CreateDto, UpdateDto> {
    constructor(
      @Inject(ServiceClass) baseService: Service,
      @Inject(ImportExportService) importExportService?: ImportExportService,
    ) {
      super(baseService, getDtoClass, formattedEntityName, importExportService);
    }

    @Override()
    @ApiOperation({ 
      summary: `Create a New ${singular(formattedEntityName)}`,
      description: `Creates a new ${singular(formattedEntityName.toLowerCase())} record in the database with the provided data.`
    })
    @ApiBody({ 
      type: createDtoClass, 
      description: `${singular(formattedEntityName)} creation data`,
      required: true
    })
    @ApiCreateResponses(singular(formattedEntityName), getDtoClass)
    @ApiGenericResponses()
    override async create(
      @Body() entityDto: CreateDto,
      @CurrentUser('sub') createdById: string
    ): Promise<GetDto> {
      return await super.create(entityDto, createdById);
    }

    @Override()
    @ApiOperation({ 
      summary: `Update an Existing ${singular(formattedEntityName)}`,
      description: `Updates an existing ${singular(formattedEntityName).toLowerCase()} record in the database with the provided data.`
    })
    @ApiParam({ 
      name: 'id', 
      description: `The unique identifier of the ${singular(formattedEntityName).toLowerCase()} to update`,
      required: true 
    })
    @ApiBody({ 
      type: updateDtoClass, 
      description: `${singular(formattedEntityName)} update data`,
      required: true
    })
    @ApiUpdateResponses(singular(formattedEntityName), getDtoClass)
    @ApiGenericResponses()
    override async update(
        @Param('id') id: string,
        @Body() entityDto: UpdateDto,
        @CurrentUser('sub') updatedById: string
    ): Promise<GetDto> {
      return await super.update(id, entityDto, updatedById);
    }

    @Override()
    @ApiOperation({ 
      summary: `Hard Delete a Specific ${singular(formattedEntityName)}`,
      description: `Removes a ${singular(formattedEntityName).toLowerCase()} record from the database by its unique identifier.`
    })
    @ApiParam({ 
      name: 'id', 
      description: `The unique identifier of the ${singular(formattedEntityName).toLowerCase()} to delete`,
      required: true 
    })
    @ApiResponse({ 
      status: HttpStatus.NO_CONTENT, 
      description: `${singular(formattedEntityName)} has been successfully deleted.`,
      type: GeneralResponseDto
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: `${singular(formattedEntityName)} not found.`, type: GeneralResponseDto })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Cannot delete due to existing references.', type: GeneralResponseDto })
    @ApiGenericResponses()
    override async delete(@Param('id') id: string): Promise<GeneralResponseDto> {
      return await super.delete(id);
    }

    @Override()
    @ApiOperation({ 
      summary: `Soft Delete a Specific ${singular(formattedEntityName)}`,
      description: `Marks a ${singular(formattedEntityName).toLowerCase()} record as deleted without removing it from the database.`
    })
    @ApiParam({ 
      name: 'id', 
      description: `The unique identifier of the ${singular(formattedEntityName.toLowerCase())} to soft delete`,
      required: true 
    })
    @ApiResponse({ 
      status: HttpStatus.NO_CONTENT, 
      description: `${singular(formattedEntityName)} has been successfully soft-deleted.`,
      type: GeneralResponseDto
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: `${singular(formattedEntityName)} not found.`, type: GeneralResponseDto })
    @ApiGenericResponses()
    override async softDelete(
      @Param('id') id: string, 
      @CurrentUser('sub') deletedBy: string
    ): Promise<GeneralResponseDto> {
      return await super.softDelete(id, deletedBy);
    }

    @Override()
    @ApiOperation({
      summary: `Find a Specific ${singular(formattedEntityName)} by ID`,
      description: `Retrieve a single ${singular(formattedEntityName).toLowerCase()} from the database using its unique identifier.`
    })
    @ApiParam({
      name: 'id',
      description: `The unique identifier of the ${singular(formattedEntityName).toLowerCase()} to retrieve`,
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
      description: `${singular(formattedEntityName)} was successfully retrieved.`,
      type: getDtoClass
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: `${singular(formattedEntityName)} not found.`, type: GeneralResponseDto })
    @ApiGenericResponses()
    override async findById(
      @Param('id') id: string,
      @Query('relations') relations?: string,
      @Query('select') select?: string
    ): Promise<GetDto> {
      return await super.findById(id, relations, select);
    }

    @Override()
    @ApiOperation({
      summary: `Find ${singular(formattedEntityName)} by Any Field`,
      description: `Search for ${singular(formattedEntityName).toLowerCase()} using field-value pairs. Multiple criteria can be combined.`
    })
    @ApiQuery({
      name: 'fields',
      required: true,
      type: String,
      description: 'Search fields in format field:value (comma-separated)',
      example: `id:123,name:example${singular(entityName).toLowerCase()}`
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
      description: `${singular(formattedEntityName)} found successfully`,
      type: getDtoClass
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: `${singular(formattedEntityName)} not found with the specified criteria`, type: GeneralResponseDto })
    @ApiGenericResponses()
    override async findOne(
      @Query('fields') fieldsString: string,
      @Query('relations') relations?: string,
      @Query('select') select?: string
    ): Promise<GetDto> {
      return await super.findOne(fieldsString, relations, select);
    }

    @Override()
    @ApiOperation({
        summary: `Find all ${singular(formattedEntityName)} with Advanced Filtering`,
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
    override findAllAdvanced(req: any, paginationDto: PaginationDto<TEntity>): Promise<PaginatedResponseDto<GetDto>> {
      return super.findAllAdvanced(req, paginationDto);
    }

    @Override()
    @ApiOperation({
      summary: `Export ${pluralName} Data`,
      description: `Exports ${pluralName.toLowerCase()} data based on the provided export options.`
    })
    @ApiBody({
      type: ExportOptionsDto,
      description: 'Export configuration options',
      examples: {
        csv: {
          summary: 'Basic CSV Export',
          value: {
            format: 'csv',
            maxRecords: 1000,
            filter: { status: 'active' }
          }
        },
        excel: {
          summary: 'Excel with Relations',
          value: {
            format: 'excel',
            relations: ['user', 'department'],
            sort: { createdAt: 'DESC' },
            metadata: {
              title: `${singular(formattedEntityName)} Report`,
              company: 'Company Name'
            }
          }
        },
        pdf: {
          summary: 'Filtered PDF Report',
          value: {
            format: 'pdf',
            filter: { status: { in: ['active', 'pending'] } },
            metadata: {
              title: `${singular(formattedEntityName)} Summary`,
              description: 'Monthly activity report'
            }
          }
        },
        advanced: {
          summary: 'Advanced Export Configuration',
          value: {
            format: 'excel',
            filter: { createdAt: { gte: '{{startDate}}', lt: '{{endDate}}' } },
            sort: { createdAt: 'DESC' },
            select: ['id', 'name', 'status', 'createdAt'],
            relations: ['department'],
            fieldMap: { createdAt: 'Date Created', department: 'Department Name' },
            metadata: {
              title: `${singular(formattedEntityName)} Export`,
              subtitle: 'Detailed Report',
              author: 'System Administrator'
            },
            customHeaders: {
              'Generated By': 'API System',
              'Report Period': '{{reportPeriod}}'
            }
          }
        }
      }
    })
    @ApiResponse({
      status: HttpStatus.OK,
      description: `Successfully exported ${pluralName.toLowerCase()} data as a downloadable file.`,
      content: {
        'text/csv': {
          schema: {
            type: 'string',
            format: 'binary'
          }
        },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
          schema: {
            type: 'string',
            format: 'binary'
          }
        },
        'application/json': {
          schema: {
            type: 'string',
            format: 'binary'
          }
        },
        'application/xml': {
          schema: {
            type: 'string',
            format: 'binary'
          }
        },
        'application/pdf': {
          schema: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    })
    @ApiGenericResponses()
    override exportData(exportOptions: Partial<ExportOptionsDto<TEntity>>, req: any, res: Response, userId: string): Promise<any> {
        return super.exportData(exportOptions, req, res, userId);
    }

    @Override()
    @ApiOperation({
        summary: `Import ${entityName} Data`,
        description: `Import ${entityName.toLowerCase()} records from CSV, Excel or JSON file with validation.`
    })
    override async importData(file: Express.Multer.File, options: ImportOptionsDto<TEntity>, req: any, userId: string): Promise<ImportResult> {
        return super.importData(file, options, req, userId);
    }

  }
    
  return DynamicController;
}