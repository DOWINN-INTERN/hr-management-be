import { BaseController } from '@/common/controllers/base.controller';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetPermissionDto } from './dtos/get-permission.dto';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';
import { createPermissions } from './utils/create-permissions.utils';

// Controller permissions
export const PermissionPermissions = createPermissions('permissions');
const { Read, Create, Update, Delete } = PermissionPermissions;

@ApiTags('Permissions')
@Controller()
export class PermissionsController extends BaseController<Permission, GetPermissionDto> {
    constructor(private readonly permissionsService: PermissionsService) {
        super(permissionsService, GetPermissionDto);
    }

    override async delete(id: string): Promise<void> {
        await super.delete(id);
    }

    override async deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        await super.deleteMany(ids, hardDelete);
    }
}