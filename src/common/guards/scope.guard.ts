// src/common/guards/scope-creation.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleScopeType } from '../enums/role-scope-type.enum';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { resourceScope } = request;
    const method = request.method;

    // Check if the method is POST (creation) or PUT (update)
    if (method !== 'POST' && method !== 'PUT') {
      return true; // Allow other methods
    }
        
    const body = request.body;
    
    // Check creation permissions based on scope
    if (!this.canDoInScope(body, resourceScope)) {
      throw new ForbiddenException(
        `You don't have permission to access this resource.`
      );
    }
    
    return true;
  }
  
  private canDoInScope(data: any, resourceScope: any): boolean {
    switch (resourceScope.type) {
      case RoleScopeType.GLOBAL:
        // Global scope can create anywhere
        return true;
        
      case RoleScopeType.ORGANIZATION:
        // Can only create within their organizations
        if (data.organizationId) {
          return resourceScope.organizations.includes(data.organizationId);
        }
        return true;
        
      case RoleScopeType.BRANCH:
        // Can only create within their branches
        if (data.branchId) {
          return resourceScope.branches.includes(data.branchId);
        }
        return true;
        
      case RoleScopeType.DEPARTMENT:
        // Can only create within their departments
        if (data.departmentId) {
          return resourceScope.departments.includes(data.departmentId);
        }
        return true;
        
      case RoleScopeType.OWNED:
        // Usually can't create resources for others
        if (data.userId) {
          return resourceScope.userId === data.userId;
        }
        // If no userId is provided, allow creation
        return true;

      default:
        return false;
    }
  }
}