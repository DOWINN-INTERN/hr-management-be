import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { DocumentsService } from '@/modules/documents/documents.service';
import { EmployeesService } from '@/modules/employee-management/employees.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkTimeRequestDto } from './dtos/work-time-request.dto';
import { WorkTimeRequest } from './entities/work-time-request.entity';

@Injectable()
export class WorkTimeRequestsService extends BaseService<WorkTimeRequest> {
    constructor(
        @InjectRepository(WorkTimeRequest)
        private readonly workTimeRequestsRepository: Repository<WorkTimeRequest>,
        protected readonly usersService: UsersService,
        private readonly documentsService: DocumentsService,
        private readonly employeesService: EmployeesService,
    ) {
        super(workTimeRequestsRepository, usersService);
    }

    override async validateBefore(dto: WorkTimeRequestDto): Promise<void> {
        // Validate that the worktime request exists and doesn't already have a response
        dto = await this.validateReferences(dto, [
            {
                field: 'documents',
                service: this.documentsService,
                required: true
            },
            {
                field: 'employee',
                service: this.employeesService,
                required: true
            }
        ]);
    }
}