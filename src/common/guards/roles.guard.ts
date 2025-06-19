
import { UsersService } from "@/modules/account-management/users/users.service";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ALLOW_EMPLOYEE_KEY, ONLY_ALLOW_ROLES_KEY, ROLES_KEY } from "../decorators/roles.decorator";
import { Role } from "../enums/role.enum";
import { IJwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      const onlyAllowRoles = this.reflector.getAllAndOverride<boolean>(
        ONLY_ALLOW_ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      const allowEmployee = this.reflector.getAllAndOverride<boolean>(
        ALLOW_EMPLOYEE_KEY,
        [context.getHandler(), context.getClass()],
      );

      // Get the user payload from the request
      const request = context.switchToHttp().getRequest();
      const userClaims = request.user as IJwtPayload;

      var user = await this.usersService.findOneByOrFail({ id: userClaims.sub }, { relations: { employee: { roles: true } } });

      // Do not allow access to users with no role
      if ((!user.employee?.roles || user.employee.roles.length === 0) && onlyAllowRoles) {
        this.logger.warn(`${userClaims.email} tried to access a resource that requires at least a role`);
        throw new ForbiddenException('You do not have a role to access this resource');
      }

      // If allowEmployee is true, check if the user has only the employee role
      if (allowEmployee && user.employee?.roles?.length === 1 && user.employee.roles[0].name === Role.EMPLOYEE) {
        this.logger.warn(`${userClaims.email} tried to access a resource that regular employees are not allowed to access`);
        throw new ForbiddenException('Regular employees are not allowed to access this resource');
      }

      // If user has the super admin role, allow access
      const hasSuperAdminRole = user.employee?.roles?.some(role => role.name === Role.SUPERADMIN);
      if (hasSuperAdminRole) {
        return true;
      }

      // If no roles are required, allow access
      if ((!requiredRoles || requiredRoles.length === 0)) {
        return true;
      }
      
      // Check if the user has the required roles
      const hasRequiredRoles = user?.employee?.roles?.some(role => requiredRoles.includes(role.name));

      if (!hasRequiredRoles) {
        // Log the roles the user has
        this.logger.warn(`User with ID ${userClaims.sub} does not have required roles: ${requiredRoles.join(', ')}`);
        throw new ForbiddenException('You are not authorized to access this resource.');
      }

      return hasRequiredRoles;
    } catch (error: unknown) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Unexpected error in Roles guard: ${errorMessage}`);
      throw new ForbiddenException('Role check failed');
    }
  }
}