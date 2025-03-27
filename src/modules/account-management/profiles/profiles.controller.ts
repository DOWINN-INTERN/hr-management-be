import { BaseController } from '@/common/controllers/base.controller';
import { Authorize } from '@/common/decorators/authorize.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Override } from '@/common/decorators/override.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createPermissions } from '../../employee-management/roles/permissions/utils/create-permissions.utils';
import { GetProfileDto, ProfileDto, UpdateProfileDto } from './dtos/profile.dto';
import { Profile } from './entities/profile.entity';
import { ProfilesService } from './profiles.service';

// Controller permissions
export const ProfilePermissions = createPermissions('profiles');
const { Read, Create, Update, Delete } = ProfilePermissions;

@ApiTags('Profiles')
@Controller()
export class ProfilesController extends BaseController<Profile, GetProfileDto, ProfileDto, UpdateProfileDto> {
    constructor(private readonly profilesService: ProfilesService) {
        super(profilesService, GetProfileDto);
    }

    @Post()
    @Authorize()
    @Override()
    override async create(@Body() createDto: ProfileDto, @CurrentUser('sub') createdById: string): Promise<GetProfileDto> {
        return super.create(createDto, createdById);
    }
}