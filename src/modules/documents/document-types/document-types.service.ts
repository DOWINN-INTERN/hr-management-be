import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from './entities/document-type.entity';

@Injectable()
export class DocumentTypesService extends BaseService<DocumentType> {
    constructor(
        @InjectRepository(DocumentType)
        private readonly documentTypesRepository: Repository<DocumentType>,
        protected readonly usersService: UsersService
    ) {
        super(documentTypesRepository, usersService);
    }
}