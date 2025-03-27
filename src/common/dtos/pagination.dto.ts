import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Between, FindManyOptions, FindOptionsSelect, FindOptionsWhere, ILike, In, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not } from 'typeorm';

/**
 * Defines operators for advanced filtering in API queries
 * 
 * Use these operators to create complex filters on any entity field:
 * Examples:
 * - Find users with age >= 21: { "age": { "gte": 21 } }
 * - Find active users named "John": { "status": "active", "name": { "ilike": "john" } }
 * - Find orders between dates: { "createdAt": { "between": ["2023-01-01", "2023-12-31"] } }
 */
export type FilterOperators = {
  /**
   * Equal to - exact match (case-sensitive)
   * Example: { "status": { "eq": "active" } }
   */
  eq?: any;

  /**
   * Not equal to
   * Example: { "status": { "ne": "deleted" } }
   */
  ne?: any;

  /**
   * Greater than (for numbers or dates)
   * Example: { "age": { "gt": 18 } }
   */
  gt?: number | Date;

  /**
   * Greater than or equal to (for numbers or dates) 
   * Example: { "age": { "gte": 21 } }
   */
  gte?: number | Date;

  /**
   * Less than (for numbers or dates)
   * Example: { "age": { "lt": 65 } }
   */
  lt?: number | Date;

  /**
   * Less than or equal to (for numbers or dates)
   * Example: { "price": { "lte": 100 } }
   */
  lte?: number | Date;

  /**
   * Contains substring (case-sensitive)
   * Example: { "title": { "like": "product" } }
   */
  like?: string;

  /**
   * Contains substring (case-insensitive)
   * Example: { "name": { "ilike": "john" } }
   */
  ilike?: string;

  /**
   * Value falls between two values (inclusive)
   * Example: { "price": { "between": [10, 50] } }
   */
  between?: [number | Date, number | Date];

  /**
   * Value is included in the array
   * Example: { "status": { "in": ["active", "pending"] } }
   */
  in?: any[];

  /**
   * Value is not in the array
   * Example: { "status": { "nin": ["deleted", "archived"] } }
   */
  nin?: any[];

  /**
   * Field is null (true) or not null (false)
   * Example: { "deletedAt": { "isNull": true } }
   */
  isNull?: boolean;
};
/**
 * Data Transfer Object for pagination, filtering, sorting, and relation loading in API requests.
 * 
 * This class provides a standardized way to handle common database query parameters
 * such as pagination (skip/take), filtering with advanced operators, sorting,
 * relation loading, and field selection. It's designed to work with TypeORM's
 * FindManyOptions interface.
 * 
 * @example
 * // Basic usage in a controller
 * @Get()
 * async findAll(@Query() paginationDto: PaginationDto<User>) {
 *   return this.userService.findAll(paginationDto.toFindManyOptions());
 * }
 * 
 * @example
 * Query example
 * GET /users?skip=0&take=10&filter={"name":{"like":"John"}}&sort={"createdAt":"DESC"}
 * 
 * @template T The entity type this pagination will be applied to
 */
