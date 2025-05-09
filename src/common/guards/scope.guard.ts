import { IRole } from '@/modules/employee-management/roles/interface/role.interface';
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
        
              this.logger.log(`Processing ${method} request to ${path}`);
              request.resourceScope = {
                type: RoleScopeType.OWNED,
                userId: user?.sub  // This will be undefined if no user
              };

              this.logger.log(`Setting resource scope for user: ${user.sub}`);
              
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
                // log resource scope
                this.logger.log(`Resource scope set: ${JSON.stringify(resourceScope)}`);
                
                this.logger.debug(`Applied filters for scope type: ${resourceScope.type}`);
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
      this.logger.debug(`Access attempt: ${method} ${path}`);

      // Check if role is super admin
      // const hasSuperAdminRole = user.roles?.some(role => role.name === Role.SUPERADMIN);
      // if (hasSuperAdminRole) {
      //   return true;
      // }
      // Check if resourceScope exists
      const resourceScope = request.resourceScope as ResourceScope;
      if (!resourceScope) {
        this.logger.warn(`Missing resourceScope in request`);
        // For GET requests, allow access without resourceScope
        // This fixes the issue with listing endpoints
        if (method === 'GET') {
          this.logger.debug(`Allowing GET request without resourceScope: ${path}`);
          return true;
        }
        throw new InternalServerErrorException('Resource scope not defined');
      }

      // Check if the method is POST (creation) or PUT (update)
      if (method !== 'POST' && method !== 'PUT') {
        this.logger.debug(`Method ${method} allowed without scope check`);
        return true; // Allow other methods
      }
          
      const body = request.body;
      
      // Log the attempt with scope information
      this.logger.debug(`Checking permissions for ${method} with scope type: ${resourceScope.type}`);
      
      // Check creation permissions based on scope
      if (!this.canDoInScope(body, resourceScope)) {
        const errorMessage = this.generateErrorMessage(resourceScope.type, body);
        this.logger.warn(`Permission denied: ${errorMessage} with your scope ${resourceScope.type}`);
        throw new ForbiddenException(errorMessage);
      }
      
      this.logger.debug('Permission check passed');
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
  
  private canDoInScope(data: any, resourceScope: ResourceScope): boolean {
    try {
      switch (resourceScope.type) {
        case RoleScopeType.GLOBAL:
          // Global scope can create anywhere
          return true;
          
        case RoleScopeType.ORGANIZATION:
          // Can only create within their organizations
          if (data.organizationId) {
            const hasAccess = resourceScope.organizations?.includes(data.organizationId) ?? false;
            if (!hasAccess) {
              this.logger.debug(`Organization access denied: user tried to access org ${data.organizationId}`);
            }
            return hasAccess;
          }
          return true;
          
        case RoleScopeType.BRANCH:
          // Can only create within their branches
          if (data.branchId) {
            const hasAccess = resourceScope.branches?.includes(data.branchId) ?? false;
            if (!hasAccess) {
              this.logger.debug(`Branch access denied: user tried to access branch ${data.branchId}`);
            }
            return hasAccess;
          }
          return true;
          
        case RoleScopeType.DEPARTMENT:
          // Can only create within their departments
          if (data.departmentId) {
            const hasAccess = resourceScope.departments?.includes(data.departmentId) ?? false;
            if (!hasAccess) {
              this.logger.debug(`Department access denied: user tried to access dept ${data.departmentId}`);
            }
            return hasAccess;
          }
          return true;
          
        case RoleScopeType.OWNED:
          // Usually can't create resources for others
          if (data.userId) {
            const hasAccess = resourceScope.userId === data.userId;
            if (!hasAccess) {
              this.logger.debug(`User resource access denied: user tried to access another user's resource`);
            }
            return hasAccess;
          }
          // If no userId is provided, allow creation
          return true;

        default:
          this.logger.warn(`Unknown scope type encountered: ${resourceScope.type}`);
          return false;
      }
    } catch (error: any) {
      this.logger.error(`Error in canDoInScope: ${error.message}`, error.stack);
      return false;
    }
  }

  private generateErrorMessage(scopeType: RoleScopeType, data: any): string {
    switch (scopeType) {
      case RoleScopeType.ORGANIZATION:
        return data.organizationId 
          ? `You don't have permission to manage resources in organization ${data.organizationId}` 
          : `You don't have permission to manage organization resources`;
          
      case RoleScopeType.BRANCH:
        return data.branchId 
          ? `You don't have permission to manage resources in branch ${data.branchId}` 
          : `You don't have permission to manage branch resources`;
          
      case RoleScopeType.DEPARTMENT:
        return data.departmentId 
          ? `You don't have permission to manage resources in department ${data.departmentId}` 
          : `You don't have permission to manage department resources`;
          
      case RoleScopeType.OWNED:
        return data.userId 
          ? `You don't have permission to manage resources for user ${data.userId}` 
          : `You don't have permission to manage user resources`;
          
      default:
        return `You don't have permission to manage this resource`;
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