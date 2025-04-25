import { ScheduleStatus } from '@/common/enums/schedule-status';
import { BaseService } from '@/common/services/base.service';
import { DayUtils } from '@/common/utils/day.util';
import { UsersService } from '@/modules/account-management/users/users.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays, format, isBefore, isSameDay, parseISO } from 'date-fns';
import { Between, DeepPartial, In, MoreThanOrEqual, Repository } from 'typeorm';
import { EmployeesService } from '../../employee-management/employees.service';
import { Employee } from '../../employee-management/entities/employee.entity';
import { CutoffsService } from '../../payroll-management/cutoffs/cutoffs.service';
import { Cutoff } from '../../payroll-management/cutoffs/entities/cutoff.entity';
import { Shift } from '../entities/shift.entity';
import { GroupsService } from '../groups/groups.service';
import { HolidaysService } from '../holidays/holidays.service';
import { Schedule } from './entities/schedule.entity';

export interface ScheduleDeletionParams {
  employeeIds: string[];
  groupId: string;
  cutoffId: string;
}

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

  /**
   * Delete future schedules (starting from tomorrow) for employees in a specific group and cutoff
   * Uses hard delete to permanently remove the records
   */
  async deleteSchedules(params: ScheduleDeletionParams): Promise<void> {
    const { employeeIds, groupId, cutoffId } = params;
    
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to beginning of day
    
    this.logger.log(
      `Deleting future schedules (from ${tomorrow.toISOString().split('T')[0]}) for ${employeeIds.length} employees in group ${groupId} for cutoff ${cutoffId}`
    );
    
    try {
      // Delete schedules matching our criteria, but only from tomorrow onwards
      const result = await this.schedulesRepository.delete({
        employee: { id: In(employeeIds) },
        cutoff: { id: cutoffId },
        date: MoreThanOrEqual(tomorrow)
      });
      
      this.logger.log(`Deleted ${result.affected || 0} future schedules for employees from group ${groupId}`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to delete future schedules: ${error.message}`, 
          error.stack
        );
      } else {
        this.logger.error(`Failed to delete future schedules: Unknown error`);
      }
      throw error;
    }
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
        
        const schedules: DeepPartial<Schedule>[] = [];
      
        // Delete existing schedules for this employee and cutoff
        await this.deleteSchedules({
          employeeIds: [employee.id],
          groupId: employee.group!.id,
          cutoffId: cutoff.id,
        })
        
        // Get today and tomorrow dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Parse dates
        const parsedCommencementDate = parseISO(commencementDate.toString());
        const parsedCutoffStartDate = parseISO(startDate.toString());
        
        // Determine effective start date based on the new logic:
        // - If cutoff start date is in the future, use it
        // - Otherwise use tomorrow
        let baseStartDate;
        if (parsedCutoffStartDate > today) {
          this.logger.log(`Using future cutoff start date: ${format(parsedCutoffStartDate, 'yyyy-MM-dd')}`);
          baseStartDate = parsedCutoffStartDate;
        } else {
          this.logger.log(`Cutoff already started, using tomorrow: ${format(tomorrow, 'yyyy-MM-dd')}`);
          baseStartDate = tomorrow;
        }
        
        // Still respect employee's commencement date
        let effectiveStartDate = new Date(Math.max(
          baseStartDate.getTime(),
          parsedCommencementDate.getTime()
        ));
        
        this.logger.log(`Effective schedule start date: ${format(effectiveStartDate, 'yyyy-MM-dd')}`);
        
        // Generate schedule for each day in the cutoff period
        let currentDate = new Date(effectiveStartDate);
        const cutoffEndDate = new Date(endDate);
        
        while (isBefore(currentDate, cutoffEndDate) || isSameDay(currentDate, cutoffEndDate)) {
          const dayOfWeek = DayUtils.fromDate(currentDate);
          
          // Find if this day is in the shift's schedule
          const shiftDay = shift.days.find(day => day.day === dayOfWeek);
          
          if (shiftDay) {
            // Check if the current date is a holiday
            const holiday = await this.holidaysService.findOneBy({
              date: currentDate
            });
            
            // Create a schedule entry with specific shift details for this day
            const scheduleEntry: DeepPartial<Schedule> = {
              date: new Date(currentDate),
              status: ScheduleStatus.DEFAULT,
              employee: { id: employee.id },
              shift: { id: shift.id },
              cutoff: { id: cutoff.id },
              startTime: shiftDay.startTime || shift.defaultStartTime,
              endTime: shiftDay.endTime || shift.defaultEndTime,
              breakTime: shiftDay.breakTime || shift.defaultBreakTime,
              duration: shiftDay.duration || shift.defaultDuration,
              
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