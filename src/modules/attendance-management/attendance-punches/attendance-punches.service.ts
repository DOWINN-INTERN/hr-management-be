import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendancePunch } from './entities/attendance-punch.entity';

@Injectable()
export class AttendancePunchesService extends BaseService<AttendancePunch> {
    constructor(
        @InjectRepository(AttendancePunch)
        private readonly attendancePunchesRepository: Repository<AttendancePunch>,
        protected readonly usersService: UsersService
    ) {
        super(attendancePunchesRepository, usersService);
    }
}