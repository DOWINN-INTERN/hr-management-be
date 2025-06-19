import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchesService extends BaseService<Branch> {
    constructor(
        @InjectRepository(Branch)
        private readonly branchesRepository: Repository<Branch>,
        protected readonly usersService: UsersService
    ) {
        super(branchesRepository, usersService);
    }

    // Get branch organization
    async getBranchOrganization(branchId: string): Promise<string> {
        const branch = await this.branchesRepository.findOneOrFail({
            where: { id: branchId },
            relations: {
                organization: true,
            }
        });

        return branch.organization.id;
    }

    // Check if department exists in branch
    async isDepartmentInBranch(branchId: string, departmentId: string): Promise<boolean> {
        const branch = await this.branchesRepository.findOneOrFail({
            where: { id: branchId },
            relations: {
                departments: true,
            }
        });

        return branch.departments?.some(department => department.id === departmentId) || false;
    }
}
