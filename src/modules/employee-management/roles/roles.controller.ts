import { createController } from '@/common/factories/create-controller.factory';
import { GetRoleDto, RoleDto, UpdateRoleDto } from './dtos/role.dto';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';

export class RolesController extends createController<
    Role,
    GetRoleDto,
    RoleDto,
    UpdateRoleDto
>(
    'Roles',       // Entity name for Swagger documentation
    RolesService, // The service handling Role-related operations
    GetRoleDto,  // DTO for retrieving Roles
    RoleDto,     // DTO for creating/updating Roles
    UpdateRoleDto // DTO for updating Roles
) {}