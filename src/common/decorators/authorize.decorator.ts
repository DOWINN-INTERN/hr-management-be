import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { applyDecorators, SetMetadata, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Action } from '../enums/action.enum';
import { ScopeGuard } from '../guards/scope.guard';
import { ScopeInterceptor } from '../interceptors/scope.interceptor';
import { IPermission } from '../interfaces/permission.interface';
import { AccessOptions } from './departments.decorator';
import { Permissions } from './permissions.decorator';
import { Roles } from './roles.decorator';

export const PERMISSIONS_FUNCTION_KEY = 'permissions_function';
export const PERMISSION_ENDPOINT_TYPE = 'permission_endpoint_type';

export interface AuthorizeOptions extends Omit<AccessOptions, 'permissions'> {
  permissions?: IPermission[];
  endpointType?: Action;
}

export function Authorize(options?: AuthorizeOptions): MethodDecorator {
  const decorators = [
    UseInterceptors(ScopeInterceptor),
    UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, ScopeGuard),
    Roles(options?.roles),
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
  
  return applyDecorators(...decorators);
}