export class PaginationDto<T> {
  @ApiProperty({
    description: 'Number of items to skip',
    required: false,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  skip?: number = 0;

  @ApiProperty({
    description: 'Number of items to take',
    required: false,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  take?: number = 10;

  @ApiProperty({
    description: 'Filter criteria in JSON string format or object',
    required: false,
    example: '{"name":{"like":"%John%"},"age":{"gte":18}}',
  })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(`Invalid JSON in filter: ${errorMessage}`);
    }
  })
  filter?: string | Record<string, any>;

  @ApiProperty({
    description: 'Sort criteria in JSON string format or object',
    required: false,
    example: '{"createdAt":"DESC"}',
  })
  @IsOptional()
  sort?: string | Record<string, 'ASC' | 'DESC'>;

  @ApiProperty({
    description: 'Relations to include in the query',
    required: false,
    example: '["user","category"]',
  })
  @IsOptional()
  relations?: string | string[];

  @ApiProperty({
    description: 'Fields to select',
    required: false,
    example: '["id","name","email"]',
  })
  @IsOptional()
  select?: string | string[];

  @ApiProperty({
    description: 'User ID for filtering',
    required: false,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  toFindManyOptions(baseWhere: Partial<T> = {}): FindManyOptions<T> {
    const filterObj = this.parseStringInput(this.filter);
    const sortObj = this.parseStringInput(this.sort);
    
    // Process where conditions with advanced operators
    let filterWhere = this.applyFilterOperators(filterObj);

    // Simplify the deleted logic
    if (!filterWhere.hasOwnProperty('isDeleted')) {
      filterWhere = {
        ...filterWhere,
        isDeleted: false
      };
    }

    // Add user filter if provided
    const userWhere = this.userId ? { userId: this.userId } : {};
    
    // Process relations
    let relations: FindManyOptions<T>['relations'] = undefined;
    if (this.relations) {
      if (typeof this.relations === 'string') {
        try {
          relations = JSON.parse(this.relations);
        } catch (e) {
          relations = undefined;
        }
      } else {
        relations = this.relations;
      }
    }
    
    // Process select
    let select: FindManyOptions<T>['select'] = undefined;
    if (this.select) {
      if (typeof this.select === 'string') {
        try {
          const selectArray = JSON.parse(this.select);
          if (Array.isArray(selectArray)) {
            select = selectArray.reduce((acc, field) => {
              (acc as any)[field] = true;
              return acc;
            }, {} as FindOptionsSelect<T>);
          }
        } catch (e) {
          select = undefined;
        }
      } else if (Array.isArray(this.select)) {
        select = this.select.reduce((acc, field) => {
          (acc as any)[field] = true;
          return acc;
        }, {} as FindOptionsSelect<T>);
      }
    }

    const options: FindManyOptions<T> = {
      skip: this.skip,
      take: this.take,
      where: { 
        ...baseWhere,
        ...filterWhere,
        ...userWhere,
      } as FindOptionsWhere<T>,
      order: sortObj || undefined,
      relations,
      select,
    };

    return options;
  }

  // Parse string inputs to proper objects
  private parseStringInput(input: string | any): any {
    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch (error) {
        return {};
      }
    }
    return input || {};
  }

  // Apply advanced filter operators
  private applyFilterOperators(filterObj: Record<string, any>): FindOptionsWhere<T> {
    const result: FindOptionsWhere<T> = {};

    Object.entries(filterObj).forEach(([key, value]) => {
      // Skip null/undefined values
      if (value === null || value === undefined) return;

      // Handle nested objects (potential operators)
      if (typeof value === 'object' && !Array.isArray(value)) {
        const operators = value as FilterOperators;
        
        // Equal
        if (operators.eq !== undefined) {
          result[key as keyof T] = operators.eq as any;
        }
        
        // Not Equal
        if (operators.ne !== undefined) {
          result[key as keyof T] = Not(operators.ne) as any;
        }
        
        // Greater Than
        if (operators.gt !== undefined) {
          result[key as keyof T] = MoreThan(operators.gt) as any;
        }
        
        // Greater Than or Equal
        if (operators.gte !== undefined) {
          result[key as keyof T] = MoreThanOrEqual(operators.gte) as any;
        }
        
        // Less Than
        if (operators.lt !== undefined) {
          result[key as keyof T] = LessThan(operators.lt) as any;
        }
        
        // Less Than or Equal
        if (operators.lte !== undefined) {
          result[key as keyof T] = LessThanOrEqual(operators.lte) as any;
        }
        
        // Between
        if (operators.between && Array.isArray(operators.between) && operators.between.length === 2) {
          result[key as keyof T] = Between(operators.between[0], operators.between[1]) as any;
        }
        
        // Like (case sensitive)
        if (operators.like !== undefined) {
          result[key as keyof T] = Like(`%${operators.like}%`) as any;
        }
        
        // ILike (case insensitive)
        if (operators.ilike !== undefined) {
          result[key as keyof T] = ILike(`%${operators.ilike}%`) as any;
        }
        
        // In
        if (operators.in && Array.isArray(operators.in)) {
          result[key as keyof T] = In(operators.in) as any;
        }
        
        // Not In
        if (operators.nin && Array.isArray(operators.nin)) {
          result[key as keyof T] = Not(In(operators.nin)) as any;
        }
        
        // Is Null
        if (operators.isNull !== undefined) {
          result[key as keyof T] = (operators.isNull ? null : Not(null)) as any;
        }
      } else {
        // Simple equality match
        result[key as keyof T] = value;
      }
    });

    return result;
  }


}