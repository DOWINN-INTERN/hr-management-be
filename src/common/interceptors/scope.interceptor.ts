import { IRole } from '@/modules/employee-management/roles/interface/role.interface';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoleScopeType } from '../enums/role-scope-type.enum';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class ScopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user: IJwtPayload = request.user;
    
    if (user) {
      // Determine effective scope
      const roleScope = this.determineEffectiveScope(user.roles || []);
      
      // Store scope information with correct property names
      request.resourceScope = {
        type: roleScope.scopeType,
        userId: user.sub,
        departments: user.departments || [],
        branches: user.branches || [],
        organizations: user.organizations || [],
      };
      
      // Apply TypeORM-compatible filters based on scope
      request.filters = this.createTypeOrmFilters(request.resourceScope);
    }

    // Process the response to filter data
    return next.handle().pipe(
      map(data => {
        // Skip non-GET requests or if no scope defined
        if (request.method !== 'GET' || !request.resourceScope) {
          return data;
        }
        
        // If data is an array, filter it based on scope
        if (Array.isArray(data)) {
          return this.filterDataByScope(data, request.resourceScope);
        }
        
        return data;
      })
    );
  }

  private createTypeOrmFilters(resourceScope: any): any {
    const filters: any = {};

    switch (resourceScope.type) {
      case RoleScopeType.GLOBAL:
        // No filtering for global scope
        break;
        
      case RoleScopeType.ORGANIZATION:
        if (resourceScope.organizations?.length) {
          filters.organizationId = resourceScope.organizations;
        }
        break;
        
      case RoleScopeType.BRANCH:
        if (resourceScope.branches?.length) {
          filters.branchId = resourceScope.branches;
        }
        break;
        
      case RoleScopeType.DEPARTMENT:
        if (resourceScope.departments?.length) {
          filters.departmentId = resourceScope.departments;
        }
        break;
        
      case RoleScopeType.OWNED:
        filters.userId = resourceScope.userId;
        break;
    }
    
    return filters;
  }

  private filterDataByScope(data: any[], resourceScope: any): any[] {
    switch (resourceScope.type) {
      case RoleScopeType.GLOBAL:
        return data;
        
      case RoleScopeType.ORGANIZATION:
        return data.filter(item => 
          resourceScope.organizations.includes(item.organizationId)
        );
        
      case RoleScopeType.BRANCH:
        return data.filter(item => 
          resourceScope.branches.includes(item.branchId)
        );
        
      case RoleScopeType.DEPARTMENT:
        return data.filter(item => 
          resourceScope.departments.includes(item.departmentId)
        );
        
      case RoleScopeType.OWNED:
        return data.filter(item => 
          item.userId === resourceScope.userId
        );
        
      default:
        return data;
    }
  }

  // Your existing methods for determining scope...
  private determineEffectiveScope(roles: IRole[]): { scopeType: RoleScopeType; scopeConfig?: any } {
    // Existing implementation...
    let effectiveScopeType = RoleScopeType.OWNED;
    
    for (const role of roles) {
      const roleScope = role.scope || RoleScopeType.OWNED;
      
      if (roleScope === RoleScopeType.GLOBAL) {
        return { scopeType: RoleScopeType.GLOBAL };
      }
      
      if (this.isBroaderScope(roleScope, effectiveScopeType)) {
        effectiveScopeType = roleScope;
      }
    }
    
    return { scopeType: effectiveScopeType };
  }
  
  private isBroaderScope(scopeA: RoleScopeType, scopeB: RoleScopeType): boolean {
    const scopePriority = {
      [RoleScopeType.GLOBAL]: 4,
      [RoleScopeType.ORGANIZATION]: 3,
      [RoleScopeType.BRANCH]: 2,
      [RoleScopeType.DEPARTMENT]: 1,
      [RoleScopeType.OWNED]: 0
    };
    
    return scopePriority[scopeA] > scopePriority[scopeB];
  }
}