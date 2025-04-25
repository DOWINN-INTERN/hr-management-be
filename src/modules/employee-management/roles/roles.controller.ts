import { createController } from '@/common/factories/create-controller.factory';
import { GetRoleDto, RoleDto, UpdateRoleDto } from './dtos/role.dto';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';

export class RolesController extends createController(Role, RolesService, GetRoleDto, RoleDto, UpdateRoleDto)
{
    
}