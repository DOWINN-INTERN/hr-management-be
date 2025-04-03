import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Action } from '../enums/action.enum';
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
  if (options?.endpointType) {
    return applyDecorators(
      UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard),
      Roles(options?.roles),
      SetMetadata(PERMISSION_ENDPOINT_TYPE, options.endpointType),
      ApiBearerAuth('access-token'),
    );
  }
  
  // For regular array-based permissions
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard),
    Roles(options?.roles),
    Permissions(options?.permissions),
    ApiBearerAuth('access-token'),
  );
}
