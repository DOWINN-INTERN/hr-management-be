import { UsersService } from "@/modules/account-management/users/users.service";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { BaseController } from "../controllers/base.controller";
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
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // First check for endpoint type
      const endpointType = this.reflector.getAllAndOverride<Action>(
        PERMISSION_ENDPOINT_TYPE,
        [context.getHandler(), context.getClass()],
      );

      let requiredPermissions: IPermission[] = [];

      if (endpointType) {
        const controllerClass = context.getClass();
        const controllerName = controllerClass.name;
        
        // Access the static permissions map
        if (BaseController.permissionsMap && BaseController.permissionsMap[controllerName]) {
          const permissions = BaseController.permissionsMap[controllerName];
          
          // Map endpoint type to permission type
          switch (endpointType) {
            case Action.CREATE:
              requiredPermissions = [
                ...(permissions.Create || [])
              ];
              break;
            case Action.READ:
              requiredPermissions = [...(permissions.Read || [])];
              break;
            case Action.UPDATE:
              requiredPermissions = [
                ...(permissions.Update || [])
              ];
              break;
            case Action.DELETE:
              requiredPermissions = [
                ...(permissions.Delete || [])
              ];
              break;
          }
        }
      } else {
        // Fall back to standard permissions check
        requiredPermissions = this.reflector.getAllAndOverride<IPermission[]>(
          PERMISSIONS_KEY,
          [context.getHandler(), context.getClass()],
        ) || [];
      }
      // log permissiosn object
      this.logger.debug(`Permissions object: ${JSON.stringify(BaseController.permissionsMap)}`);
      
      // If no permissions are required, allow access
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
      }
      
      // Get the user payload from the request
      const request = context.switchToHttp().getRequest();
      const userClaims = request.user as IJwtPayload;
      
      // get user with their role and role permissions
      let user;
      try {
        user = await this.usersService.findOneByOrFail({ id: userClaims.sub }, { relations: { employee: { roles: { permissions: true} } }} );
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Error fetching user permissions: ${errorMessage}`);
        throw new ForbiddenException('Error processing permissions');
      }

      // check if user is an employee if user is not an employee only allow access to their own resource
      if (!user.employee) {
        this.logger.warn(`User is not an employee: ${JSON.stringify(user)}`);
        // Check if the user is trying to access their own resource
        const userId = request.params.userId || request.query.userId || request.body.userId;
        if (userId && userId !== userClaims.sub) {
          this.logger.warn(`User is trying to access another user's resource: ${userId}`);
          throw new ForbiddenException('You do not have the permissions to manage this resource.');
        }
        return true;
      }

      // If user has the super admin role, allow access
      const hasSuperAdminRole = user.employee?.roles?.some(role => role.name === Role.SUPERADMIN);
      if (hasSuperAdminRole) {
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
        throw new ForbiddenException('You do not have the permissions to manage this resource.');
      }

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
}