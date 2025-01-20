import { Get, Post, Put, Delete, Param, Body, Query, Controller } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseService } from '../services/base.service';
import { PaginationDto } from '../dtos/pagination.dto';
import { GeneralResponseDto } from '../dtos/general-response.dto';
import { CreateDto, UpdateDto } from '../dtos/create-update.dto';

@Controller()
export class BaseController<T extends Record<string, any>> {
  constructor(private readonly baseService: BaseService<T>) {}

  @Get()
  @ApiTags('Base')
  @ApiOperation({ summary: 'Get all entities' })
  @ApiResponse({ status: 200, description: 'Return all entities.' })
  findAll(@Query() paginationDto: PaginationDto): Promise<GeneralResponseDto<T>> {
    return this.baseService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiTags('Base')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiResponse({ status: 200, description: 'Return entity by ID.' })
  findOne(@Param('id') id: string): Promise<T> {
    return this.baseService.findOne(id);
  }

  @Post()
  @ApiTags('Base')
  @ApiOperation({ summary: 'Create a new entity' })
  @ApiResponse({ status: 201, description: 'The entity has been successfully created.' })
  create(@Body() createDto: CreateDto): Promise<T> {
    return this.baseService.create(createDto as DeepPartial<T>);
  }

  @Put(':id')
  @ApiTags('Base')
  @ApiOperation({ summary: 'Update an entity' })
  @ApiResponse({ status: 200, description: 'The entity has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateDto: UpdateDto): Promise<T> {
    return this.baseService.update(id, updateDto as DeepPartial<T>);
  }

  @Delete(':id')
  @ApiTags('Base')
  @ApiOperation({ summary: 'Delete an entity' })
  @ApiResponse({ status: 200, description: 'The entity has been successfully deleted.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.baseService.remove(id);
  }
}
