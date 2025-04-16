import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BiometricDevice } from '../entities/biometric-device.entity';

@Injectable()
export class BiometricDevicesService extends BaseService<BiometricDevice> {
    constructor(
        @InjectRepository(BiometricDevice)
        private readonly biometricDevicesRepository: Repository<BiometricDevice>,
        protected readonly usersService: UsersService
    ) {
        super(biometricDevicesRepository, usersService);
    }
}