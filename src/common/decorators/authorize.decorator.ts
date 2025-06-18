import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { applyDecorators, SetMetadata, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Action } from '../enums/action.enum';
import { ScopeGuard } from '../guards/scope.guard';
import { ResourceAccessInterceptor } from '../interceptors/resource-access.interceptor';
import { IPermission } from '../interfaces/permission.interface';
import { AccessOptions } from './departments.decorator';
import { Permissions } from './permissions.decorator';
import { AllowEmployee, OnlyAllowRoles, Roles } from './roles.decorator';

export const PERMISSIONS_FUNCTION_KEY = 'permissions_function';
export const PERMISSION_ENDPOINT_TYPE = 'permission_endpoint_type';

export interface AuthorizeOptions extends Omit<AccessOptions, 'permissions'> {
  permissions?: IPermission[];
  endpointType?: Action;
  allowRoles?: boolean; // only allow users with roles to access this endpoint
  allowEmployee?: boolean; // allow users with only employee role to access this endpoint
}

export function Authorize(options?: AuthorizeOptions): MethodDecorator {
  const decorators = [
    Roles(options?.roles),
    UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, ScopeGuard),
    UseInterceptors(ResourceAccessInterceptor),
    ApiBearerAuth('access-token'),
  ];

  // Only add ScopeGuard for endpoints that need scope checking
  if (options?.endpointType) {
    decorators.push(
      SetMetadata(PERMISSION_ENDPOINT_TYPE, options.endpointType),
    );
  } else {
    // For regular array-based permissions
    decorators.push(Permissions(options?.permissions));
  }

  if (options?.allowRoles) {
    decorators.push(OnlyAllowRoles(options.allowRoles));
  }

  if (options?.allowEmployee) {
    decorators.push(AllowEmployee(options.allowEmployee));
  }
  
  return applyDecorators(...decorators);
}
