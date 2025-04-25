import { CutoffStatus } from '@/common/enums/cutoff-status.enum';
import { Day } from '@/common/enums/day.enum';
import { CutoffsService } from '@/modules/payroll-management/cutoffs/cutoffs.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GroupsService } from '../groups/groups.service';
import { ShiftDaysService } from '../shift-days/shift-days.service';
import { ShiftsService } from '../shifts.service';

@Injectable()
export class DefaultShiftsSeeder implements OnModuleInit {
  private readonly logger = new Logger(DefaultShiftsSeeder.name);

  constructor(
    private readonly shiftsService: ShiftsService,
    private readonly shiftDaysService: ShiftDaysService,
    private readonly groupsService: GroupsService,
    private readonly cutoffsService: CutoffsService
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    this.logger.log('Seeding default shifts and groups...');
    
    // Check if default shift already exists
    const existingShifts = await this.shiftsService.getRepository().count();
    if (existingShifts === 0) {
      // Find or create a default cutoff to associate with shifts
      let defaultCutoff = await this.cutoffsService.findOneBy({
        status: CutoffStatus.PENDING
      }) || await this.cutoffsService.getActiveCutoff();

      if (!defaultCutoff) {
        throw new Error('No active cutoff found. Please create a cutoff first.');
      }
      
      // 1. Create standard day shift
      const dayShift = await this.shiftsService.create({
        name: 'Standard Day Shift',
        description: 'Regular 9-6 workday with 1 hour break',
        defaultStartTime: '09:00:00',
        defaultEndTime: '18:00:00',
        defaultBreakTime: 60,
        defaultDuration: 8,
        days: [{
          
        }], // Will add days separately
        cutoffs: [{ id: defaultCutoff.id }]
      });
      
      // Add day-specific configurations for the day shift
      const weekdays = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];
      for (const day of weekdays) {
        await this.shiftDaysService.create({
          day,
          startTime: '09:00:00',
          endTime: '18:00:00',
          breakTime: 60,
          duration: 8,
          isOvernight: false,
          shift: { id: dayShift.id } // Use shift object instead of shiftId
        });
      }
      
      this.logger.log(`Created day shift: ${dayShift.id}`);
      
      // Create default group for day shift
      const dayGroup = await this.groupsService.create({
        name: 'Standard Day Shift Group',
        description: 'Default group working standard office hours',
        shift: dayShift,
      });
      
      this.logger.log(`Created day shift group: ${dayGroup.id}`);
  
      // 2. Create night shift with overnight flag
      const nightShift = await this.shiftsService.create({
        name: 'Night Shift',
        description: 'Evening to midnight shift',
        defaultStartTime: '16:00:00',
        defaultEndTime: '00:00:00',
        defaultBreakTime: 45,
        defaultDuration: 7.25,
        days: [], // Will add days separately
        cutoffs: [{ id: defaultCutoff.id }]
      });
      
      // Add day-specific configurations for night shift
      for (const day of weekdays) {
        await this.shiftDaysService.create({
          day,
          startTime: '16:00:00',
          endTime: '00:00:00',
          breakTime: 45,
          duration: 7.25,
          isOvernight: true, // This shift crosses midnight
          shift: { id: nightShift.id } // Use shift object instead of shiftId
        });
      }
      
      this.logger.log(`Created night shift: ${nightShift.id}`);
      
      // Create night shift group
      const nightGroup = await this.groupsService.create({
        name: 'Night Shift Group',
        description: 'Group working evening to midnight hours',
        shift: nightShift,
      });
      
      this.logger.log(`Created night shift group: ${nightGroup.id}`);
  
      // 3. Create graveyard shift
      const graveyardShift = await this.shiftsService.create({
        name: 'Graveyard Shift',
        description: 'Midnight to morning shift',
        defaultStartTime: '00:00:00',
        defaultEndTime: '08:00:00',
        defaultBreakTime: 30,
        defaultDuration: 7.5,
        days: [], // Will add days separately
        cutoffs: [{ id: defaultCutoff.id }]
      });
      
      // Add day-specific configurations for graveyard shift
      for (const day of weekdays) {
        await this.shiftDaysService.create({
          day,
          startTime: '00:00:00',
          endTime: '08:00:00',
          breakTime: 30,
          duration: 7.5,
          isOvernight: false, // Although this is a night shift, it doesn't cross midnight
          shift: { id: graveyardShift.id } // Use shift object instead of shiftId
        });
      }
      
      this.logger.log(`Created graveyard shift: ${graveyardShift.id}`);
      
      // Create graveyard shift group
      const graveyardGroup = await this.groupsService.create({
        name: 'Graveyard Shift Group',
        description: 'Group working overnight hours',
        shift: graveyardShift,
      });
      
      this.logger.log(`Created graveyard shift group: ${graveyardGroup.id}`);
      
      // 4. Create a weekend shift with different hours
      const weekendShift = await this.shiftsService.create({
        name: 'Weekend Shift',
        description: 'Weekend coverage with different hours',
        defaultStartTime: '10:00:00',
        defaultEndTime: '16:00:00',
        defaultBreakTime: 30,
        defaultDuration: 5.5,
        days: [], // Will add days separately
        cutoffs: [{ id: defaultCutoff.id }]
      });
      
      // Add weekend-specific configurations
      for (const day of [Day.SATURDAY, Day.SUNDAY]) {
        await this.shiftDaysService.create({
          day,
          startTime: '10:00:00',
          endTime: '16:00:00',
          breakTime: 30,
          duration: 5.5,
          isOvernight: false,
          shift: { id: weekendShift.id } // Use shift object instead of shiftId
        });
      }
      
      this.logger.log(`Created weekend shift: ${weekendShift.id}`);
      
      // Create weekend shift group
      const weekendGroup = await this.groupsService.create({
        name: 'Weekend Shift Group',
        description: 'Group working weekend hours',
        shift: weekendShift,
      });
      
      this.logger.log(`Created weekend shift group: ${weekendGroup.id}`);
      
      // 5. Create a flexible shift with different hours for different days
      const flexShift = await this.shiftsService.create({
        name: 'Flexible Shift',
        description: 'Different hours each day of the week',
        defaultStartTime: '09:00:00',
        defaultEndTime: '17:00:00',
        defaultBreakTime: 45,
        defaultDuration: 7.25,
        days: [], // Will add days separately
        cutoffs: [{ id: defaultCutoff.id }]
      });
      
      // Define different schedules for each day
      const flexSchedules = [
        { day: Day.MONDAY, start: '08:00:00', end: '16:00:00', break: 60, duration: 7 },
        { day: Day.TUESDAY, start: '09:00:00', end: '17:00:00', break: 45, duration: 7.25 },
        { day: Day.WEDNESDAY, start: '10:00:00', end: '18:00:00', break: 45, duration: 7.25 },
        { day: Day.THURSDAY, start: '09:00:00', end: '17:00:00', break: 45, duration: 7.25 },
        { day: Day.FRIDAY, start: '08:00:00', end: '14:00:00', break: 30, duration: 5.5 },
      ];
      
      // Add flexible day-specific configurations
      for (const schedule of flexSchedules) {
        await this.shiftDaysService.create({
          day: schedule.day,
          startTime: schedule.start,
          endTime: schedule.end,
          breakTime: schedule.break,
          duration: schedule.duration,
          isOvernight: false,
          shift: { id: flexShift.id } // Use shift object instead of shiftId
        });
      }
      
      this.logger.log(`Created flexible shift: ${flexShift.id}`);
      
      // Create flexible shift group
      const flexGroup = await this.groupsService.create({
        name: 'Flexible Shift Group',
        description: 'Group with different hours each day',
        shift: flexShift,
      });
      
      this.logger.log(`Created flexible shift group: ${flexGroup.id}`);
      
    } else {
      this.logger.log('Shifts already exist, skipping seeder');
    }
  }
}