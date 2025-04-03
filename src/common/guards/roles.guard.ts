
import { UsersService } from "@/modules/account-management/users/users.service";
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
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
      
      // If no roles are required, allow access
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      // Get the user payload from the request
      const request = context.switchToHttp().getRequest();
      const userClaims = request.user as IJwtPayload;

      var user = await this.usersService.findOneBy({ id: userClaims.sub }, { relations: { employee: { roles: true } } });

      if (!user) {
        this.logger.warn(`User with ID ${userClaims.sub} not found`);
        throw new ForbiddenException('User not found');
      }

      // If user has the super admin role, allow access
      const hasSuperAdminRole = user.employee?.roles?.some(role => role.name === Role.SUPERADMIN);
      if (hasSuperAdminRole) {
        return true;
      }
      
      // Check if the user has the required roles
      const hasRequiredRoles = user?.employee?.roles?.some(role => requiredRoles.includes(role.name));

      if (!hasRequiredRoles) {
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