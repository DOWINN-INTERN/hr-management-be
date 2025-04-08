import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';

@Injectable()
export class AttendancesService extends BaseService<Attendance> {
    constructor(
        @InjectRepository(Attendance)
        private readonly attendancesRepository: Repository<Attendance>,
        protected readonly usersService: UsersService
    ) {
        super(attendancesRepository, usersService);
    }
}