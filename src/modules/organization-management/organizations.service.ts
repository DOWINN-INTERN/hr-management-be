import { BaseService } from '@/common/services/base.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../account-management/users/users.service';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService extends BaseService<Organization> {
    constructor(
        @InjectRepository(Organization)
        private readonly organizationsRepository: Repository<Organization>,
        protected readonly usersService: UsersService
    ) {
        super(organizationsRepository, usersService);
    }

    // Check if branch exists in organization
    async isBranchInOrganization(organizationId: string, branchId: string): Promise<boolean> {
        const organization = await this.organizationsRepository.findOneOrFail({
            where: { id: organizationId },
            relations: {
                branches: true,
            }
        });
        return organization.branches?.some(branch => branch.id === branchId) || false;
    }
}
