
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

      // If the only role require is super admin role, allow access
      if (requiredRoles.length === 1 && requiredRoles[0] === Role.SUPERADMIN) {
        return true
      }

      // Get the user payload from the request
      const request = context.switchToHttp().getRequest();
      const userClaims = request.user as IJwtPayload;

      if (!userClaims || !userClaims.sub) {
        this.logger.warn('Missing user claims or sub in request');
        throw new ForbiddenException('Invalid authentication data');
      }

      var user = await this.usersService.findOneBy({ id: userClaims.sub });

      if (!user) {
        this.logger.warn(`User with ID ${userClaims.sub} not found`);
        throw new ForbiddenException('User not found');
      }
      
      // Check if the user has the required roles
      const hasRequiredRoles = user?.employee?.roles?.some(role => requiredRoles.includes(role.name)) ?? false;

      return hasRequiredRoles;
    } catch (error: unknown) {
      // Convert any unexpected errors to ForbiddenException instead of letting them become 500s
      if (error instanceof ForbiddenException) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Unexpected error in Roles guard: ${errorMessage}`);
      throw new ForbiddenException('Permission check failed');
    }
  }
}