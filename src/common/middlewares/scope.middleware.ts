import { IRole } from '@/modules/employee-management/roles/interface/role.interface';
import { Injectable, InternalServerErrorException, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { RoleScopeType } from '../enums/role-scope-type.enum';
import { ResourceScope } from '../interceptors/scope.interceptor';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class ScopeMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ScopeMiddleware.name);

  use(request: any, res: Response, next: NextFunction) {
    try {
      const user = request.user as IJwtPayload | undefined;
          const method = request.method;
          const path = request.path;
    
          this.logger.log(`Processing ${method} request to ${path}`);
          request.resourceScope = {
            type: RoleScopeType.OWNED,
            userId: user?.sub  // This will be undefined if no user
          };
          
          if (!user) {
            this.logger.log('No authenticated user found in request');
            return next();
          }
    
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
            
          } catch (error: any) {
            this.logger.error(`Error setting up resource scope: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to process authorization scope');
          }
    
          // Process the response to filter data
          return next();
        } catch (error: any) {
          this.logger.error(`ScopeInterceptor error: ${error.message}`, error.stack);
          throw error;
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