import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { <%= classify(entityName) %> } from './entities/<%= dasherize(entityName) %>.entity';

@Injectable()
export class <%= classify(moduleName) %>Service extends BaseService<<%= classify(entityName) %>> {
    constructor(
        @InjectRepository(<%= classify(entityName) %>)
        private readonly <%= camelize(moduleName) %>Repository: Repository<<%= classify(entityName) %>>,
        protected readonly usersService: UsersService
    ) {
        super(<%= camelize(moduleName) %>Repository, usersService);
    }
}