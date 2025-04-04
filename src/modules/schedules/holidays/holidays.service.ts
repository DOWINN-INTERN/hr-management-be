import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from './entities/holiday.entity';

@Injectable()
export class HolidaysService extends BaseService<Holiday> {
    constructor(
        @InjectRepository(Holiday)
        private readonly holidaysRepository: Repository<Holiday>,
        protected readonly usersService: UsersService
    ) {
        super(holidaysRepository, usersService);
    }
}