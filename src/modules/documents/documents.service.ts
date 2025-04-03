import { BaseService } from '@/common/services/base.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../account-management/users/users.service';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService extends BaseService<Document> {
    constructor(
        @InjectRepository(Document)
        private readonly documentsRepository: Repository<Document>,
        protected readonly usersService: UsersService
    ) {
        super(documentsRepository, usersService);
    }
}

