import { BaseService } from '@/common/services/base.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfilesService extends BaseService<Profile> {
    constructor(
        @InjectRepository(Profile)
        private readonly ProfilesRepository: Repository<Profile>,
        protected readonly usersService: UsersService
    ) {
        super(ProfilesRepository, usersService);
    }
}
