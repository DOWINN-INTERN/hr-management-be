import { IRole } from '@/modules/employee-management/roles/interface/role.interface';
import { CallHandler, ExecutionContext, Injectable, InternalServerErrorException, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RoleScopeType } from '../enums/role-scope-type.enum';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

// Define proper interfaces for improved type safety
export interface ResourceScope {
  type: RoleScopeType;
  userId?: string;
  departments?: string[];
  branches?: string[];
  organizations?: string[];
}

interface TypeOrmFilters {
  userId?: string;
  departments?: string[];
  branches?: string[];
  organizations?: string[];
}

@Injectable()
export class ScopeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ScopeInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      const request = context.switchToHttp().getRequest();
      const user: IJwtPayload = request.user;
      const method = request.method;
      const path = request.path;

      this.logger.debug(`Processing ${method} request to ${path}`);
      
      if (!user) {
        this.logger.debug('No authenticated user found in request');
        return next.handle();
      }

      this.logger.debug(`Setting resource scope for user: ${user.sub}`);
      
      try {
        // Determine effective scope
        const roleScope = this.determineEffectiveScope(user.roles || []);
        this.logger.debug(`Determined effective scope: ${roleScope.scopeType}`);
        
        // Store scope information with correct property names
        const resourceScope: ResourceScope = {
          type: roleScope.scopeType,
          userId: user.sub,
          departments: user.roles?.flatMap(role => role.departmentId).filter((id): id is string => id !== undefined && id !== null) || [],
          branches: user.roles?.flatMap(role => role.branchId).filter((id): id is string => id !== undefined && id !== null) || [],
          organizations: user.roles?.flatMap(role => role.organizationId).filter((id): id is string => id !== undefined && id !== null) || [],
        };
        
        request.resourceScope = resourceScope;
        
        // Apply TypeORM-compatible filters based on scope
        request.filters = this.createTypeOrmFilters(resourceScope);
        
        this.logger.debug(`Applied filters for scope type: ${resourceScope.type}`);
      } catch (error: any) {
        this.logger.error(`Error setting up resource scope: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Failed to process authorization scope');
      }

      // Process the response to filter data
      return next.handle().pipe(
        map(data => {
          try {
            // Skip non-GET requests or if no scope defined
            if (request.method !== 'GET' || !request.resourceScope) {
              return data;
            }
            
            this.logger.debug(`Filtering GET response data by scope: ${request.resourceScope.type}`);
            
            // If data is an array, filter it based on scope
            if (Array.isArray(data)) {
              const filteredCount = data.length;
              const result = this.filterDataByScope(data, request.resourceScope);
              
              this.logger.debug(`Filtered data: ${result.length}/${filteredCount} items passed scope filter`);
              return result;
            }
            
            return data;
          } catch (error: any) {
            this.logger.error(`Error filtering response data: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to process response data');
          }
        }),
        catchError(error => {
          this.logger.error(`Interceptor pipeline error: ${error.message}`, error.stack);
          throw error;
        })
      );
    } catch (error: any) {
      this.logger.error(`ScopeInterceptor error: ${error.message}`, error.stack);
      throw error;
    }
  }

  private createTypeOrmFilters(resourceScope: ResourceScope): TypeOrmFilters {
    try {
      const filters: TypeOrmFilters = {};

      switch (resourceScope.type) {
        case RoleScopeType.GLOBAL:
          this.logger.debug('Global scope: no filters applied');
          break;
          
        case RoleScopeType.ORGANIZATION:
          if (resourceScope.organizations?.length) {
            filters.organizations = resourceScope.organizations;
            this.logger.debug(`Organization filter applied with ${filters.organizations.length} organizations`);
          } else {
            this.logger.warn('Organization scope set but no organization IDs available');
          }
          break;
          
        case RoleScopeType.BRANCH:
          if (resourceScope.branches?.length) {
            filters.branches = resourceScope.branches;
            this.logger.debug(`Branch filter applied with ${filters.branches.length} branches`);
          } else {
            this.logger.warn('Branch scope set but no branch IDs available');
          }
          break;
          
        case RoleScopeType.DEPARTMENT:
          if (resourceScope.departments?.length) {
            filters.departments = resourceScope.departments;
            this.logger.debug(`Department filter applied with ${filters.departments.length} departments`);
          } else {
            this.logger.warn('Department scope set but no department IDs available');
          }
          break;
          
        case RoleScopeType.OWNED:
          filters.userId = resourceScope.userId;
          this.logger.debug(`User-owned filter applied for user ID: ${filters.userId}`);
          break;
          
        default:
          this.logger.warn(`Unknown scope type: ${resourceScope.type}`);
      }
      
      return filters;
    } catch (error: any) {
      this.logger.error(`Error creating TypeORM filters: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create data filters');
    }
  }

  private filterDataByScope(data: any[], resourceScope: ResourceScope): any[] {
    try {
      if (!data.length) {
        return data;
      }
      
      switch (resourceScope.type) {
        case RoleScopeType.GLOBAL:
          this.logger.debug('Global scope: returning all data');
          return data;
          
        case RoleScopeType.ORGANIZATION:
          if (!resourceScope.organizations?.length) {
            this.logger.warn('No organizations to filter by, returning empty set');
            return [];
          }
          return data.filter(item => {
            const result = resourceScope.organizations?.includes(item.organizationId);
            if (!result) {
              this.logger.debug(`Filtered out item with organizationId: ${item.organizationId}`);
            }
            return result;
          });
          
        case RoleScopeType.BRANCH:
          if (!resourceScope.branches?.length) {
            this.logger.warn('No branches to filter by, returning empty set');
            return [];
          }
          return data.filter(item => {
            const result = resourceScope.branches?.includes(item.branchId);
            if (!result) {
              this.logger.debug(`Filtered out item with branchId: ${item.branchId}`);
            }
            return result;
          });
          
        case RoleScopeType.DEPARTMENT:
          if (!resourceScope.departments?.length) {
            this.logger.warn('No departments to filter by, returning empty set');
            return [];
          }
          return data.filter(item => {
            const result = resourceScope.departments?.includes(item.departmentId);
            if (!result) {
              this.logger.debug(`Filtered out item with departmentId: ${item.departmentId}`);
            }
            return result;
          });
          
        case RoleScopeType.OWNED:
          return data.filter(item => {
            const result = item.userId === resourceScope.userId;
            if (!result) {
              this.logger.debug(`Filtered out item not owned by user: ${resourceScope.userId}`);
            }
            return result;
          });
          
        default:
          this.logger.warn(`Unknown scope type for filtering: ${resourceScope.type}, returning all data`);
          return data;
      }
    } catch (error: any) {
      this.logger.error(`Error filtering data by scope: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to filter response data');
    }
  }

  private determineEffectiveScope(roles: Partial<IRole>[]): { scopeType: RoleScopeType; scopeConfig?: any } {
    try {
      if (!roles.length) {
        this.logger.debug('No roles provided, using OWNED scope by default');
        return { scopeType: RoleScopeType.OWNED };
      }

      let effectiveScopeType = RoleScopeType.OWNED;
      
      for (const role of roles) {
        const roleScope = role.scope || RoleScopeType.OWNED;
        
        if (roleScope === RoleScopeType.GLOBAL) {
          this.logger.debug('Found GLOBAL role - assigning highest scope privilege');
          return { scopeType: RoleScopeType.GLOBAL };
        }
        
        if (this.isBroaderScope(roleScope, effectiveScopeType)) {
          this.logger.debug(`Upgrading scope from ${effectiveScopeType} to broader scope ${roleScope}`);
          effectiveScopeType = roleScope;
        }
      }
      
      this.logger.debug(`Final determined scope: ${effectiveScopeType}`);
      return { scopeType: effectiveScopeType };
    } catch (error: any) {
      this.logger.error(`Error determining effective scope: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to determine user access scope');
    }
  }
  
  private isBroaderScope(scopeA: RoleScopeType, scopeB: RoleScopeType): boolean {
    try {
      const scopePriority = {
        [RoleScopeType.GLOBAL]: 4,
        [RoleScopeType.ORGANIZATION]: 3,
        [RoleScopeType.BRANCH]: 2,
        [RoleScopeType.DEPARTMENT]: 1,
        [RoleScopeType.OWNED]: 0
      };
      
      return scopePriority[scopeA] > scopePriority[scopeB];
    } catch (error: any) {
      this.logger.error(`Error comparing scopes: ${error.message}`, error.stack);
      return false;
    }
  }
}