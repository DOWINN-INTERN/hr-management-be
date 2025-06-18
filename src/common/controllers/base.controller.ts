import { PaginatedResponseDto } from '@/common/dtos/paginated-response.dto';
import { PaginationDto } from '@/common/dtos/pagination.dto';
import { BaseService } from '@/common/services/base.service';
import { BaseEntity } from '@/database/entities/base.entity';
import { ExportOptionsDto } from '@/modules/files/dtos/export-options.dto';
import { ImportOptionsDto } from '@/modules/files/dtos/import-options.dto';
import { ImportResult } from '@/modules/files/dtos/import-result.dto';
import { ImportExportService } from '@/modules/files/services/import-export.service';
import {
    BadRequestException,
    Body,
    Delete,
    Get,
    HttpStatus,
    Inject,
    InternalServerErrorException,
    Logger,
    MaxFileSizeValidator,
    NotFoundException,
    Optional,
    Param,
    ParseFilePipe,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    Req,
    Res,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { DeepPartial, FindOptionsOrder, FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { ApiQueryFromDto } from '../decorators/api-query-from-dto.decorator';
import { Authorize } from '../decorators/authorize.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ApiGenericResponses } from '../decorators/generic-api-responses.decorator';
import { GeneralResponseDto } from '../dtos/generalresponse.dto';
import { Action } from '../enums/action.enum';
import { FileFormat } from '../enums/file-format';
import { RoleScopeType } from '../enums/role-scope-type.enum';
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

export abstract class BaseController<T extends BaseEntity<T>, K extends BaseService<T>, GetDto, EntityDto = null, UpdateDto = null> {
    // Static permissions map that all instances share
    protected permissions: ControllerPermissions = { Create: [], Read: [], Update: [], Delete: [] };
    protected logger = new Logger(this.constructor.name);
    constructor(
        protected readonly baseService: K,
        protected readonly getDtoClass: ClassConstructor<GetDto>,
        public readonly entityName: string,
        @Optional() @Inject(ImportExportService)
        protected readonly importExportService?: ImportExportService
    ) { 

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
        @Param('id', ParseUUIDPipe) id: string,
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
    @ApiQuery({
        name: 'userId',
        required: false,
        type: String,
        description: 'Filter by user ID',
    })
    @ApiQuery({
        name: 'departmentId',
        required: false,
        type: String,
        description: 'Filter by department ID',
    })
    @ApiQuery({
        name: 'branchId',
        required: false,
        type: String,
        description: 'Filter by branch ID',
    })
    @ApiQuery({
        name: 'organizationId',
        required: false,
        type: String,
        description: 'Filter by organization ID',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieved entities',
        type: PaginatedResponseDto<GetDto>,
    })
    @ApiGenericResponses()
    async findAllAdvanced(
        @Req() req: any,
        @Query() paginationDto: PaginationDto<T>,
    ): Promise<PaginatedResponseDto<GetDto>> {
        const entityResult = await this.baseService.findAllComplex(req.resourceScope.type, paginationDto);
        
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
                `Error retrieving ${this.entityName.toLowerCase()} with criteria ${JSON.stringify(criteria)}: ${errorMessage}`
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
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Entity not found.' })
    @ApiGenericResponses()
    async deleteMany(@Body('ids') ids: string[], @Body('hardDelete') hardDelete: boolean = false): Promise<void> {
        await this.baseService.deleteMany(ids, hardDelete);
    }

    @Post('export')
    @Authorize({ endpointType: Action.READ })
    async exportData(
        @Body() exportOptions: Partial<ExportOptionsDto<T>>,
        @Req() req: any,
        @Res() res: Response,
        @CurrentUser('sub') userId: string,
    ): Promise<any> {
        try {
            this.logger.log(`Starting export for ${this.entityName} with format: ${exportOptions.format || 'CSV'}`);
            
            // Check if service exists
            if (!this.importExportService) {
                this.logger.error('Import/Export service not available');
                throw new BadRequestException('Import/Export service not available');
            }
            
            // Set default options with improved defaults
            const options: ExportOptionsDto<T> = {
                format: exportOptions.format || FileFormat.CSV,
                maxRecords: exportOptions.maxRecords || 1000,
                filter: exportOptions.filter || {},
                scope: req.resourceScope?.type || RoleScopeType.OWNED,
                ...exportOptions,
            };
            
            // Generate a filename if not provided
            const metadata = options.metadata || {};
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = metadata.filename || `${this.entityName.toLowerCase()}-export-${timestamp}`;
            
            // Log export parameters
            this.logger.debug(`Export options: ${JSON.stringify({
                format: options.format,
                filter: options.filter,
                maxRecords: options.maxRecords,
                relations: options.relations,
                filename,
            })}`);
            
            // Get export data
            const startTime = Date.now();
            const result = await this.importExportService.exportData(
                this.baseService,
                options
            );
            const endTime = Date.now();
            
            // Set headers based on format
            let contentType: string;
            let fileExtension: string;
            
            switch (options.format) {
                case FileFormat.CSV:
                    contentType = 'text/csv';
                    fileExtension = '.csv';
                    break;
                case FileFormat.EXCEL:
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    fileExtension = '.xlsx';
                    break;
                case FileFormat.JSON:
                    contentType = 'application/json';
                    fileExtension = '.json';
                    break;
                case FileFormat.XML:
                    contentType = 'application/xml';
                    fileExtension = '.xml';
                    break;
                case FileFormat.PDF:
                    contentType = 'application/pdf';
                    fileExtension = '.pdf';
                    break;
                default:
                    contentType = 'text/plain';
                    fileExtension = '.txt';
            }
            
            // Log success
            this.logger.log(`Export completed successfully in ${endTime - startTime}ms`);
            
            // Send the file
            res.set({
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}${fileExtension}"`,
                'X-Export-Timestamp': new Date().toISOString(),
            });
            
            res.send(result.data || result);
            return;
            
        } catch (error: any) {
            this.logger.error(`Error exporting data: ${error.message}`, error.stack);
            
            // Send a user-friendly error response
            if (error instanceof BadRequestException) {
                throw error; // Pass through validation errors
            } else if (error instanceof NotFoundException) {
                throw error; // Pass through not found errors 
            } else {
                // For other errors, hide technical details in production
                throw new InternalServerErrorException(
                    process.env.NODE_ENV === 'production'
                        ? `Failed to export ${this.entityName} data`
                        : `Failed to export ${this.entityName} data: ${error.message}`
                );
            }
        }
    }

    @Post('import')
    @Authorize({ endpointType: Action.CREATE })
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
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
    })
    @ApiQueryFromDto(ImportOptionsDto)
    @ApiResponse({
        status: 200,
        description: 'Import operation completed successfully',
        type: ImportResult
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input file or options'
    })
    @ApiGenericResponses()
    async importData(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB limit
                ],
            }),
        ) 
        file: Express.Multer.File,
        @Query() queryOptions: ImportOptionsDto<T>,
        @Req() req: any,
        @CurrentUser('sub') userId: string,
    ): Promise<ImportResult> {
    try {
        // Check service existence
        if (!this.importExportService) {
            throw new BadRequestException('Import/Export service not available');
        }

        // Convert string values to proper types
        const providedOptions = {
            ...queryOptions,
        };
        
        // Set default options
        const importOptions: ImportOptionsDto<T> = {
            ...providedOptions,  // Spread first so explicit values below can override
            format: providedOptions.format || this.detectFileFormat(file.originalname),
            batchSize: providedOptions.batchSize || 100,
        };
        
        // Import the data
        return await this.importExportService.importData(
            this.baseService,
            file.buffer,
            importOptions,
            userId
        );
    } catch (error: any) {
        if (error instanceof BadRequestException) {
            throw error;
        } 
        
        this.logger.error(`Error importing data: ${error.message}`, error.stack);
        throw new InternalServerErrorException(
            `Failed to import ${this.entityName} data: ${error.message}`
        );
    }
    }

    private detectFileFormat(filename: string): FileFormat {
        const extension = filename.split('.').pop()?.toLowerCase();
        
        switch (extension) {
            case 'csv':
            return FileFormat.CSV;
            case 'xls':
            case 'xlsx':
            return FileFormat.EXCEL;
            case 'json':
            return FileFormat.JSON;
            default:
            return FileFormat.CSV; // Default to CSV
        }
    }
}