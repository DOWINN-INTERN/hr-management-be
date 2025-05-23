import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Organization } from '@/modules/organization-management/entities/organization.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceConfiguration } from './entities/attendance-configuration.entity';

@Injectable()
export class AttendanceConfigurationsService extends BaseService<AttendanceConfiguration> {
    constructor(
        @InjectRepository(AttendanceConfiguration)
        private readonly attendanceConfigurationsRepository: Repository<AttendanceConfiguration>,
        protected readonly usersService: UsersService
    ) {
        super(attendanceConfigurationsRepository, usersService);
    }

    async getGlobalAttendanceConfiguration(): Promise<AttendanceConfiguration> {
        const globalConfig = await this.findOneBy({ organization: undefined }, { relations: { organization: true } });
        if (!globalConfig) {
            return this.create({});
        }
        return globalConfig;
    }

    async getOrganizationAttendanceConfiguration(organizationId?: string): Promise<AttendanceConfiguration> {
        const organizationConfig = await this.findOneBy({ organization: new Organization({ id: organizationId }) }, { relations: { organization: true } });
        if (!organizationConfig) {
            return await this.getGlobalAttendanceConfiguration();
        }
        return organizationConfig;
    }

    async updateGlobalAttendanceConfiguration(data: Partial<AttendanceConfiguration>): Promise<AttendanceConfiguration> {
        const globalConfig = await this.getGlobalAttendanceConfiguration();
        return this.update(globalConfig.id, data);
    }
}