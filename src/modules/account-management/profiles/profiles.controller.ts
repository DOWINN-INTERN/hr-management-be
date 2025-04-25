import { GeneralResponseDto } from '@/common/dtos/generalresponse.dto';
import { PaginatedResponseDto } from '@/common/dtos/paginated-response.dto';
import { PaginationDto } from '@/common/dtos/pagination.dto';
import { createController } from '@/common/factories/create-controller.factory';
import { GetProfileDto, ProfileDto, UpdateProfileDto } from './dtos/profile.dto';
import { Profile } from './entities/profile.entity';
import { ProfilesService } from './profiles.service';

export class ProfilesController extends createController(Profile, ProfilesService, GetProfileDto, ProfileDto, UpdateProfileDto)
{
    override findAllAdvanced(paginationDto: PaginationDto<Profile>): Promise<PaginatedResponseDto<GetProfileDto>> {
        return super.findAllAdvanced(paginationDto);
    }

    override async findOne(id: string): Promise<GetProfileDto> {
        return await super.findOne(id);
    }
    
    override async softDelete(id: string, deletedBy: string): Promise<GeneralResponseDto> {
        return super.softDelete(id, deletedBy);
    }

    override async delete(id: string): Promise<GeneralResponseDto> {
        return super.delete(id);
    }

    override deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        return super.deleteMany(ids, hardDelete);
    }
}