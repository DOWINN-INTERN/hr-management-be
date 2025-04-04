import dataSource from '@/database/data-source';
import { BaseEntity } from '@/database/entities/base.entity';
import { UsersService } from '@/modules/account-management/users/users.service';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DeepPartial, FindOneOptions, FindOptionsOrder, FindOptionsRelations, FindOptionsSelect, FindOptionsWhere, In, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';
import { PaginationDto } from '../dtos/pagination.dto';
import { UtilityHelper } from '../helpers/utility.helper';
import { TransactionService } from './transaction.service';

// Type for expression functions
export type Expression<T, TResult> = (entity: T) => TResult;

@Injectable()
export abstract class BaseService<T extends BaseEntity<T>> {
  protected readonly logger = new Logger(BaseService.name);
  protected readonly transactionService = new TransactionService(dataSource);
  private readonly entityName = this.repository.target instanceof Function ? this.repository.target.name : 'Entity';
  private readonly entityType = this.repository.target instanceof Function ? this.repository.target : Object;

  // State for query building
  private queryState: {
    includes: Map<string, string>;
    whereConditions: string[];
    parameters: Record<string, any>;
    orderByClauses: string[];
    skipValue: number;
    takeValue: number;
    isTracking: boolean;
    queryBuilder: SelectQueryBuilder<T> | null;
    parentPath: string;
    paramCounter: number;
  } = {
    includes: new Map(),
    whereConditions: [],
    parameters: {},
    orderByClauses: [],
    skipValue: 0,
    takeValue: 0,
    isTracking: true,
    queryBuilder: null,
    parentPath: '',
    paramCounter: 0
  };

  constructor(
    protected readonly repository: Repository<T>,
    protected readonly usersService?: UsersService | null
  ) {}

  getRepository(): Repository<T> {
    return this.repository;
  }

  async findAllComplex(paginationDto: PaginationDto<T>): Promise<PaginatedResponseDto<T>> {
    try {
      const findOptions = paginationDto.toFindManyOptions();

      // For complex filtering that requires JOIN operations or custom SQL
      if (Object.keys(findOptions.where || {}).length > 3) {
        // Use QueryBuilder for more complex queries
        const queryBuilder = this.repository.createQueryBuilder('entity');
        
        // Apply where conditions from findOptions
        Object.entries(findOptions.where || {}).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            // Handle TypeORM operators
            queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
          } else {
            queryBuilder.andWhere(`entity.${key} = :${key}`, { [key]: value });
          }
        });
        
        // Apply ordering
        if (findOptions.order) {
          Object.entries(findOptions.order).forEach(([key, direction]) => {
            queryBuilder.addOrderBy(`entity.${key}`, direction);
          });
        }
        
        // Apply relations
        if (findOptions.relations) {
          Object.keys(findOptions.relations).forEach(relation => {
            queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
          });
        }
        
        // Apply pagination
        queryBuilder.skip(findOptions.skip).take(findOptions.take);
        
        const [data, totalCount] = await queryBuilder.getManyAndCount();
        
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

  /**
   * Finds a single entity matching the specified criteria.
   * 
   * @param criteria - Fields to search by (partial entity)
   * @param options - Additional query options
   * @param options.relations - Relations to eager load with the entity
   * @param options.select - Fields to select from the entity
   * @param options.order - Sort order for the query results
   * @param options.withDeleted - Whether to include soft-deleted entities (default: false)
   * @param options.cache - Enable result caching (boolean, TTL in ms, or cache options object)
   * @param options.loadEagerRelations - Whether to load eager relations (default: true)
   * @param options.transaction - Whether the query should use an existing transaction
   * 
   * @returns A Promise resolving to the matched entity or null if not found
   * 
   * @example
   * // Find a user by email
   * const user = await userService.findOneBy({ email: 'example@domain.com' });
   * 
   * // Find a user with related posts
   * const userWithPosts = await userService.findOneBy(
   *   { id: 123 },
   *   { relations: { posts: true } }
   * );
   */
  async findOneBy(
    criteria: Partial<T>,
    options?: {
      relations?: FindOptionsRelations<T>;
      select?: FindOptionsSelect<T>;
      order?: FindOptionsOrder<T>;
      withDeleted?: boolean;
      cache?: boolean | number | { id: any; milliseconds: number };
      loadEagerRelations?: boolean;
      transaction?: boolean;
    }
  ): Promise<T | null> {
    const findOptions: FindOneOptions<T> = {
      where: {
        ...(!options?.withDeleted && 'isDeleted' in criteria ? {} : { isDeleted: false }),
        ...(criteria as FindOptionsWhere<T>)
      },
      ...options
    };
    
    return await this.repository.findOne(findOptions);
  }

