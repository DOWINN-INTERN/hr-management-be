import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from './entities/shift.entity';

@Injectable()
export class ShiftsService extends BaseService<Shift> {
    constructor(
        @InjectRepository(Shift)
        private readonly shiftsRepository: Repository<Shift>,
        protected readonly usersService: UsersService
    ) {
        super(shiftsRepository, usersService);
    }
}