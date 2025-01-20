import { Injectable, Logger } from '@nestjs/common';
import { Repository, DeepPartial, FindOneOptions, FindManyOptions, ObjectLiteral } from 'typeorm';
import { PaginationDto } from '../dtos/pagination.dto';
import { GeneralResponseDto } from '../dtos/general-response.dto';

@Injectable()
export class BaseService<T extends ObjectLiteral> {
  private readonly logger = new Logger(BaseService.name);

  constructor(private readonly repository: Repository<T>) {}

  async findAll(paginationDto: PaginationDto, options?: FindManyOptions<T>): Promise<GeneralResponseDto<T>> {
    try {
      const [data, count] = await this.repository.findAndCount({
        ...options,
        skip: paginationDto.skip,
        take: paginationDto.take,
      });
      return { data, count };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to find all entities: ${err.message}`, err.stack);
      throw error;
    }
  }

  async findOne(id: string, options?: FindOneOptions<T>): Promise<T> {
    try {
      const entity = await this.repository.findOne({ where: { id: id as any }, ...options });
      if (!entity) {
        throw new Error(`Entity with id ${id} not found`);
      }
      return entity;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to find entity with id ${id}: ${err.message}`, err.stack);
      throw error;
    }
  }

  async create(createDto: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(createDto);
      return await this.repository.save(entity);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to create entity: ${err.message}`, err.stack);
      throw error;
    }
  }

  async update(id: string, updateDto: DeepPartial<T>): Promise<T> {
    try {
      await this.repository.update(id, updateDto as any);
      return await this.findOne(id);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to update entity with id ${id}: ${err.message}`, err.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to remove entity with id ${id}: ${err.message}`, err.stack);
      throw error;
    }
  }
}
