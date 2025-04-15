import { GeneralResponseDto } from '@/common/dtos/generalresponse.dto';
import { PaginatedResponseDto } from '@/common/dtos/paginated-response.dto';
import { PaginationDto } from '@/common/dtos/pagination.dto';
import { createController } from '@/common/factories/create-controller.factory';
import { GetProfileDto, ProfileDto, UpdateProfileDto } from './dtos/profile.dto';
import { Profile } from './entities/profile.entity';
import { ProfilesService } from './profiles.service';

export class ProfilesController extends createController<
    Profile,
    GetProfileDto,
    ProfileDto,
    UpdateProfileDto
>(
    'Profiles',       // Entity name for Swagger documentation
    ProfilesService, // The service handling Profile-related operations
    GetProfileDto,  // DTO for retrieving profiles
    ProfileDto,     // DTO for creating profiles
    UpdateProfileDto, // DTO for updating profiles
) {
    override findAllAdvanced(paginationDto: PaginationDto<Profile>): Promise<PaginatedResponseDto<GetProfileDto>> {
        return super.findAllAdvanced(paginationDto);
    }

    override async findOne(id: string): Promise<GetProfileDto> {
        return await super.findOne(id);
    }

    override delete(id: string): Promise<GeneralResponseDto> {
        return super.delete(id);
    }
    
    override deleteMany(ids: string[], hardDelete?: boolean): Promise<void> {
        return super.deleteMany(ids, hardDelete);
    }
}