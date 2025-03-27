// src/common/interceptors/scope-query-filter.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RoleScopeType } from '../enums/role-scope-type.enum';

@Injectable()
export class ScopeQueryFilterInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { resourceScope } = request;
    const method = request.method;
    
    // Only apply filtering to GET requests
    if (method !== 'GET' || !resourceScope) {
      return next.handle();
    }

    // Get the entity type from the route (you can also pass this as metadata)
    const entityType = this.getEntityTypeFromRoute(request.route.path);
    
    // Apply scope filters to query params
    request.query = this.applyScopeFilters(request.query, resourceScope, entityType);
    
    return next.handle();
  }

  private applyScopeFilters(query: any, resourceScope: any, entityType: string): any {
    const newQuery = { ...query };

    switch (resourceScope.type) {
      case RoleScopeType.GLOBAL:
        // No filtering for global scope
        return newQuery;
        
      case RoleScopeType.ORGANIZATION:
        // Filter by organization
        if (resourceScope.organizations && resourceScope.organizations.length) {
          newQuery.organizationId = { $in: resourceScope.organizations };
        }
        return newQuery;
        
      case RoleScopeType.BRANCH:
        // Filter by branch
        if (resourceScope.branches && resourceScope.branches.length) {
          newQuery.branchId = { $in: resourceScope.branches };
        }
        return newQuery;
        
      case RoleScopeType.DEPARTMENT:
        // Filter by department
        if (resourceScope.departments && resourceScope.departments.length) {
          newQuery.departmentId = { $in: resourceScope.departments };
        }
        return newQuery;
        
      case RoleScopeType.OWNED:
        // Filter by user's own data
        newQuery.userId = resourceScope.userId;
        return newQuery;
        
      default:
        return newQuery;
    }
  }
  
  private getEntityTypeFromRoute(path: string): string {
    // Extract entity type from route path, e.g., '/api/employees' -> 'employees'
    const parts = path.split('/').filter(Boolean);
    return parts[parts.length - 1];
  }
}