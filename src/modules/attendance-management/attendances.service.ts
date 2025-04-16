import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, startOfDay } from 'date-fns';
import { Between, Repository } from 'typeorm';
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

    getEmployeeAttendanceToday(employeeId: string, punchTime: Date) {
        return this.attendancesRepository.findOne({
            where: {
                employee: { id: employeeId },
                timeIn: Between(startOfDay(punchTime), endOfDay(punchTime))
            },
            relations: { employee: true }
        });
    }
}