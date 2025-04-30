import { UsersService } from "@/modules/account-management/users/users.service";
import { PermissionsService } from "@/modules/employee-management/roles/permissions/permissions.service";
import { ActivityLogsService } from "@/modules/logs/activity-logs/activity-logs.service";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { singular } from "pluralize";
import { PERMISSION_ENDPOINT_TYPE } from "../decorators/authorize.decorator";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { Action } from "../enums/action.enum";
import { Role } from "../enums/role.enum";
import { IJwtPayload } from "../interfaces/jwt-payload.interface";
import { IPermission } from "../interfaces/permission.interface";

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
    private permissionsService: PermissionsService,
    private activityLogsService: ActivityLogsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // First check for endpoint type
      const endpointType = this.reflector.getAllAndOverride<Action>(
        PERMISSION_ENDPOINT_TYPE,
        [context.getHandler(), context.getClass()],
      );

      let requiredPermissions: IPermission[] = [];
      const controllerClass = context.getClass();
      const controllerName = controllerClass.name;
      const baseName = singular(controllerName.replace(/controller$/i, ''));

      if (endpointType) {
        // get the permissions for the controller in the database
        const permissions = await this.permissionsService.getPermissionsByControllerName(baseName);

        // Filter permissions based on the endpoint type action
        if (permissions && permissions.length > 0) {
          // Filter permissions that match the endpoint type action
          requiredPermissions = permissions.filter(permission => {
            // For CREATE endpoints, match against CREATE or MANAGE actions
            if (endpointType === Action.CREATE) {
              return permission.action === Action.CREATE || permission.action === Action.MANAGE;
            }
            // For READ endpoints, match against READ or MANAGE actions
            else if (endpointType === Action.READ) {
              return permission.action === Action.READ || permission.action === Action.MANAGE;
            }
            // For UPDATE endpoints, match against UPDATE or MANAGE actions
            else if (endpointType === Action.UPDATE) {
              return permission.action === Action.UPDATE || permission.action === Action.MANAGE;
            }
            // For DELETE endpoints, match against DELETE or MANAGE actions
            else if (endpointType === Action.DELETE) {
              return permission.action === Action.DELETE || permission.action === Action.MANAGE;
            }
            return false;
          });
        }
      } else {
        // Fall back to standard permissions check
        requiredPermissions = this.reflector.getAllAndOverride<IPermission[]>(
          PERMISSIONS_KEY,
          [context.getHandler(), context.getClass()],
        ) || [];
      }

      // If no permissions are required, allow access
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
      }
      
      // Get the user payload from the request
      const request = context.switchToHttp().getRequest();
      const userClaims = request.user as IJwtPayload;
      const resourceId = this.getResourceInfo(request);
      
      // get user with their role and role permissions
      let user;
      try {
        user = await this.usersService.findOneByOrFail({ id: userClaims.sub }, { relations: { employee: { roles: { permissions: true} } }} );
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Error fetching user permissions: ${errorMessage}`);

        // Log failed permission check due to user lookup error
        await this.logUserActivity(userClaims, endpointType, baseName, false, 
          'Permission check failed - User not found', resourceId);
          
        throw new ForbiddenException('Error processing permissions');
      }

      // check if user is an employee if user is not an employee only allow access to their own resource
      if (!user.employee) {
        this.logger.warn(`User is not an employee: ${JSON.stringify(user)}`);
        // Check if the user is trying to access their own resource
        const userId = request.params.userId || request.query.userId || request.body.userId;
        if (userId && userId !== userClaims.sub) {
          this.logger.warn(`User is trying to access another user's resource: ${userId}`);
          
          // Log unauthorized access attempt
          await this.logUserActivity(
            userClaims, endpointType, baseName, false,
            `Attempted to access another user's resource: ${userId}`,
            resourceId, userClaims.sub
          );
          
          throw new ForbiddenException('You do not have the permissions to manage this resource.');
        }
        
        // Log successful access to own resource
        await this.logUserActivity(
          userClaims, endpointType, baseName, true,
          `Accessed own resource`,
          resourceId, userClaims.sub
        );
        
        return true;
      }

      // If user has the super admin role, allow access
      const hasSuperAdminRole = user.employee?.roles?.some(role => role.name === Role.SUPERADMIN);
      if (hasSuperAdminRole) {
        // Log successful access with super admin privileges
        await this.logUserActivity(
          userClaims, endpointType, baseName, true,
          `Access granted with SUPERADMIN role`,
          resourceId, userClaims.sub
        );
        
        return true;
      }
        
      // Check if the user has every required permissions for some role
      const userPermissions = [
        ...new Set(
          user.employee?.roles?.flatMap(role => role.permissions).filter(Boolean) || []
        )
      ];
      
      this.logger.debug(`Required permissions: ${JSON.stringify(requiredPermissions)}`);
      const hasRequiredPermissions = requiredPermissions.every(requiredPermission => {
        return userPermissions?.some(userPermission => {
          // Direct permission match
          const exactMatch = 
            userPermission && 
            userPermission.action === requiredPermission.action &&
            userPermission.subject === requiredPermission.subject;
          
          // Check if user has MANAGE permission for the same subject
          // MANAGE is equivalent to having all other permissions
          const hasManagePermission = 
            userPermission && 
            userPermission.action === Action.MANAGE &&
            userPermission.subject === requiredPermission.subject;
          
          return exactMatch || hasManagePermission;
        });
      });

      if (!hasRequiredPermissions) {
        this.logger.warn(`User does not have required permissions: ${JSON.stringify(requiredPermissions)}`);
        
        // Log failed permission check
        await this.logUserActivity(
          userClaims, endpointType, baseName, false,
          `Missing required permissions: ${JSON.stringify(requiredPermissions.map(p => `${p.action} ${p.subject}`))}`,
          resourceId, userClaims.sub
        );
        
        throw new ForbiddenException('You do not have the permissions to manage this resource.');
      }

      // Log successful permission check
      await this.logUserActivity(
        userClaims, endpointType, baseName, true,
        `Successfully performed action`,
        resourceId, userClaims.sub
      );
      
      return hasRequiredPermissions;
    } catch (error: unknown) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Unexpected error in permissions guard: ${errorMessage}`);
      throw new ForbiddenException('Permission check failed');
    }
  }
  
  /**
   * Extract resource information from the request
   */
  private getResourceInfo(request: any) {
    return request.params?.id || request.body?.id
  }
  
  /**
   * Log user activity with detailed information
   */
  private async logUserActivity(
    userClaims: IJwtPayload,
    endpointType: Action,
    subject: string,
    successful: boolean,
    message: string,
    resourceId?: string | null,
    userId?: string,
  ): Promise<void> {
    try {
      const userEmail = userClaims.email || 'Unknown User';
      const action = endpointType || Action.READ;
      const logMessage = successful
        ? `${userEmail} ${action} ${subject}${resourceId ? ` (ID: ${resourceId})` : ''}. ${message}`
        : `${userEmail} tried to ${action} ${subject}${resourceId ? ` (ID: ${resourceId})` : ''} but was denied. ${message}`;

      await this.activityLogsService.create({
        action,
        subject,
        user: { id: userId },
        message: logMessage
      });
    } catch (error) {
      // Don't let logging errors affect the app's operation
      this.logger.error(`Failed to log user activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}