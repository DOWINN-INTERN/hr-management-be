import dataSource from '@/database/data-source';
import { BaseEntity } from '@/database/entities/base.entity';
import { UsersService } from '@/modules/account-management/users/users.service';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DeepPartial, FindManyOptions, FindOptionsRelations, FindOptionsWhere, In, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { PaginationDto } from '../dtos/pagination.dto';
import { UtilityHelper } from '../helpers/utility.helper';
import { TransactionService } from './transaction.service';

@Injectable()
export abstract class BaseService<T extends BaseEntity<T>> {
  protected readonly logger = new Logger(BaseService.name);
  protected readonly transactionService = new TransactionService(dataSource);
  private readonly entityName = this.repository.target instanceof Function ? this.repository.target.name : 'Entity';
  private readonly entityType = this.repository.target instanceof Function ? this.repository.target : Object;

  constructor(
    protected readonly repository: Repository<T>,
    protected readonly usersService?: UsersService | null
  ) {}

  async findAllComplex(paginationDto: PaginationDto<T>): Promise<PaginatedResponseDto<T>> {
    try {
      const findOptions = paginationDto.toFindManyOptions();
  
      // Make better use of your existing QueryBuilder implementation
      // which already has proper filtering support
      if (this.requiresComplexQuery(findOptions)) {
        // Use your existing createQueryBuilder method which has better operator handling
        const queryBuilder = this.createQueryBuilder({
          alias: 'entity',
          filters: findOptions.where as Record<string, any>,
          relations: this.normalizeRelations(findOptions.relations),
          orderBy: findOptions.order as Record<string, 'ASC' | 'DESC'>,
          select: findOptions.select ? Object.keys(findOptions.select) : []
        });

        // Apply pagination
        (await queryBuilder).queryBuilder.skip(findOptions.skip).take(findOptions.take);
        
        const [data, totalCount] = await (await queryBuilder).queryBuilder.getManyAndCount();
        
        this.logger.debug(`Found ${totalCount} items using QueryBuilder`);
        
        // Create a new pagination DTO to maintain all methods
        const updatedPaginationDto = new PaginationDto<T>();
        Object.assign(updatedPaginationDto, paginationDto, {
          skip: findOptions.skip,
          take: findOptions.take
        });
        
        return {
          data,
          totalCount,
          meta: updatedPaginationDto,
        };
      } else {
        // For simple queries, use findAndCount
        const [data, totalCount] = await this.repository.findAndCount(findOptions);
        
        this.logger.debug(`Found ${totalCount} items using findAndCount`);
        
        // Create a new pagination DTO to maintain all methods
        const updatedPaginationDto = new PaginationDto<T>();
        Object.assign(updatedPaginationDto, paginationDto, {
          skip: findOptions.skip,
          take: findOptions.take,
        });
        
        return {
          data,
          totalCount,
          meta: updatedPaginationDto,
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error in findAll method: ${error.message}`, error.stack);
        throw new InternalServerErrorException(`Failed to retrieve ${this.entityName} records: ${error.message}`);
      } else {
        this.logger.error(`Error in findAll method: ${String(error)}`);
        throw new InternalServerErrorException(`Failed to retrieve ${this.entityName} records: ${String(error)}`);
      }
    }
  }
  
  // Helper to determine if query is complex
  private requiresComplexQuery(findOptions: FindManyOptions<T>): boolean {
    // Better logic to determine when to use QueryBuilder
    const whereKeys = Object.keys(findOptions.where || {});
    
    if (whereKeys.length > 3) return true;
    
    // Check for complex operator usage
    for (const key of whereKeys) {
      const value = (findOptions.where as any)[key];
      if (
        (typeof value === 'object' && value !== null && !(value instanceof Date)) ||
        key.includes('.')
      ) {
        return true;
      }
    }
    
    // Check if relations are complex
    if (findOptions.relations) {
      return true;
    }
    
    return false;
  }
  
  // Helper to normalize relations to object format
  private normalizeRelations(relations: any): Record<string, boolean | any> {
    if (!relations) return {};
    
    if (Array.isArray(relations)) {
      // Convert array of relations to object format
      return relations.reduce((acc, rel) => {
        acc[rel] = true;
        return acc;
      }, {} as Record<string, boolean>);
    }
    
    // Relations is already an object
    return relations;
  }


  // DONE
  async findAll(paginationDto: PaginationDto<T>): Promise<PaginatedResponseDto<T>> {
    const [data, totalCount] = await this.repository.findAndCount({
      ...paginationDto.toFindManyOptions(),
    });
    
    return {
      data,
      totalCount,
      meta: paginationDto,
    };
  }

  // DONE
  async findOneBy(criteria: Partial<T>, relations?: FindOptionsRelations<T>): Promise<T | null> {
    return await this.repository.findOne({
      where: {
        ...('isDeleted' in criteria ? {} : { isDeleted: false }),
        ...(criteria as FindOptionsWhere<T>)
      },
      relations: relations,
    });
  }
  
  // DONE
  async findOneByOrFail(criteria: Partial<T>, relations?: FindOptionsRelations<T>): Promise<T> {
    const entity = await this.findOneBy(criteria, relations);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with ${UtilityHelper.formatCriteria(criteria)} not found`);
    }
    return entity;
  }

  // DONE
  async create(createDto: DeepPartial<T>, createdById?: string): Promise<T> {
    const entity = this.repository.create({
        ...createDto,
        createdById
    });
    return await this.repository.save(entity);
  }

  // DONE
  async update(id: string, updateDto: DeepPartial<T>, updatedById?: string): Promise<T> {
      const entity = await this.findOneByOrFail({ id } as Partial<T>);
      const updatedEntity = await this.repository.save({
          ...entity,
          ...updateDto,
          updatedById
      });
      return updatedEntity;
  }
  
  // DONE
  async softDelete(id: string, deletedById?: string): Promise<T> {
    if (deletedById) {
        await this.repository.update(id, { deletedById } as any);
    }
    
    await this.repository.softDelete(id);
    
    return this.findOneByOrFail({ id } as Partial<T>);
  }

  async save(entity: T): Promise<T> {
    return await this.repository.save(entity);
  }
    
  // DONE
  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`);
    }
  }

  // DONE
  async deleteMany(ids: string[], hardDelete: boolean = false): Promise<void> {
    if (ids.length === 0) {
        throw new BadRequestException('No ids provided for deletion.');
    }

    const existingEntities = await this.repository.findBy({ 
        id: In(ids), 
    } as any);
      
    if (existingEntities.length !== ids.length) {
        const foundIds = existingEntities.map(entity => entity.id);
        const missingIds = ids.filter(id => !foundIds.includes(id));
        throw new NotFoundException(`${this.entityName}s with ids ${missingIds.join(', ')} not found.`);
    }
  
    await this.transactionService.executeInTransaction(async (queryRunner) => {
        try {
            if (!hardDelete) {
                // Perform soft delete by updating isDeleted flag
                await queryRunner.manager.update(
                    this.entityType,
                    { id: In(ids) },
                    { isDeleted: true, deletedAt: new Date() }
                );
            } else {
                // Perform hard delete (physically remove records)
                await queryRunner.manager.delete(this.entityType, ids);
            }
        } catch (error) {
            throw new InternalServerErrorException(`Failed to delete ${this.entityName}s.`);
        }
    });
  }

  async createQueryBuilder(options: {
    alias?: string;
    filters?: Record<string, any>;
    relations?: Record<string, boolean | any>;
    orderBy?: Record<string, 'ASC' | 'DESC'>;
    select?: string[];
    skip?: number;
    take?: number;
  }) {
    const {
      alias = 'entity',
      filters = {},
      relations = {},
      orderBy = {},
      select = [],
      skip,
      take
    } = options;
  
    const queryBuilder = this.repository.createQueryBuilder(alias);
    
    // Process relations first to ensure joins are established
    this.applyRelations(queryBuilder, alias, relations);
    
    // Apply filters with nested support
    this.applyFilters(queryBuilder, alias, filters);
    
    // Apply ordering
    Object.entries(orderBy).forEach(([key, direction]) => {
      queryBuilder.addOrderBy(`${alias}.${key}`, direction);
    });
    
    // Apply select fields if specified
    if (select.length > 0) {
      queryBuilder.select(select.map(field => `${alias}.${field}`));
    }
    
    // Apply pagination if specified
    if (skip !== undefined) queryBuilder.skip(skip);
    if (take !== undefined) queryBuilder.take(take);
    
    // Execute query and get results
    const [data, totalCount] = await queryBuilder.getManyAndCount();
    
    return {
      data,
      totalCount,
      queryBuilder // Include the queryBuilder in case additional operations are needed
    };
  }

  // Helper method to apply relations
  private applyRelations(
    queryBuilder: SelectQueryBuilder<T>,
    parentAlias: string,
    relations: Record<string, boolean | any>,
    prefix = ''
  ) {
    Object.entries(relations).forEach(([relationName, relationOptions]) => {
      const relationAlias = prefix ? `${prefix}_${relationName}` : relationName;
      
      if (relationOptions === true) {
        queryBuilder.leftJoinAndSelect(`${parentAlias}.${relationName}`, relationAlias);
      } else if (typeof relationOptions === 'object') {
        queryBuilder.leftJoinAndSelect(`${parentAlias}.${relationName}`, relationAlias);
        
        // Apply filters to the relation if needed
        if (relationOptions.where) {
          Object.entries(relationOptions.where).forEach(([field, value]) => {
            queryBuilder.andWhere(`${relationAlias}.${field} = :${relationAlias}_${field}`, { 
              [`${relationAlias}_${field}`]: value 
            });
          });
        }
        
        // Process nested relations
        if (relationOptions.relations) {
          this.applyRelations(
            queryBuilder, 
            relationAlias, 
            relationOptions.relations, 
            relationAlias
          );
        }
      }
    });
  }

  // Helper method to apply filters with support for nested objects and operators
private applyFilters(
  queryBuilder: SelectQueryBuilder<T>, 
  parentAlias: string, 
  filters: Record<string, any>,
  parentPath = ''
) {
  Object.entries(filters).forEach(([key, value]) => {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    const paramName = currentPath.replace(/\./g, '_');
    
    // Skip null/undefined values (but handle isNull operator later)
    if (value === null || value === undefined) {
      queryBuilder.andWhere(`${parentAlias}.${key} IS NULL`);
      return;
    }
    
    if (key.includes('.')) {
      // Handle dot notation for related entities
      const parts = key.split('.');
      let relationPath = parts[0];
      let relationAlias = relationPath;
      let field = parts[parts.length - 1];
      
      // For deeper paths, handle intermediate relations
      if (parts.length > 2) {
        const intermediateParts = parts.slice(0, -1);
        for (let i = 0; i < intermediateParts.length; i++) {
          const currentPart = intermediateParts[i];
          const nextPart = intermediateParts[i + 1];
          if (nextPart) {
            const currentAlias = intermediateParts.slice(0, i + 1).join('_');
            const nextAlias = intermediateParts.slice(0, i + 2).join('_');
            const joinPath = i === 0 ? `${parentAlias}.${currentPart}` : `${currentAlias}.${nextPart}`;
            
            if (!queryBuilder.expressionMap.joinAttributes.some(
              join => join.entityOrProperty === joinPath && join.alias.name === nextAlias
            )) {
              queryBuilder.leftJoin(joinPath, nextAlias);
            }
            
            relationAlias = nextAlias;
          }
        }
      } else {
        // Simple one-level relation
        if (!queryBuilder.expressionMap.joinAttributes.some(
          join => join.entityOrProperty === `${parentAlias}.${relationPath}` && join.alias.name === relationAlias
        )) {
          queryBuilder.leftJoin(`${parentAlias}.${relationPath}`, relationAlias);
        }
      }
      
      // Apply the condition to the deepest field
      this.applyOperator(queryBuilder, relationAlias, field, value, `${paramName}`);
    } else if (typeof value === 'object' && value !== null && !(value instanceof Date) && !Array.isArray(value)) {
      // Check if this is an operator object or a relation object
      const operatorKeys = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'between', 'in', 'nin', 'isNull'];
      const hasOperators = Object.keys(value).some(k => operatorKeys.includes(k));
      
      if (hasOperators) {
        // This is an operator object
        Object.entries(value).forEach(([operator, operatorValue]) => {
          this.applyOperator(queryBuilder, parentAlias, key, operatorValue, `${paramName}_${operator}`, operator);
        });
      } else {
        // This is a nested relation filter
        const relationAlias = parentPath ? `${parentPath}_${key}` : key;
        
        // Ensure the relation is joined if not already
        if (!queryBuilder.expressionMap.joinAttributes.some(
          join => join.entityOrProperty === `${parentAlias}.${key}` && join.alias.name === relationAlias
        )) {
          queryBuilder.leftJoin(`${parentAlias}.${key}`, relationAlias);
        }
        
        // Recursively apply filters to the nested relation
        this.applyFilters(queryBuilder, relationAlias, value, relationAlias);
      }
    } else if (Array.isArray(value)) {
      // Handle array values
      if (value.length === 0) {
        // Empty array - can't match anything
        queryBuilder.andWhere('1 = 0'); // Always false condition
      } else if (typeof value[0] === 'object' && value[0] !== null) {
        // Array of objects (likely entity references)
        const relationAlias = parentPath ? `${parentPath}_${key}` : key;
        
        // Ensure the relation is joined
        if (!queryBuilder.expressionMap.joinAttributes.some(
          join => join.entityOrProperty === `${parentAlias}.${key}` && join.alias.name === relationAlias
        )) {
          queryBuilder.innerJoin(`${parentAlias}.${key}`, relationAlias);
        }
        
        // Extract IDs from objects
        const ids = value.map(item => item.id || item);
        queryBuilder.andWhere(`${relationAlias}.id IN (:...${paramName}Ids)`, { 
          [`${paramName}Ids`]: ids
        });
      } else {
        // Array of primitive values
        queryBuilder.andWhere(`${parentAlias}.${key} IN (:...${paramName})`, { 
          [`${paramName}`]: value 
        });
      }
    } else {
      // Simple equality for primitive values
      this.applyOperator(queryBuilder, parentAlias, key, value, paramName);
    }
  });
}

// Helper method to apply specific operator
private applyOperator(
  queryBuilder: SelectQueryBuilder<T>, 
  alias: string, 
  field: string, 
  value: any, 
  paramName: string,
  operator?: string
) {
  // Default operator is equality
  if (!operator) {
    if (value === null) {
      queryBuilder.andWhere(`${alias}.${field} IS NULL`);
    } else {
      queryBuilder.andWhere(`${alias}.${field} = :${paramName}`, { [paramName]: value });
    }
    return;
  }
  
  // Handle specific operators
  switch (operator) {
    case 'eq':
      queryBuilder.andWhere(`${alias}.${field} = :${paramName}`, { [paramName]: value });
      break;
    case 'ne':
      queryBuilder.andWhere(`${alias}.${field} != :${paramName}`, { [paramName]: value });
      break;
    case 'gt':
      queryBuilder.andWhere(`${alias}.${field} > :${paramName}`, { [paramName]: value });
      break;
    case 'gte':
      queryBuilder.andWhere(`${alias}.${field} >= :${paramName}`, { [paramName]: value });
      break;
    case 'lt':
      queryBuilder.andWhere(`${alias}.${field} < :${paramName}`, { [paramName]: value });
      break;
    case 'lte':
      queryBuilder.andWhere(`${alias}.${field} <= :${paramName}`, { [paramName]: value });
      break;
    case 'like':
      queryBuilder.andWhere(`${alias}.${field} LIKE :${paramName}`, { 
        [paramName]: `%${value}%` 
      });
      break;
    case 'ilike':
      // Use LOWER for case insensitivity (PostgreSQL has ILIKE, but this is more DB-agnostic)
      queryBuilder.andWhere(`LOWER(${alias}.${field}) LIKE LOWER(:${paramName})`, { 
        [paramName]: `%${value}%` 
      });
      break;
    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        queryBuilder.andWhere(`${alias}.${field} BETWEEN :${paramName}0 AND :${paramName}1`, { 
          [`${paramName}0`]: value[0],
          [`${paramName}1`]: value[1]
        });
      }
      break;
    case 'in':
      if (Array.isArray(value)) {
        queryBuilder.andWhere(`${alias}.${field} IN (:...${paramName})`, { [paramName]: value });
      }
      break;
    case 'nin':
      if (Array.isArray(value)) {
        queryBuilder.andWhere(`${alias}.${field} NOT IN (:...${paramName})`, { [paramName]: value });
      }
      break;
    case 'isNull':
      if (value === true) {
        queryBuilder.andWhere(`${alias}.${field} IS NULL`);
      } else {
        queryBuilder.andWhere(`${alias}.${field} IS NOT NULL`);
      }
      break;
    default:
      queryBuilder.andWhere(`${alias}.${field} = :${paramName}`, { [paramName]: value });
  }
}
}
