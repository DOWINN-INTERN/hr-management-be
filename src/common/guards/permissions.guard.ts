import { Role } from "@/common/enums/role.enum";
import { UsersService } from "@/modules/account-management/users/users.service";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
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
      const requiredPermissions = this.reflector.getAllAndOverride<IPermission[]>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

      // If no permissions are required, allow access
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
      }

      // Get the user payload from the request
      const request = context.switchToHttp().getRequest();
      const userClaims = request.user as IJwtPayload;


      if (!userClaims || !userClaims.sub) {
        this.logger.warn('Missing user claims or sub in request');
        throw new ForbiddenException('Invalid authentication data');
      }

      // get user with their role and role permissions
      let user;
      try {
        user = await this.usersService.findOneByOrFail({ id: userClaims.sub }, { employee: { roles: true } });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Error fetching user permissions: ${errorMessage}`);
        throw new ForbiddenException('Error processing permissions');
      }
      
      if (!user) {
        this.logger.warn(`User with ID ${userClaims.sub} not found`);
        throw new ForbiddenException('User not found');
      }

      // Validate user has roles
      if (!user.employee?.roles || user.employee?.roles.length === 0) {
        return false;  // No need to throw, just deny access
      }

      // If user has the super admin role, allow access
      const hasSuperAdminRole = user.employee.roles.some(role => role.name === Role.SUPERADMIN);
      if (hasSuperAdminRole) {
        return true;
      }
      
      // Check if the user has the required permissions
      const hasRequiredPermissions = requiredPermissions.some(requiredPermission => {
        return user.employee?.roles?.some(role => {
          if (!role.permissions || !Array.isArray(role.permissions)) {
            return false;
          }
          
          return role.permissions.some(permission => 
            permission && 
            permission.action === requiredPermission.action && 
            permission.subject === requiredPermission.subject
          );
        });
      });

      return hasRequiredPermissions;
    } catch (error: unknown) {
      // Convert any unexpected errors to ForbiddenException instead of letting them become 500s
      if (error instanceof ForbiddenException) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Unexpected error in permissions guard: ${errorMessage}`);
      throw new ForbiddenException('Permission check failed');
    }
  }
}