import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { WorkTimeRequest } from './entities/work-time-request.entity';

@Injectable()
export class WorkTimeRequestsService extends BaseService<WorkTimeRequest> {
    constructor(
        @InjectRepository(WorkTimeRequest)
        private readonly workTimeRequestsRepository: Repository<WorkTimeRequest>,
        protected readonly usersService: UsersService
    ) {
        super(workTimeRequestsRepository, usersService);
    }

    override async update(id: string, updateDto: DeepPartial<WorkTimeRequest>, updatedBy?: string): Promise<WorkTimeRequest> {
        // Perform any additional logic before updating
        // For example, you might want to check if the request is already approved or denied
        

        // Call the base class update method
        return super.update(id, updateDto, updatedBy);  
    }
}