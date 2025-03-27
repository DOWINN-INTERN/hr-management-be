import { BaseController } from '@/common/controllers/base.controller';
import { Authorize } from '@/common/decorators/authorize.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Override } from '@/common/decorators/override.decorator';
import { createPermissions } from '@/modules/employee-management/roles/permissions/utils/create-permissions.utils';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { GetAddressDto, UpdateAddressDto } from './dtos/address.dto';
import { Address } from './entities/address.entity';

// Controller permissions
export const ProfilePermissions = createPermissions('profiles');
const { Read, Create, Update, Delete } = ProfilePermissions;

@ApiTags('Addresses')
@Controller()
export class AddressesController extends BaseController<Address, GetAddressDto, AddressesService, UpdateAddressDto> {
    constructor(private readonly AddressesService: AddressesService) {
        super(AddressesService, GetAddressDto);
    }

    @Post()
    @Authorize()
    @Override()
    override async create(@Body() createDto: AddressesService, @CurrentUser('sub') createdById: string): Promise<GetAddressDto> {
        return super.create(createDto, createdById);
    }
}