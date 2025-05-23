import { RequestStatus } from '@/common/enums/request-status.enum';
import { ScheduleStatus } from '@/common/enums/schedule-status';
import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Schedule } from '../entities/schedule.entity';
import { SchedulesService } from '../schedules.service';
import { AlternativeSchedule } from './entities/alternative-schedule.entity';
import { ScheduleChangeRequest } from './entities/schedule-change-request.entity';

@Injectable()
export class ScheduleChangeRequestsService extends BaseService<ScheduleChangeRequest> {
    protected readonly logger = new Logger(ScheduleChangeRequestsService.name);
    
    constructor(
        @InjectRepository(ScheduleChangeRequest)
        private readonly scheduleChangeRequestsRepository: Repository<ScheduleChangeRequest>,
        @InjectRepository(AlternativeSchedule)
        private readonly alternativeSchedulesRepository: Repository<AlternativeSchedule>,
        private readonly schedulesService: SchedulesService,
        protected readonly usersService: UsersService,
    ) {
        super(scheduleChangeRequestsRepository, usersService);
    }

    async validateScheduleChangeRequest(dto: DeepPartial<ScheduleChangeRequest>): Promise<void> {
        if (!dto.originalSchedules || dto.originalSchedules.length === 0) {
            throw new BadRequestException('Original schedules must be specified');
        }

        if (!dto.alternativeSchedules || dto.alternativeSchedules.length === 0) {
            throw new BadRequestException('Alternative schedules must be specified');
        }

        // Fetch the original schedules to validate
        const scheduleIds = dto.originalSchedules.map(s => s.id).filter(Boolean);
        const schedules = await this.schedulesService.getRepository().find({
            where: { id: In(scheduleIds) },
            relations: ['attendance']
        });

        if (schedules.length !== scheduleIds.length) {
            throw new BadRequestException('One or more schedules do not exist');
        }

        // Check schedules are in the future
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today

        for (const schedule of schedules) {
            // Check schedule is in the future
            const scheduleDate = new Date(schedule.date);
            if (scheduleDate <= now) {
                throw new BadRequestException(`Cannot change schedules from the past or today (${schedule.date})`);
            }
            
            // Check for attendance
            if (schedule.attendance) {
                throw new BadRequestException(`Cannot change schedule (${schedule.date}) that already has attendance records`);
            }
        }
    }

    override async create(createDto: DeepPartial<ScheduleChangeRequest>, createdBy?: string): Promise<ScheduleChangeRequest> {
        await this.validateScheduleChangeRequest(createDto);
        return super.create(createDto, createdBy);
    }

    override async update(id: string, updateDto: DeepPartial<ScheduleChangeRequest>, updatedBy?: string): Promise<ScheduleChangeRequest> {
        if (updateDto.originalSchedules || updateDto.alternativeSchedules) {
            // Get existing request to check status
            const existingRequest = await this.findOneByOrFail({ id });
            if (existingRequest.status !== RequestStatus.PENDING) {
                throw new BadRequestException(`Cannot modify schedules for a request that is ${existingRequest.status}`);
            }
            
            await this.validateScheduleChangeRequest({
                ...existingRequest,
                ...updateDto
            });
        }
        
        return super.update(id, updateDto, updatedBy);
    }

    async applyScheduleChanges(scheduleChangeRequestId: string, userId?: string): Promise<void> {
        const request = await this.scheduleChangeRequestsRepository.findOne({
            where: { id: scheduleChangeRequestId },
            relations: ['originalSchedules', 'alternativeSchedules']
        });
        
        if (!request) {
            throw new NotFoundException('Schedule change request not found');
        }
        
        if (request.status !== RequestStatus.APPROVED) {
            throw new BadRequestException('Cannot apply changes for a request that is not approved');
        }
        
        // Start a transaction
        await this.schedulesService.getRepository().manager.transaction(async transactionalEntityManager => {
            try {
                // Get the employee ID and other details from the first original schedule
                const firstSchedule = request.originalSchedules[0];
                const employeeData = await this.schedulesService.getRepository().findOne({
                    where: { id: firstSchedule.id },
                    relations: ['employee', 'shift', 'cutoff']
                });
                
                if (!employeeData || !employeeData.employee) {
                    throw new BadRequestException('Cannot find employee data for the schedules');
                }
                
                // Soft delete original schedules
                for (const schedule of request.originalSchedules) {
                    await transactionalEntityManager.update(Schedule, schedule.id, { 
                        deletedAt: new Date(),
                        deletedBy: userId,
                        status: ScheduleStatus.CANCELLED
                    });
                    this.logger.log(`Removed original schedule ${schedule.id}`);
                }
                
                // Create new schedules from alternatives
                for (const alternative of request.alternativeSchedules) {
                    const newSchedule = transactionalEntityManager.create(Schedule, {
                        date: alternative.date,
                        startTime: alternative.startTime,
                        endTime: alternative.endTime,
                        breakTime: alternative.breakTime,
                        notes: alternative.notes || `Created from change request ${request.id}`,
                        status: ScheduleStatus.MODIFIED,
                        employee: employeeData.employee,
                        shift: employeeData.shift,
                        cutoff: employeeData.cutoff,
                        createdBy: userId
                    });
                    
                    const savedSchedule = await transactionalEntityManager.save(Schedule, newSchedule);
                    this.logger.log(`Created alternative schedule ${savedSchedule.id}`);
                    
                    // Link the alternative to the resulting schedule
                    await transactionalEntityManager.update(AlternativeSchedule, alternative.id, {
                        resultingSchedule: savedSchedule
                    });
                }
                
                this.logger.log(`Successfully applied schedule changes for request ${scheduleChangeRequestId}`);
            } catch (error: any) {
                this.logger.error(`Failed to apply schedule changes: ${error.message}`, error.stack);
                throw error;
            }
        });
    }
}