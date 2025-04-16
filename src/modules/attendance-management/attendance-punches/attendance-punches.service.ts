import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendancePunches } from './entities/attendance-punch.entity';

@Injectable()
export class AttendancePunchesService extends BaseService<AttendancePunches> {
    constructor(
        @InjectRepository(AttendancePunches)
        private readonly attendancePunchesRepository: Repository<AttendancePunches>,
        protected readonly usersService: UsersService
    ) {
        super(attendancePunchesRepository, usersService);
    }
}