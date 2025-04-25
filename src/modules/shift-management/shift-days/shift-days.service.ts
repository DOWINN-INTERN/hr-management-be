import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftDay } from './entities/shift-day.entity';

@Injectable()
export class ShiftDaysService extends BaseService<ShiftDay> {
    constructor(
        @InjectRepository(ShiftDay)
        private readonly shiftDaysRepository: Repository<ShiftDay>,
        protected readonly usersService: UsersService
    ) {
        super(shiftDaysRepository, usersService);
    }
}