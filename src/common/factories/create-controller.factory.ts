import { BaseEntity } from '@/database/entities/base.entity';
import { Body, Controller, Inject, Param, Type } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { singular } from 'pluralize';
import { BaseController } from '../controllers/base.controller';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Override } from '../decorators/override.decorator';
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
    constructor(@Inject(ServiceClass) baseService: BaseService<TEntity> ) {
      super(baseService, getDtoClass, entityName);
    }

    @Override()
    @ApiBody({ type: createDtoClass, description: `${singular(entityName)} creation data` })
    override async create(
      @Body() entityDto: CreateDto,
      @CurrentUser('sub') createdById: string
    ): Promise<GetDto> {
      return await super.create(entityDto, createdById);
    }

    @Override()
    @ApiParam({ name: 'id', description: `${singular(entityName)} ID` })
    @ApiBody({ type: updateDtoClass, description: `${singular(entityName)} update data` })
    override async update(
        @Param('id') id: string,
        @Body() entityDto: UpdateDto,
        @CurrentUser('sub') updatedById: string
    ): Promise<GetDto> {
      return await super.update(id, entityDto, updatedById);
    }
  }

  return DynamicController;
}