  async findOneByOrFail(criteria: Partial<T>,
    options?: {
      relations?: FindOptionsRelations<T>;
      select?: FindOptionsSelect<T>;
      order?: FindOptionsOrder<T>;
      withDeleted?: boolean;
      cache?: boolean | number | { id: any; milliseconds: number };
      loadEagerRelations?: boolean;
      transaction?: boolean;
    }): Promise<T> {
    const entity = await this.findOneBy(criteria, options);
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with ${UtilityHelper.formatCriteria(criteria)} not found`);
    }
    return entity;
  }

  // DONE
  async create(createDto: DeepPartial<T>, createdBy?: string): Promise<T> {
    const entity = this.repository.create({
        ...createDto,
        createdBy
    });
    
    try {
      return await this.repository.save(entity);
    } catch (error) {
      console.log('Full error object:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // DONE
  async update(id: string, updateDto: DeepPartial<T>, updatedBy?: string): Promise<T> {
      const entity = await this.findOneByOrFail({ id } as Partial<T>);
      const updatedEntity = await this.repository.save({
          ...entity,
          ...updateDto,
          updatedBy
      });
      return updatedEntity;
  }
  
  // DONE
  async softDelete(id: string, deletedBy?: string): Promise<T> {
    if (deletedBy) {
        await this.repository.update(id, { deletedBy } as any);
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

  protected createQueryBuilder(options: {
    alias?: string;
    filters?: Record<string, any>;
    relations?: Record<string, boolean | any>;
    orderBy?: Record<string, 'ASC' | 'DESC'>;
    select?: string[];
  }) {
    const {
      alias = 'entity',
      filters = {},
      relations = {},
      orderBy = {},
      select = []
    } = options;
  
    const queryBuilder = this.repository.createQueryBuilder(alias);
    
    // Apply WHERE conditions
    Object.entries(filters).forEach(([key, value]) => {
      if (key.includes('.')) {
        // Handle nested filters (relations)
        const [relationPath, field] = key.split('.');
        queryBuilder.andWhere(`${relationPath}.${field} = :${key.replace('.', '_')}`, { 
          [key.replace('.', '_')]: value 
        });
      } else if (Array.isArray(value)) {
        // Handle array values like roles
        if (key.endsWith('s') && typeof value[0] === 'object') {
          // Many-to-many or one-to-many relation array (like "roles")
          const relationName = key;
          const relationAlias = `${relationName}_filtered`;
          
          queryBuilder.innerJoinAndSelect(`${alias}.${relationName}`, relationAlias);
          queryBuilder.andWhere(`${relationAlias}.id IN (:...${key}Ids)`, { 
            [`${key}Ids`]: value.map(item => item.id || item) 
          });
        } else {
          // Simple array values
          queryBuilder.andWhere(`${alias}.${key} IN (:...${key})`, { [key]: value });
        }
      } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        // Handle TypeORM operators
        Object.entries(value).forEach(([operator, operatorValue]) => {
          switch (operator) {
            case 'like':
              queryBuilder.andWhere(`${alias}.${key} LIKE :${key}_like`, { 
                [`${key}_like`]: `%${operatorValue}%` 
              });
              break;
            case 'gt':
              queryBuilder.andWhere(`${alias}.${key} > :${key}_gt`, { [`${key}_gt`]: operatorValue });
              break;
            case 'gte':
              queryBuilder.andWhere(`${alias}.${key} >= :${key}_gte`, { [`${key}_gte`]: operatorValue });
              break;
            case 'lt':
              queryBuilder.andWhere(`${alias}.${key} < :${key}_lt`, { [`${key}_lt`]: operatorValue });
              break;
            case 'lte':
              queryBuilder.andWhere(`${alias}.${key} <= :${key}_lte`, { [`${key}_lte`]: operatorValue });
              break;
            default:
              queryBuilder.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
          }
        });
      } else {
        // Simple equality
        queryBuilder.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
      }
    });
    
    // Apply relations
    Object.entries(relations).forEach(([relationName, relationOptions]) => {
      if (relationOptions === true) {
        queryBuilder.leftJoinAndSelect(`${alias}.${relationName}`, relationName);
      } else if (typeof relationOptions === 'object') {
        const relationAlias = relationName;
        queryBuilder.leftJoinAndSelect(`${alias}.${relationName}`, relationAlias);
        
        // Apply filters to the relation if needed
        if (relationOptions.where) {
          Object.entries(relationOptions.where).forEach(([field, value]) => {
            queryBuilder.andWhere(`${relationAlias}.${field} = :${relationAlias}_${field}`, { 
              [`${relationAlias}_${field}`]: value 
            });
          });
        }
      }
    });
    
    // Apply ordering
    Object.entries(orderBy).forEach(([key, direction]) => {
      queryBuilder.addOrderBy(`${alias}.${key}`, direction);
    });
    
    // Apply select fields if specified
    if (select.length > 0) {
      queryBuilder.select(select.map(field => `${alias}.${field}`));
    }
    
    return queryBuilder;
  }

  /**
   * Include a related entity (similar to EF Include)
   */
  include<TProperty>(navigationPropertyPath: Expression<T, TProperty | TProperty[]>): this {
    const propertyName = this.getPropertyName(navigationPropertyPath);
    const joinAlias = propertyName;
    const joinPath = `${this.repository.metadata.name.toLowerCase()}.${propertyName}`;
    
    this.queryState.includes.set(propertyName, joinPath);
    this.queryState.parentPath = propertyName;
    
    return this;
  }
  
  /**
   * Include a nested related entity (similar to EF ThenInclude)
   */
  thenInclude<TProperty, TNext>(navigationPropertyPath: Expression<TProperty, TNext | TNext[]>): this {
    const propertyName = this.getPropertyName(navigationPropertyPath);
    const parentPath = this.queryState.parentPath;
    const joinPath = `${parentPath}.${propertyName}`;
    
    this.queryState.includes.set(joinPath, joinPath);
    this.queryState.parentPath = joinPath;
    
    return this;
  }
  
  /**
   * Filter entities based on a predicate
   */
  where(predicate: Expression<T, boolean>): this {
    const condition = this.parseExpression(predicate);
    this.queryState.whereConditions.push(condition.query);
    Object.assign(this.queryState.parameters, condition.parameters);
    
    return this;
  }
  
  /**
   * Order entities by a property ascending
   */
  orderBy<TKey>(keySelector: Expression<T, TKey>): this {
    const propertyName = this.getPropertyName(keySelector);
    const alias = this.repository.metadata.name.toLowerCase();
    this.queryState.orderByClauses.push(`${alias}.${propertyName} ASC`);
    
    return this;
  }
  
  /**
   * Order entities by a property descending
   */
  orderByDescending<TKey>(keySelector: Expression<T, TKey>): this {
    const propertyName = this.getPropertyName(keySelector);
    const alias = this.repository.metadata.name.toLowerCase();
    this.queryState.orderByClauses.push(`${alias}.${propertyName} DESC`);
    
    return this;
  }
  
  /**
   * Add a secondary ordering by a property ascending
   */
  thenBy<TKey>(keySelector: Expression<T, TKey>): this {
    const propertyName = this.getPropertyName(keySelector);
    const alias = this.repository.metadata.name.toLowerCase();
    this.queryState.orderByClauses.push(`${alias}.${propertyName} ASC`);
    
    return this;
  }
  
  /**
   * Add a secondary ordering by a property descending
   */
  thenByDescending<TKey>(keySelector: Expression<T, TKey>): this {
    const propertyName = this.getPropertyName(keySelector);
    const alias = this.repository.metadata.name.toLowerCase();
    this.queryState.orderByClauses.push(`${alias}.${propertyName} DESC`);
    
    return this;
  }
  
  /**
   * Skip a number of entities (for pagination)
   */
  skip(count: number): this {
    this.queryState.skipValue = count;
    return this;
  }
  
  /**
   * Take a number of entities (for pagination)
   */
  take(count: number): this {
    this.queryState.takeValue = count;
    return this;
  }
  
  /**
   * Execute the query with no tracking (better performance)
   */
  asNoTracking(): this {
    this.queryState.isTracking = false;
    return this;
  }
  
  /**
   * Execute the query and return all entities as a list
   */
  async toList(): Promise<T[]> {
    try {
      const query = this.buildQuery();
      
      if (this.queryState.skipValue > 0) {
        query.skip(this.queryState.skipValue);
      }
      
      if (this.queryState.takeValue > 0) {
        query.take(this.queryState.takeValue);
      }
      
      const result = await query.getMany();
      this.resetQueryState();
      return result;
    } catch (error) {
      this.resetQueryState();
      throw error;
    }
  }
  
  /**
   * Execute the query and return a paginated response
   */
  async toPagedList(skip = 0, take = 10): Promise<PaginatedResponseDto<T>> {
    try {
      const query = this.buildQuery();
      
      // Use provided values or those set by skip()/take() methods
      const skipValue = this.queryState.skipValue > 0 ? this.queryState.skipValue : skip;
      const takeValue = this.queryState.takeValue > 0 ? this.queryState.takeValue : take;
      
      query.skip(skipValue).take(takeValue);
      
      const [data, totalCount] = await Promise.all([
        query.getMany(),
        query.getCount()
      ]);
      
      const paginationDto = new PaginationDto<T>();
      Object.assign(paginationDto, {
        skip: skipValue,
        take: takeValue
      });
      
      this.resetQueryState();
      
      return {
        data,
        totalCount,
        meta: paginationDto
      };
    } catch (error) {
      this.resetQueryState();
      throw error;
    }
  }
  
  /**
   * Execute the query and return the first entity or null
   */
  async firstOrDefault(): Promise<T | null> {
    try {
      const query = this.buildQuery();
      query.take(1);
      
      const result = await query.getOne();
      this.resetQueryState();
      return result;
    } catch (error) {
      this.resetQueryState();
      throw error;
    }
  }
  
  /**
   * Execute the query and return the first entity or throw if not found
   */
  async first(): Promise<T> {
    const result = await this.firstOrDefault();
    if (!result) {
      throw new NotFoundException(`${this.entityName} not found`);
    }
    return result;
  }
  
  /**
   * Execute the query and return a single entity or null
   * Throws if more than one entity is found
   */
  async singleOrDefault(): Promise<T | null> {
    try {
      const query = this.buildQuery();
      const entities = await query.getMany();
      
      if (entities.length > 1) {
        throw new BadRequestException(`Expected a single ${this.entityName}, but found multiple`);
      }
      
      this.resetQueryState();
      return entities.length === 1 ? entities[0] : null;
    } catch (error) {
      this.resetQueryState();
      throw error;
    }
  }
  
  /**
   * Execute the query and return a single entity
   * Throws if no entity is found or more than one entity is found
   */
  async single(): Promise<T> {
    const result = await this.singleOrDefault();
    if (!result) {
      throw new NotFoundException(`${this.entityName} not found`);
    }
    return result;
  }
  
  /**
   * Count the number of entities that match the query
   */
  async count(): Promise<number> {
    try {
      const query = this.buildQuery();
      const count = await query.getCount();
      this.resetQueryState();
      return count;
    } catch (error) {
      this.resetQueryState();
      throw error;
    }
  }
  
  /**
   * Check if any entities match the query
   */
  async any(): Promise<boolean> {
    const count = await this.count();
    return count > 0;
  }
  
  // Private helper methods
  
  /**
   * Build the TypeORM query from the state
   */
  private buildQuery(): SelectQueryBuilder<T> {
    const alias = this.repository.metadata.name.toLowerCase();
    const query = this.repository.createQueryBuilder(alias);
    
    // Add includes (relations)
    this.queryState.includes.forEach((joinPath, key) => {
      const relationAlias = key.replace(/\./g, '_');
      query.leftJoinAndSelect(joinPath, relationAlias);
    });
    
    // Add where conditions
    this.queryState.whereConditions.forEach(condition => {
      query.andWhere(condition);
    });
    
    // Add parameters
    if (Object.keys(this.queryState.parameters).length > 0) {
      query.setParameters(this.queryState.parameters);
    }
    
    // Add order by
    this.queryState.orderByClauses.forEach(orderBy => {
      const [path, direction] = orderBy.split(' ');
      query.addOrderBy(path, direction as 'ASC' | 'DESC');
    });
    
    // Filter out soft-deleted entities by default
    query.andWhere(`${alias}.isDeleted = :isDeleted`, { isDeleted: false });
    
    return query;
  }
  
  /**
   * Extract property name from an expression
   */
  private getPropertyName<TResult>(expression: Expression<any, TResult>): string {
    const funcStr = expression.toString();
    
    // Extract property name after the arrow function parameter
    const regex = /=>.*?\.([a-zA-Z0-9_]+)(?:\s|$|\)|\.|\[)/;
    const match = funcStr.match(regex);
    
    if (!match) {
      throw new Error(`Could not extract property name from expression: ${funcStr}`);
    }
    
    return match[1];
  }
  
  /**
   * Parse an expression into a SQL condition
   */
  private parseExpression(expression: Expression<any, boolean>): { query: string; parameters: Record<string, any> } {
    const funcStr = expression.toString();
    const parameters: Record<string, any> = {};
    const alias = this.repository.metadata.name.toLowerCase();
    
    // Check for logical operators (AND, OR)
    if (funcStr.includes('&&') || funcStr.includes('||')) {
      return this.parseLogicalExpression(funcStr, alias);
    }
    
    // Handle basic comparison operations
    const comparisonRegex = /=>.*?\.([a-zA-Z0-9_]+)\s*(===|==|!==|!=|>=|<=|>|<)\s*([^;)]+)/;
    const comparisonMatch = funcStr.match(comparisonRegex);
    
    if (comparisonMatch) {
      const [_, property, operator, value] = comparisonMatch;
      const paramName = `param${++this.queryState.paramCounter}`;
      
      // Parse the value
      let parsedValue;
      if (value.trim() === 'true') parsedValue = true;
      else if (value.trim() === 'false') parsedValue = false;
      else if (value.trim() === 'null') parsedValue = null;
      else if (/^['"].*['"]$/.test(value.trim())) parsedValue = value.trim().slice(1, -1);
      else if (!isNaN(Number(value.trim()))) parsedValue = Number(value.trim());
      else parsedValue = value.trim();
      
      parameters[paramName] = parsedValue;
      
      // Map JS operator to SQL operator
      const sqlOperator = this.mapOperator(operator);
      return {
        query: `${alias}.${property} ${sqlOperator} :${paramName}`,
        parameters
      };
    }
    
    // Handle method calls (includes, startsWith, endsWith)
    const methodRegex = /=>.*?\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\(([^)]*)\)/;
    const methodMatch = funcStr.match(methodRegex);
    
    if (methodMatch) {
      const [_, property, method, args] = methodMatch;
      const paramName = `param${++this.queryState.paramCounter}`;
      
      // Parse the arguments
      const parsedArgs = args.trim().split(',').map(arg => {
        const trimmedArg = arg.trim();
        if (trimmedArg.startsWith("'") || trimmedArg.startsWith('"')) {
          return trimmedArg.slice(1, -1);
        }
        return trimmedArg;
      });
      
      // Handle common string methods
      switch (method) {
        case 'includes':
          return {
            query: `${alias}.${property} LIKE :${paramName}`,
            parameters: { [paramName]: `%${parsedArgs[0]}%` }
          };
        case 'startsWith':
          return {
            query: `${alias}.${property} LIKE :${paramName}`,
            parameters: { [paramName]: `${parsedArgs[0]}%` }
          };
        case 'endsWith':
          return {
            query: `${alias}.${property} LIKE :${paramName}`,
            parameters: { [paramName]: `%${parsedArgs[0]}` }
          };
        case 'indexOf':
          return {
            query: `${alias}.${property} LIKE :${paramName}`,
            parameters: { [paramName]: `%${parsedArgs[0]}%` }
          };
        case 'toLowerCase':
          return {
            query: `LOWER(${alias}.${property}) = LOWER(:${paramName})`,
            parameters: { [paramName]: parsedArgs[0] || '' }
          };
        case 'toUpperCase':
          return {
            query: `UPPER(${alias}.${property}) = UPPER(:${paramName})`,
            parameters: { [paramName]: parsedArgs[0] || '' }
          };
        case 'trim':
          return {
            query: `TRIM(${alias}.${property}) = :${paramName}`,
            parameters: { [paramName]: parsedArgs[0] || '' }
          };
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    }
    
    // Handle null/undefined checks
    const nullCheckRegex = /=>.*?\.([a-zA-Z0-9_]+)\s*===?\s*(null|undefined)/;
    const nullCheckMatch = funcStr.match(nullCheckRegex);
    
    if (nullCheckMatch) {
      const [_, property] = nullCheckMatch;
      return {
        query: `${alias}.${property} IS NULL`,
        parameters: {}
      };
    }
    
    const notNullCheckRegex = /=>.*?\.([a-zA-Z0-9_]+)\s*!==?\s*(null|undefined)/;
    const notNullCheckMatch = funcStr.match(notNullCheckRegex);
    
    if (notNullCheckMatch) {
      const [_, property] = notNullCheckMatch;
      return {
        query: `${alias}.${property} IS NOT NULL`,
        parameters: {}
      };
    }
    
    // Fallback for unrecognized expressions
    this.logger.warn(`Could not parse expression: ${funcStr}. Using default true condition.`);
    return {
      query: '1=1', // Always true
      parameters: {}
    };
  }

  /**
   * Parse logical expressions with AND (&&) or OR (||)
   */
  private parseLogicalExpression(funcStr: string, alias: string): { query: string; parameters: Record<string, any> } {
    let parameters: Record<string, any> = {};
    
    // Function to create a dummy Expression
    const createDummyExpression = (expressionStr: string): Expression<any, boolean> => {
      return new Function(`return ${expressionStr}`)() as Expression<any, boolean>;
    };
    
    // Split by OR first (lower precedence)
    if (funcStr.includes('||')) {
      const orParts = funcStr.split('||').map(part => {
        // Extract just the lambda function part for each condition
        const lambdaMatch = part.match(/(?:^\s*|[|&]{2}\s*)(\([^=]*=>\s*[^|&]*)/);
        if (lambdaMatch && lambdaMatch[1]) {
          const fixedExpression = `${lambdaMatch[1]})`;
          const result = this.parseExpression(createDummyExpression(fixedExpression));
          parameters = { ...parameters, ...result.parameters };
          return `(${result.query})`;
        }
        return '1=1'; // Default to true for parts we can't parse
      });
      
      return {
        query: orParts.join(' OR '),
        parameters
      };
    }
    
    // Split by AND
    if (funcStr.includes('&&')) {
      const andParts = funcStr.split('&&').map(part => {
        // Extract just the lambda function part for each condition
        const lambdaMatch = part.match(/(?:^\s*|[|&]{2}\s*)(\([^=]*=>\s*[^|&]*)/);
        if (lambdaMatch && lambdaMatch[1]) {
          const fixedExpression = `${lambdaMatch[1]})`;
          const result = this.parseExpression(createDummyExpression(fixedExpression));
          parameters = { ...parameters, ...result.parameters };
          return `(${result.query})`;
        }
        return '1=1'; // Default to true for parts we can't parse
      });
      
      return {
        query: andParts.join(' AND '),
        parameters
      };
    }
    
    // Should not reach here
    return {
      query: '1=1',
      parameters: {}
    };
  }
  /**
   * Map JavaScript operators to SQL operators
   */
  private mapOperator(operator: string): string {
    switch (operator) {
      case '===':
      case '==': return '=';
      case '!==':
      case '!=': return '!=';
      case '>': return '>';
      case '>=': return '>=';
      case '<': return '<';
      case '<=': return '<=';
      default: return '=';
    }
  }
  
  /**
   * Reset the query state after execution
   */
  private resetQueryState(): void {
    this.queryState = {
      includes: new Map(),
      whereConditions: [],
      parameters: {},
      orderByClauses: [],
      skipValue: 0,
      takeValue: 0,
      isTracking: true,
      queryBuilder: null,
      parentPath: '',
      paramCounter: 0
    };
  }
}
