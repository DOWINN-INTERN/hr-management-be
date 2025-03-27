import { Role } from '@/common/enums/role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessOptions } from './departments.decorator';
import { Permissions } from './permissions.decorator';
import { Roles } from './roles.decorator';


export function Authorize(options?: AccessOptions): MethodDecorator {
    // Create a roles array that always includes SUPER_ADMIN
    const roles = options?.roles ? [...options.roles, Role.SUPERADMIN] : [Role.SUPERADMIN];
    return applyDecorators(
      UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard),
      Roles(roles),
      Permissions(options?.permissions),
      ApiBearerAuth('access-token'),
    );
}
