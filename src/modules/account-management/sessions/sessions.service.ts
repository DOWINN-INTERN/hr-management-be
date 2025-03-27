
import { BaseService } from '@/common/services/base.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService extends BaseService<Session> {
    constructor(
        @InjectRepository(Session)
        private readonly sessionsRepository: Repository<Session>,
        protected readonly usersService: UsersService
    ) {
        super(sessionsRepository, usersService);
    }
}
