import { IRole } from '@/modules/employee-management/roles/interface/role.interface';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RoleScopeType } from '../enums/role-scope-type.enum';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class ScopeInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user: IJwtPayload = request.user;

    if (user) {
      // Determine effective scopes for different entity types
      const roleScope = this.determineEffectiveScope(user.roles || []);
      
      // Store comprehensive scope information in the request
      request.resourceScope = {
        type: roleScope.scopeType,
        userId: user.sub,
        departments: user.departments || [],
        branches: user.branches || [],
        organizations: user.organizations || [],
    };
    }

    // Continue with the request handling
    return next.handle();
  }

  private determineEffectiveScope(roles: IRole[]): { scopeType: RoleScopeType; scopeConfig?: any } {
    // Default to most restrictive
    let effectiveScopeType = RoleScopeType.OWNED;
    
    // Find the role with the broadest access scope
    for (const role of roles) {
      const roleScope = role.scope || RoleScopeType.OWNED;
      
      if (roleScope === RoleScopeType.GLOBAL) {
        return { 
          scopeType: RoleScopeType.GLOBAL, 
        };
      }
      
      if (this.isBroaderScope(roleScope, effectiveScopeType)) {
        effectiveScopeType = roleScope;
      }
    }
    
    return { 
      scopeType: effectiveScopeType,
    };
  }
  
  // You could add similar methods for other entity types:
  // private determineDepartmentScope(departments: string[]): {...}
  // private determineOrganizationScope(organizations: string[]): {...}
  // private determineBranchScope(branches: string[]): {...}
  
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