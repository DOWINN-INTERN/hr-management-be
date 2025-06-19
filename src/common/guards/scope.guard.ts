import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleScopeType } from '../enums/role-scope-type.enum';
import { UtilityHelper } from '../helpers/utility.helper';
import { ResourceScope } from '../interceptors/scope.interceptor';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class ScopeGuard implements CanActivate {
  private readonly logger = new Logger(ScopeGuard.name);
  
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const user = request.user as IJwtPayload;
      const method = request.method;
      const path = request.path;

      if (user)
      {
        try {
        
              // this.logger.log(`Processing ${method} request to ${path}`);
              request.resourceScope = {
                type: RoleScopeType.OWNED,
                userId: user?.sub  // This will be undefined if no user
              };

              // this.logger.log(`Setting resource scope for user: ${user.sub}`);
              
              try {
                // Determine effective scope
                const roleScope = UtilityHelper.determineEffectiveScope(user.roles || []);
                
                // Store scope information with correct property names
                const resourceScope: ResourceScope = {
                  roleName: roleScope.name,
                  type: roleScope?.scope || RoleScopeType.OWNED,
                  userId: user.sub,
                  departments: user.roles?.flatMap(role => role.departmentId).filter((id): id is string => id !== undefined && id !== null) || [],
                  branches: user.roles?.flatMap(role => role.branchId).filter((id): id is string => id !== undefined && id !== null) || [],
                  organizations: user.roles?.flatMap(role => role.organizationId).filter((id): id is string => id !== undefined && id !== null) || [],
                };
                
                request.resourceScope = resourceScope;
                // log resource scope
              } catch (error: any) {
                this.logger.error(`Error setting up resource scope: ${error.message}`, error.stack);
                throw new InternalServerErrorException('Failed to process authorization scope');
              }
            } catch (error: any) {
              this.logger.error(`ScopeInterceptor error: ${error.message}`, error.stack);
              throw error;
            }
      }

      // Log access attempt
      this.logger.log(`Access attempt: ${method} ${path}`);

      // Check if role is super admin
      // const hasSuperAdminRole = user.roles?.some(role => role.name === Role.SUPERADMIN);
      // if (hasSuperAdminRole) {
      //   return true;
      // }
      // Check if resourceScope exists
      const resourceScope = request.resourceScope as ResourceScope;
      if (!resourceScope) {
        this.logger.warn(`Missing resourceScope in request`);
        throw new InternalServerErrorException('Resource scope not defined');
      }
          
      const body = (() => {
        // Check if request.body exists and is not empty
        if (request.body && Object.keys(request.body).length > 0) {
          return request.body;
        }
        // Check if request.query exists and is not empty
        if (request.query && Object.keys(request.query).length > 0) {
          return request.query;
        }
        // Fallback to request.params (even if empty)
        return request.params || {};
      })();
      
      // Log the attempt with scope information
      this.logger.log(`Checking scope for ${method} with scope type: ${resourceScope.type}`);
      
      // Check creation permissions based on scope
      if (!this.canDoInScope(body, resourceScope, method)) {
        const errorMessage = this.generateErrorMessage(resourceScope.type, body);
        this.logger.warn(`Scope denied: ${errorMessage} with your scope ${resourceScope.type}`);
        throw new ForbiddenException(errorMessage);
      }
      
      return true;
    } catch (error: any) {
      // Handle and log any unexpected errors
      if (!(error instanceof ForbiddenException) && !(error instanceof InternalServerErrorException)) {
        this.logger.error(`Unexpected error in scope guard: ${error.message}`, error.stack);
        throw new InternalServerErrorException('An error occurred while checking permissions');
      }
      throw error;
    }
  }
  
  private canDoInScope(data: any, resourceScope: ResourceScope, method: string): boolean {
  // Common validation for all methods
  const validateScope = (id: string | undefined, scopeIds: string[] | undefined, resourceType: string): boolean => {
    // Log the validation attempt
    this.logger.log(`Validating ${resourceType} access for ID: ${id} with scope IDs: ${scopeIds}`);
    
    if (!id) {
      throw new ForbiddenException(`You must provide a ${resourceType}Id to access this resource`);
    }
    
    const hasAccess = scopeIds?.includes(id) ?? false;
    if (!hasAccess) {
      this.logger.log(`${resourceType} access denied: user tried to access ${resourceType.toLowerCase()} ${id}`);
    }
    return hasAccess;
  };

  switch (resourceScope.type) {
    case RoleScopeType.GLOBAL:
      return true;
      
    case RoleScopeType.ORGANIZATION:
      // Specific logic for different methods
      if (method === 'GET' || method === 'DELETE') {
        return validateScope(data.organizationId, resourceScope.organizations, 'organization');
      } else if (method === 'POST') {
        // For creation, ensure all resource data is provided
        if (!data.organizationId || !data.branchId || !data.departmentId)
        {
          throw new ForbiddenException(`You must provide organizationId, branchId, and departmentId to create this resource`);
        }
      }
      else if (['PUT', 'PATCH'].includes(method)) {
        // For creation/update, ensure the organization exists and user has access to it
        return validateScope(data.organizationId, resourceScope.organizations, 'organization');
      }
      return validateScope(data.organizationId, resourceScope.organizations, 'organization');
      
    case RoleScopeType.BRANCH:
      if (method === 'GET' || method === 'DELETE') {
        return validateScope(data.branchId, resourceScope.branches, 'branch');
      }
      else if (method === 'POST') {
        // For creation, ensure all resource data is provided
        if (!data.branchId || !data.departmentId) {
          throw new ForbiddenException(`You must provide branchId, and departmentId to create this resource`);
        }
        
      } else if (['PUT', 'PATCH'].includes(method)) {
        return validateScope(data.branchId, resourceScope.branches, 'branch');
      }
      return validateScope(data.branchId, resourceScope.branches, 'branch');
      
    case RoleScopeType.DEPARTMENT:
      if (method === 'GET' || method === 'DELETE') {
        return validateScope(data.departmentId, resourceScope.departments, 'department');
      } else if (['POST', 'PUT', 'PATCH'].includes(method)) {
        return validateScope(data.departmentId, resourceScope.departments, 'department');
      }
      return validateScope(data.departmentId, resourceScope.departments, 'department');
      
    case RoleScopeType.OWNED:
      if (method === 'GET' || method === 'DELETE') {
        return validateScope(data.userId, [resourceScope.userId || ""], 'user');
      } else if (['POST', 'PUT', 'PATCH'].includes(method)) {
        // For user resources, they can only create/modify their own resources
        if (data.userId && data.userId !== resourceScope.userId) {
          this.logger.log(`User cannot create/modify resources for other users`);
          return false;
        }
        return true;
      }
      return validateScope(data.userId, [resourceScope.userId || ""], 'user');

    default:
      this.logger.warn(`Unknown scope type encountered: ${resourceScope.type}`);
      return false;
  }
}

  private generateErrorMessage(scopeType: RoleScopeType, data: any): string {
    switch (scopeType) {
      case RoleScopeType.ORGANIZATION:
        return data.organizationId 
          ? `You don't have access to manage resources in organization ${data.organizationId}` 
          : `You don't have permission to access or manage organization resources`;
          
      case RoleScopeType.BRANCH:
        return data.branchId 
          ? `You don't have access to manage resources in branch ${data.branchId}` 
          : `You don't have permission to access or manage branch resources`;
          
      case RoleScopeType.DEPARTMENT:
        return data.departmentId 
          ? `You don't have access to manage resources in department ${data.departmentId}` 
          : `You don't have access to manage department resources`;
          
      case RoleScopeType.OWNED:
        return data.userId 
          ? `You don't have access to manage resources for user ${data.userId}` 
          : `You don't have access to manage user resources`;
          
      default:
        return `You don't have access to manage this resource`;
    }
  }
}