import { ScheduleStatus } from '@/common/enums/schedule-status';
import { BaseService } from '@/common/services/base.service';
import { DayUtils } from '@/common/utils/day.util';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays, format, isBefore, isSameDay, parseISO } from 'date-fns';
import { Between, DeepPartial, In, Repository } from 'typeorm';
import { EmployeesService } from '../employee-management/employees.service';
import { Employee } from '../employee-management/entities/employee.entity';
import { CutoffsService } from '../payroll-management/cutoffs/cutoffs.service';
import { Cutoff } from '../payroll-management/cutoffs/entities/cutoff.entity';
import { Schedule } from './entities/schedule.entity';
import { GroupsService } from './groups/groups.service';
import { HolidaysService } from './holidays/holidays.service';
import { Shift } from './shifts/entities/shift.entity';

@Injectable()
export class SchedulesService extends BaseService<Schedule> {
    constructor(
        @InjectRepository(Schedule)
        private readonly schedulesRepository: Repository<Schedule>,
        protected readonly usersService: UsersService,
        private readonly groupsService: GroupsService,
        private readonly cutoffsService: CutoffsService,
        private readonly holidaysService: HolidaysService,
        private readonly employeesService: EmployeesService
    ) {
        super(schedulesRepository, usersService);
    }

    async getEmployeeScheduleToday(employeeId: string)
    {
      return await this.schedulesRepository.findOne({
        where: {
          employee: { id: employeeId },
          date: parseISO(format(new Date(), 'yyyy-MM-dd'))
        },
        relations: { shift: true, holiday: true, employee: true }
      });
    }

    async generateSchedulesForEmployees(
        employeeIds: string[],
        groupId: string,
        cutoffId: string,
      ): Promise<DeepPartial<Schedule[]>> {
        this.logger.log(`Generating schedules for ${employeeIds.length} employees in group ${groupId}`);
        
        // Get the group with shift
        const group = await this.groupsService.findOneByOrFail(
          { id: groupId },
          { relations: { shift: true } }
        );
        
        if (!group.shift) {
          throw new Error(`Group ${groupId} has no shift assigned`);
        }
        
        // Get cutoff
        const cutoff = await this.cutoffsService.findOneByOrFail({ id: cutoffId });
        
        // Get employees
        const employees = await this.employeesService.getRepository().findBy({
          id: In(employeeIds)
        });
        
        // Generate schedules for each employee
        const generatedSchedules: DeepPartial<Schedule>[] = [];
        
        for (const employee of employees) {
          const schedules = await this.generateSchedulesForEmployee(
            employee,
            group.shift,
            cutoff
          );
          
          generatedSchedules.push(...schedules);
        }
        
        // Save all generated schedules
        return this.schedulesRepository.save(generatedSchedules);
      }
    
      private async generateSchedulesForEmployee(
        employee: Employee,
        shift: Shift,
        cutoff: Cutoff
      ): Promise<DeepPartial<Schedule[]>> {
        const { startDate, endDate } = cutoff;
        const { commencementDate } = employee;
        const { days } = shift;
        
        const schedules: DeepPartial<Schedule>[] = [];

        // Check if employee is already scheduled
        const existingSchedules = await this.findExistingSchedules(
          employee.id,
          cutoff.id,
          startDate,
          endDate
        );

        if (existingSchedules.length > 0) {
          this.logger.warn(`Employee ${employee.id} already has schedules for cutoff ${cutoff.id}`);
          return [];
        }
        else {
            // delete existing schedules
            await this.schedulesRepository.delete({
                employee: { id: employee.id },
                cutoff: { id: cutoff.id },
            });
            this.logger.log(`Deleted existing schedules for employee ${employee.id} for cutoff ${cutoff.id}`);
        }
        
        // Determine the effective start date (max of commencementDate and cutoff.startDate)
        const effectiveStartDate = isBefore(parseISO(commencementDate.toString()), parseISO(startDate.toString())) 
          ? startDate
          : commencementDate;
          
        // Generate schedule for each day in the cutoff period
        let currentDate = new Date(effectiveStartDate);
        const cutoffEndDate = new Date(endDate);
        
        while (isBefore(currentDate, cutoffEndDate) || isSameDay(currentDate, cutoffEndDate)) {
            const dayOfWeek = DayUtils.fromDate(currentDate);
            
            // Check if the day is in the shift's schedule
            if (days.includes(dayOfWeek)) {
                // Check if the current date is a holiday
                const holiday = await this.holidaysService.findOneBy({
                    date: currentDate
                });
                
                // Create a schedule entry
                const scheduleEntry: DeepPartial<Schedule> = {
                    date: new Date(currentDate),
                    status: ScheduleStatus.DEFAULT,
                    employee: { id: employee.id },
                    shift: { id: shift.id },
                    cutoff: { id: cutoff.id },
                };
                
                // If it's a holiday, associate it with the schedule
                if (holiday) {
                    scheduleEntry.holiday = { id: holiday.id };
                }
                
                schedules.push(scheduleEntry);
            }
            
            // Move to the next day
            currentDate = addDays(currentDate, 1);
        }
        
        return schedules;
      }
      
      // Check if a schedule already exists
      async findExistingSchedules(
        employeeId: string,
        cutoffId: string,
        startDate: Date,
        endDate: Date
      ): Promise<Schedule[]> {
        return this.schedulesRepository.find({
          where: {
            employee: { id: employeeId },
            cutoff: { id: cutoffId },
            date: Between(startDate, endDate),
          },
        });
      }
}