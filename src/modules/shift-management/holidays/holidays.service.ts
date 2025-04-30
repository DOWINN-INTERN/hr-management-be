import { BaseService } from '@/common/services/base.service';
import { UsersService } from '@/modules/account-management/users/users.service';
import { ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeepPartial, Repository } from 'typeorm';
import { SchedulesService } from '../schedules/schedules.service';
import { Holiday } from './entities/holiday.entity';

@Injectable()
export class HolidaysService extends BaseService<Holiday> {
    constructor(
        @InjectRepository(Holiday)
        private readonly holidaysRepository: Repository<Holiday>,
        protected readonly usersService: UsersService,
        @Inject(forwardRef(() => SchedulesService))
        private readonly schedulesService: SchedulesService,
    ) {
        super(holidaysRepository, usersService);
    }

    override async create(createDto: DeepPartial<Holiday>, createdBy?: string): Promise<Holiday> {
        // Check if holiday already exists for the same date
        const existingHoliday = await this.holidaysRepository.findOne({
            where: { date: createDto.date as Date }
        });

        if (existingHoliday) {
            throw new ConflictException(`A holiday already exists on ${createDto.date}`);
        }

        // Call the base class create method
        const holiday = await super.create(createDto, createdBy);

        // Find all schedules on this date and link them to the holiday
        await this.linkHolidayToSchedules(holiday);

        return holiday;
    }

    override async update(id: string, updateDto: DeepPartial<Holiday>, updatedBy?: string): Promise<Holiday> {
        // Get existing holiday
        const existingHoliday = await this.findOneByOrFail({ id});
        
        // If date is being updated, check if another holiday exists on the new date
        if (updateDto.date && updateDto.date !== existingHoliday.date) {
            const conflictingHoliday = await this.holidaysRepository.findOne({
                where: { date: updateDto.date as Date }
            });

            if (conflictingHoliday && conflictingHoliday.id !== id) {
                throw new ConflictException(`A holiday already exists on ${updateDto.date}`);
            }
        }

        // Call the base class update method
        const updatedHoliday = await super.update(id, updateDto, updatedBy);

        // If the date was changed, update all schedules for the new date
        if (updateDto.date && updateDto.date !== existingHoliday.date) {
            // Unlink schedules from the old date
            await this.schedulesService.getRepository().update(
                { holiday: { id } },
                { holiday: undefined }
            );
            
            // Link schedules to the new date
            await this.linkHolidayToSchedules(updatedHoliday);
        }

        return updatedHoliday;
    }

    /**
     * Links a holiday to all schedules on the same date
     */
    private async linkHolidayToSchedules(holiday: Holiday): Promise<void> {
        // Create a date range for the entire day
        const startDate = new Date(holiday.date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(holiday.date);
        endDate.setHours(23, 59, 59, 999);

        // Find all schedules on this date
        const schedules = await this.schedulesService.getRepository().find({
            where: {
                date: Between(startDate, endDate)
            }
        });

        // Link the holiday to all schedules
        if (schedules.length > 0) {
            await Promise.all(
                schedules.map(schedule => 
                    this.schedulesService.getRepository().update(schedule.id, { holiday: { id: holiday.id } })
                )
            );
        }
    }
}