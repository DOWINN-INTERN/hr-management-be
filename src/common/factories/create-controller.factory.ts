import { BaseEntity } from '@/database/entities/base.entity';
import { Body, Controller, HttpStatus, Inject, Param, Type } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { singular } from 'pluralize';
import { BaseController } from '../controllers/base.controller';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Override } from '../decorators/override.decorator';
import { GeneralResponseDto } from '../dtos/generalresponse.dto';
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
      summary: `Delete a ${singular(entityName)}`,
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
  }
    

  return DynamicController;
}