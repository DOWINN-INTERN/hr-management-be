import { createController } from '@/common/factories/create-controller.factory';
import { GetOrganizationDto, OrganizationDto, UpdateOrganizationDto } from './dtos/organization.dto';
import { Organization } from './entities/organization.entity';
import { OrganizationsService } from './organizations.service';

export class OrganizationsController extends createController<
    Organization,
    GetOrganizationDto,
    OrganizationDto,
    UpdateOrganizationDto
>(
    'Organizations',
    OrganizationsService,
    GetOrganizationDto,
    OrganizationDto,
    UpdateOrganizationDto
) {

}