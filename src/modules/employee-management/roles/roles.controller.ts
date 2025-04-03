import { BaseController } from '@/common/controllers/base.controller';
import { Authorize } from '@/common/decorators/authorize.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Override } from '@/common/decorators/override.decorator';
import { Body, Controller, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createPermissions } from '../../../common/factories/create-permissions.factory';
import { GetRoleDto, RoleDto, UpdateRoleDto } from './dtos/role.dto';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';

// Controller permissions
const Permissions = createPermissions('roles');

@ApiTags('Roles')
@Controller()
export class RolesController extends BaseController<Role, GetRoleDto, RoleDto, UpdateRoleDto> {
    constructor(private readonly rolesService: RolesService) {
        super(rolesService, GetRoleDto, 'Roles');
    }

    @Post()
    @Override()
    @Authorize()
    @ApiBody({ type: RoleDto, description: 'Role data' })
    @ApiResponse({ 
        status: HttpStatus.CREATED, 
        description: 'The role has been successfully created.',
        type: GetRoleDto
    })
    override async create(@Body() createRoleDto: RoleDto, @CurrentUser('sub') createdById: string): Promise<GetRoleDto> {
        return super.create(createRoleDto, createdById);
    }

    @Put(':id')
    @Override()
    @ApiBody({ type: UpdateRoleDto, description: 'Role data' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'The role has been successfully updated.',
        type: GetRoleDto 
    })
    override async update(
        @Param('id') id: string,
        @Body() updateRoleDto: UpdateRoleDto,
        @CurrentUser('sub') updatedById: string
    ): Promise<GetRoleDto> {
        return super.update(id, updateRoleDto, updatedById);
    }
}