import { GeneralResponseDto } from '@/common/dtos/generalresponse.dto';
import { createController } from '@/common/factories/create-controller.factory';
import { GetPermissionDto } from './dtos/permission.dto';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';

export class PermissionsController extends createController(Permission, PermissionsService, GetPermissionDto)
{
    override async findOne(id: string, relations?: string, select?: string): Promise<GetPermissionDto> {
        return await super.findOne(id, relations, select);
    }

    override async delete(id: string): Promise<GeneralResponseDto> {
        return await super.delete(id);
    }

    override async deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        return await super.deleteMany(ids, hardDelete);
    }

    override async create(entityDto: null, createdById: string): Promise<GetPermissionDto> {
        return await super.create(entityDto, createdById);
    }

    override async update(id: string, entityDto: null, updatedById: string): Promise<GetPermissionDto> {
        return await super.update(id, entityDto, updatedById);
    }
}